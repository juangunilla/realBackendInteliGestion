const fs = require('fs/promises');
const path = require('path');
const clientes = require('../models/clientes');
const establecimientos = require('../models/establecimientos');

const normalizeString = (value) => (value ?? '').toString().trim();

const normalizeCuit = (value) => {
  const digits = (value ?? '').toString().replace(/\D/g, '');
  return digits.length ? digits : null;
};

const sameText = (a = '', b = '') => normalizeString(a).toLowerCase() === normalizeString(b).toLowerCase();

const importarEstablecimientos = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../data/establecimientos_import.json');
    const rawFile = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(rawFile);

    if (!Array.isArray(data)) {
      return res.status(400).send({
        ok: false,
        error: 'El archivo de importación no contiene una lista válida',
      });
    }

    for (const e of data) {
      const razonSocial = normalizeString(e.razonSocial);
      const direccion = normalizeString(e.direccion);
      const localidad = normalizeString(e.localidad);
      const frecuencia = normalizeString(e.frecuencia);
      const responsable = normalizeString(e.responsable);
      const cuitNormalizada = normalizeCuit(e.cuit);

      if (!razonSocial && !cuitNormalizada) {
        continue;
      }

      const nombre = `${razonSocial} - ${direccion || ''}`.trim();
      const establecimientoPayload = {
        nombre,
        direccion,
        localidad,
        frecuencia,
        responsable,
      };
      const _nombre = (nombre || '').trim().toLowerCase();
      const _direccion = (direccion || '').trim().toLowerCase();

      let cliente = null;

      if (cuitNormalizada) {
        const cuitRegex = new RegExp(cuitNormalizada.split('').join('\\D*'), 'i');
        cliente = await clientes.findOne({
          $or: [
            { cuit: cuitNormalizada },
            { cuit: { $regex: cuitRegex } },
          ],
        });
      } else if (razonSocial) {
        const razonRegex = new RegExp(`^${normalizeString(razonSocial).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
        cliente = await clientes.findOne({ razonSocial: razonRegex });
      }

      if (!cliente) {
        cliente = await clientes.create({
          razonSocial,
          nombreFantasia: razonSocial,
          cuit: cuitNormalizada,
          establecimientos: [],
        });
      }

      cliente.establecimientos = (cliente.establecimientos || []).filter(
        (e) => e && Object.keys(e).length > 0
      );

      const establecimientosIds = (cliente.establecimientos || [])
        .map((est) => est?._id || est)
        .filter(Boolean);

      const n = (nombre || '').trim().toLowerCase();
      const d = (direccion || '').trim().toLowerCase();
      const existeEnCliente = (cliente.establecimientos || []).some((est) => {
        const estN = (est.nombre || '').trim().toLowerCase();
        const estD = (est.direccion || '').trim().toLowerCase();
        return estN === n && estD === d;
      });
      if (existeEnCliente) {
        continue;
      }

      const existeEnBD = establecimientosIds.length
        ? await establecimientos.findOne({
            _id: { $in: establecimientosIds },
            nombre: establecimientoPayload.nombre,
            direccion: establecimientoPayload.direccion,
          })
        : null;
      if (existeEnBD) {
        continue;
      }

      const nuevoEst = await establecimientos.create(establecimientoPayload);

      cliente.establecimientos = cliente.establecimientos || [];
      cliente.establecimientos.push({
        _id: nuevoEst._id,
        nombre: nuevoEst.nombre,
        direccion: nuevoEst.direccion,
        localidad: nuevoEst.localidad,
        frecuencia: nuevoEst.frecuencia,
        responsable: nuevoEst.responsable,
      });

      await cliente.save();
    }

    return res.send({ ok: true, mensaje: 'Importación finalizada' });
  } catch (error) {
    console.error('Error en importación de establecimientos:', error);
    return res.status(500).send({
      ok: false,
      error: error.message || 'Error al importar establecimientos',
    });
  }
};

module.exports = { importarEstablecimientos };
