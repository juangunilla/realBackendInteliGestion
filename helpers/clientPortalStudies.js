const mongoose = require('mongoose');
const {
  getStudyAssignmentField,
  getStudyConfig,
  getStudyScheduledDateField,
  resolveStudyDueDate,
  resolveStudyStatus,
  studyConfigs,
} = require('./studyRegistry');
const Clientes = require('../models/clientes');

const toObjectIdList = (ids = []) =>
  ids.filter((id) => mongoose.Types.ObjectId.isValid(id)).map((id) => new mongoose.Types.ObjectId(id));

const normalizeRef = (value) => {
  if (Array.isArray(value)) return normalizeRef(value[0]);
  if (!value) return null;
  if (typeof value === 'string') return { id: value, label: null };
  if (typeof value === 'object') {
    const id = value._id ? `${value._id}` : value.id ? `${value.id}` : null;
    const label =
      value.rozonSocial ||
      value.razonSocial ||
      value.nombreyapellido ||
      value.nombre ||
      value.sucursal ||
      value.direccion ||
      null;
    return { id, label };
  }
  return { id: `${value}`, label: null };
};

const buildScopedStudyQuery = ({ clienteIdsPermitidos = [], establecimientoIdsPermitidos = [] }) => {
  const clienteObjectIds = toObjectIdList(clienteIdsPermitidos);
  const establecimientoObjectIds = toObjectIdList(establecimientoIdsPermitidos);
  const or = [];

  if (clienteObjectIds.length) {
    or.push({ cliente: { $in: clienteObjectIds } });
    or.push({ 'cliente._id': { $in: clienteObjectIds } });
  }

  if (establecimientoObjectIds.length) {
    or.push({ establecimiento: { $in: establecimientoObjectIds } });
    or.push({ 'establecimiento._id': { $in: establecimientoObjectIds } });
  }

  return or.length ? { $or: or } : { _id: null };
};

const loadClientesPermitidosLookup = async (clienteIdsPermitidos = []) => {
  const clienteObjectIds = toObjectIdList(clienteIdsPermitidos);
  if (!clienteObjectIds.length) return new Map();

  const clientes = await Clientes.find({ _id: { $in: clienteObjectIds } })
    .select('rozonSocial nombreFantasia establecimientos._id')
    .lean();

  const byEstablecimientoId = new Map();
  clientes.forEach((cliente) => {
    (cliente.establecimientos || []).forEach((establecimiento) => {
      const estId = establecimiento?._id ? `${establecimiento._id}` : null;
      if (estId) byEstablecimientoId.set(estId, cliente);
    });
  });

  return byEstablecimientoId;
};

const mapStudyDocument = (config, raw, clientesByEstablecimiento = new Map()) => {
  const data = typeof raw.toObject === 'function' ? raw.toObject() : raw;
  const cliente = normalizeRef(data.cliente);
  const establecimiento = normalizeRef(data.establecimiento);
  const assignmentField = getStudyAssignmentField(config);
  const profesional = normalizeRef(data[assignmentField]);
  const clienteFallback =
    !cliente?.id && establecimiento?.id ? clientesByEstablecimiento.get(establecimiento.id) : null;

  const resolvedCliente = cliente?.id
    ? cliente
    : clienteFallback
      ? { id: `${clienteFallback._id}`, label: clienteFallback.rozonSocial || clienteFallback.nombreFantasia || null }
      : { id: null, label: null };

  return {
    id: data._id ? `${data._id}` : null,
    studyType: config.key,
    label: config.label,
    cliente: resolvedCliente,
    establecimiento,
    estado: resolveStudyStatus(config, data) || null,
    fechaMuestra: getStudyScheduledDateField(config, data) || null,
    fechaMuestraAceptadaClienteAt:
      data.fechaMuestraAceptadaClienteAt || data.fechaCapacitacionAceptadaClienteAt || null,
    puedeAceptarFechaMuestra: Boolean(getStudyScheduledDateField(config, data)),
    vencimiento: resolveStudyDueDate(config, data) || null,
    profesional,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
};

const listScopedStudies = async (scope) => {
  const query = buildScopedStudyQuery(scope);
  const clientesByEstablecimiento = await loadClientesPermitidosLookup(scope?.clienteIdsPermitidos);

  const results = await Promise.all(
    studyConfigs.map(async (config) => {
      if (typeof config.model?.find !== 'function') return [];
      const assignmentField = getStudyAssignmentField(config);
      const schemaPaths = config.model?.schema?.paths || {};
      let queryBuilder = config.model
        .find(query)
        .populate('cliente')
        .populate('establecimiento');

      if (schemaPaths[assignmentField]) {
        queryBuilder = queryBuilder.populate(assignmentField);
      }

      const docs = await queryBuilder;
      return docs.map((doc) => mapStudyDocument(config, doc, clientesByEstablecimiento));
    })
  );

  return results.flat().filter((item) => item.id);
};

const buildStudiesSummary = (studies = []) => {
  const now = new Date();
  const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return studies.reduce(
    (acc, study) => {
      acc.total += 1;

      const estado = (study.estado || '').toString().toLowerCase();
      if (estado.includes('pendiente') || estado.includes('proceso')) {
        acc.enProceso += 1;
      }
      if (
        estado.includes('vigente') ||
        estado.includes('apto') ||
        estado.includes('complet') ||
        estado.includes('finaliz')
      ) {
        acc.finalizados += 1;
      }

      if (study.vencimiento) {
        const dueDate = new Date(study.vencimiento);
        if (!Number.isNaN(dueDate.getTime())) {
          if (dueDate < now) {
            acc.vencidos += 1;
          } else if (dueDate <= next30Days) {
            acc.proximosAVencer += 1;
          }
        }
      }

      return acc;
    },
    {
      total: 0,
      enProceso: 0,
      finalizados: 0,
      vencidos: 0,
      proximosAVencer: 0,
    }
  );
};

module.exports = {
  buildScopedStudyQuery,
  buildStudiesSummary,
  listScopedStudies,
};
