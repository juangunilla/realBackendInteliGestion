const mongoose = require('mongoose');
const Clientes = require('../models/clientes');

const stringifyId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value._id) return `${value._id}`;
  return `${value}`;
};

const scopeClientAccess = async (req, res, next) => {
  try {
    const account = req.clientPortalAccount;
    const clienteIdsPermitidos = (account?.clienteIds || [])
      .map(stringifyId)
      .filter(Boolean);

    if (!clienteIdsPermitidos.length) {
      req.portalScope = {
        clienteIdsPermitidos: [],
        establecimientoIdsPermitidos: [],
      };
      return next();
    }

    const clientes = await Clientes.find({ _id: { $in: clienteIdsPermitidos } })
      .select('establecimientos._id')
      .lean();

    const establecimientosDerivados = new Set();
    clientes.forEach((cliente) => {
      (cliente.establecimientos || []).forEach((establecimiento) => {
        const id = stringifyId(establecimiento?._id);
        if (id) establecimientosDerivados.add(id);
      });
    });

    const allowedEstablecimientoIds = (account?.allowedEstablecimientoIds || [])
      .map(stringifyId)
      .filter(Boolean);

    const establecimientoIdsPermitidos = allowedEstablecimientoIds.length
      ? [...establecimientosDerivados].filter((id) => allowedEstablecimientoIds.includes(id))
      : [...establecimientosDerivados];

    req.portalScope = {
      clienteIdsPermitidos: clienteIdsPermitidos.filter((id) => mongoose.Types.ObjectId.isValid(id)),
      establecimientoIdsPermitidos: establecimientoIdsPermitidos.filter((id) =>
        mongoose.Types.ObjectId.isValid(id)
      ),
    };

    return next();
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: 'No se pudo calcular el alcance del portal.',
      error: error.message,
    });
  }
};

module.exports = {
  scopeClientAccess,
  stringifyId,
};
