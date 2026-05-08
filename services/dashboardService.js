const { studyConfigs, getStudyAssignmentField, getStudyDateFields } = require('../helpers/studyRegistry');
const Clientes = require('../models/clientes');
const Profesionales = require('../models/profesionales');

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const buildIfNullChain = (fields = [], fallback = null) => {
  if (!Array.isArray(fields) || fields.length === 0) {
    return fallback;
  }

  return fields.reduceRight((accumulator, field) => ({
    $ifNull: [`$${field}`, accumulator],
  }), fallback);
};

const buildReferenceArrayExpr = (fieldName) => {
  const fieldExpr = `$${fieldName}`;

  return {
    $let: {
      vars: {
        value: { $ifNull: [fieldExpr, null] },
      },
      in: {
        $cond: [
          { $isArray: '$$value' },
          '$$value',
          {
            $cond: [
              { $eq: ['$$value', null] },
              [],
              ['$$value'],
            ],
          },
        ],
      },
    },
  };
};

const buildNormalizedStatusExpr = (config) => {
  const rawStatusExpr = buildIfNullChain(config.statusFields || ['estado', 'estadoVigencia', 'cumplimiento'], '');

  return {
    $let: {
      vars: {
        rawStatus: {
          $trim: {
            input: { $ifNull: [rawStatusExpr, ''] },
          },
        },
      },
      in: {
        $switch: {
          branches: [
            {
              case: { $regexMatch: { input: '$$rawStatus', regex: 'pendiente', options: 'i' } },
              then: 'Pendiente',
            },
            {
              case: { $regexMatch: { input: '$$rawStatus', regex: 'vencid', options: 'i' } },
              then: 'Vencido',
            },
            {
              case: { $regexMatch: { input: '$$rawStatus', regex: 'por\\s+vencer', options: 'i' } },
              then: 'Por vencer',
            },
            {
              case: { $regexMatch: { input: '$$rawStatus', regex: 'vigente|finaliz|completad', options: 'i' } },
              then: 'Finalizado',
            },
          ],
          default: {
            $cond: [
              { $eq: ['$$rawStatus', ''] },
              'Sin estado',
              '$$rawStatus',
            ],
          },
        },
      },
    },
  };
};

const buildDueDateExpr = (config) => buildIfNullChain(getStudyDateFields(config), null);

const buildBaseProjectionStage = (config) => ({
  $project: {
    normalizedStatus: buildNormalizedStatusExpr(config),
    dueDate: buildDueDateExpr(config),
    assignmentRefs: buildReferenceArrayExpr(getStudyAssignmentField(config)),
    clientRefs: buildReferenceArrayExpr('cliente'),
    createdAt: { $ifNull: ['$createdAt', null] },
  },
});

const getLastTwelveMonths = () => {
  const months = [];
  const current = new Date();
  current.setDate(1);
  current.setHours(0, 0, 0, 0);

  for (let index = 11; index >= 0; index -= 1) {
    const monthStart = new Date(current.getFullYear(), current.getMonth() - index, 1);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);

    months.push({
      key: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
      label: MONTH_NAMES[monthStart.getMonth()],
      year: monthStart.getFullYear(),
      start: monthStart,
      end: monthEnd,
    });
  }

  return months;
};

const getDashboardMetrics = async () => {
  const now = new Date();
  const weekLimit = new Date(now);
  weekLimit.setDate(weekLimit.getDate() + 7);

  const monthBuckets = getLastTwelveMonths();
  const firstMonthStart = monthBuckets[0].start;

  const perModelResults = await Promise.all(
    studyConfigs.map(async (config) => {
      const { model } = config;
      if (typeof model?.aggregate !== 'function') {
        return null;
      }

      const baseProjection = buildBaseProjectionStage(config);

      const [kpisRows, statusRows, monthRows, professionalRows, clientRows, typeRows] = await Promise.all([
        model.aggregate([
          baseProjection,
          {
            $group: {
              _id: null,
              totalEstudios: { $sum: 1 },
              estudiosPendientes: {
                $sum: { $cond: [{ $eq: ['$normalizedStatus', 'Pendiente'] }, 1, 0] },
              },
              estudiosFinalizados: {
                $sum: { $cond: [{ $eq: ['$normalizedStatus', 'Finalizado'] }, 1, 0] },
              },
              estudiosVencidos: {
                $sum: {
                  $cond: [
                    {
                      $or: [
                        { $eq: ['$normalizedStatus', 'Vencido'] },
                        {
                          $and: [
                            { $ne: ['$dueDate', null] },
                            { $lt: ['$dueDate', now] },
                          ],
                        },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              estudiosSinProfesional: {
                $sum: {
                  $cond: [{ $eq: [{ $size: '$assignmentRefs' }, 0] }, 1, 0],
                },
              },
              vencenEstaSemana: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ['$dueDate', null] },
                        { $gte: ['$dueDate', now] },
                        { $lte: ['$dueDate', weekLimit] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]),
        model.aggregate([
          baseProjection,
          {
            $group: {
              _id: '$normalizedStatus',
              total: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              status: '$_id',
              total: 1,
            },
          },
        ]),
        model.aggregate([
          {
            $project: {
              createdAt: { $ifNull: ['$createdAt', null] },
            },
          },
          {
            $match: {
              createdAt: { $gte: firstMonthStart },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              total: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              year: '$_id.year',
              month: '$_id.month',
              total: 1,
            },
          },
        ]),
        model.aggregate([
          baseProjection,
          {
            $unwind: {
              path: '$assignmentRefs',
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $group: {
              _id: '$assignmentRefs',
              total: { $sum: 1 },
            },
          },
        ]),
        model.aggregate([
          baseProjection,
          {
            $unwind: {
              path: '$clientRefs',
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $group: {
              _id: '$clientRefs',
              total: { $sum: 1 },
            },
          },
        ]),
        model.aggregate([
          baseProjection,
          {
            $group: {
              _id: null,
              pendientes: {
                $sum: { $cond: [{ $eq: ['$normalizedStatus', 'Pendiente'] }, 1, 0] },
              },
              finalizados: {
                $sum: { $cond: [{ $eq: ['$normalizedStatus', 'Finalizado'] }, 1, 0] },
              },
              vencidos: {
                $sum: {
                  $cond: [
                    {
                      $or: [
                        { $eq: ['$normalizedStatus', 'Vencido'] },
                        {
                          $and: [
                            { $ne: ['$dueDate', null] },
                            { $lt: ['$dueDate', now] },
                          ],
                        },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]),
      ]);

      return {
        config,
        kpis: kpisRows[0] || null,
        statuses: statusRows,
        months: monthRows,
        professionals: professionalRows,
        clients: clientRows,
        type: typeRows[0] || { pendientes: 0, finalizados: 0, vencidos: 0 },
      };
    })
  );

  const validResults = perModelResults.filter(Boolean);

  const statusMap = new Map();
  const monthMap = new Map(monthBuckets.map((bucket) => [bucket.key, 0]));
  const professionalMap = new Map();
  const clientMap = new Map();

  const kpis = {
    totalEstudios: 0,
    estudiosPendientes: 0,
    estudiosFinalizados: 0,
    estudiosVencidos: 0,
    estudiosSinProfesional: 0,
    vencenEstaSemana: 0,
  };

  const estudiosPorTipo = validResults.map(({ config, type }) => ({
    type: config.label,
    pendientes: type?.pendientes || 0,
    finalizados: type?.finalizados || 0,
    vencidos: type?.vencidos || 0,
  }));

  validResults.forEach(({ kpis: modelKpis, statuses, months, professionals, clients }) => {
    if (modelKpis) {
      kpis.totalEstudios += modelKpis.totalEstudios || 0;
      kpis.estudiosPendientes += modelKpis.estudiosPendientes || 0;
      kpis.estudiosFinalizados += modelKpis.estudiosFinalizados || 0;
      kpis.estudiosVencidos += modelKpis.estudiosVencidos || 0;
      kpis.estudiosSinProfesional += modelKpis.estudiosSinProfesional || 0;
      kpis.vencenEstaSemana += modelKpis.vencenEstaSemana || 0;
    }

    statuses.forEach((row) => {
      statusMap.set(row.status, (statusMap.get(row.status) || 0) + row.total);
    });

    months.forEach((row) => {
      const key = `${row.year}-${String(row.month).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) || 0) + row.total);
    });

    professionals.forEach((row) => {
      const key = String(row._id);
      professionalMap.set(key, (professionalMap.get(key) || 0) + row.total);
    });

    clients.forEach((row) => {
      const key = String(row._id);
      clientMap.set(key, (clientMap.get(key) || 0) + row.total);
    });
  });

  const [professionalDocs, clientDocs] = await Promise.all([
    Profesionales.find({ _id: { $in: [...professionalMap.keys()] } })
      .select('nombreyapellido')
      .lean(),
    Clientes.find({ _id: { $in: [...clientMap.keys()] } })
      .select('rozonSocial nombreFantasia')
      .lean(),
  ]);

  const professionalNameMap = new Map(
    professionalDocs.map((doc) => [String(doc._id), doc.nombreyapellido || 'Sin nombre'])
  );
  const clientNameMap = new Map(
    clientDocs.map((doc) => [
      String(doc._id),
      doc.razonSocial || doc.rozonSocial || doc.nombreFantasia || 'Sin nombre',
    ])
  );

  const estudiosPorEstado = [...statusMap.entries()]
    .map(([status, total]) => ({ status, total }))
    .sort((left, right) => right.total - left.total || left.status.localeCompare(right.status));

  const estudiosPorMes = monthBuckets.map((bucket) => ({
    month: bucket.label,
    total: monthMap.get(bucket.key) || 0,
  }));

  const profesionalesConMasAsignaciones = [...professionalMap.entries()]
    .map(([id, total]) => ({
      profesional: professionalNameMap.get(id) || 'Profesional eliminado',
      total,
    }))
    .sort((left, right) => right.total - left.total || left.profesional.localeCompare(right.profesional))
    .slice(0, 10);

  const clientesConMasEstudios = [...clientMap.entries()]
    .map(([id, total]) => ({
      cliente: clientNameMap.get(id) || 'Cliente eliminado',
      total,
    }))
    .sort((left, right) => right.total - left.total || left.cliente.localeCompare(right.cliente))
    .slice(0, 10);

  return {
    kpis,
    estudiosPorEstado,
    estudiosPorMes,
    profesionalesConMasAsignaciones,
    clientesConMasEstudios,
    estudiosPorTipo,
  };
};

module.exports = {
  getDashboardMetrics,
};
