const RelevamientoTrimesAutoelev = require('../../models/form/relevamientoTrimesAutoelev');
const { calculateVencimientoFromConfeccion } = require('../../middlewares/vencitrimestral');
const {
  normalizeEntregaDocumentacionPayload,
  normalizeEntregaDocumentacionDocs,
} = require('../../helpers/entregaDocumentacion');

const postItem = async (req, res) => {
  const body = normalizeEntregaDocumentacionPayload(req.body);
  const data = await RelevamientoTrimesAutoelev.create(body);
  return res.status(200).send({
    status: 'success',
    data,
  });
};

const updateItem = async (req, res) => {
  const { _id } = req.params;
  const update = normalizeEntregaDocumentacionPayload({ ...req.body });

  if (update.confeccion) {
    update.vencimiento = calculateVencimientoFromConfeccion(update.confeccion);
  }

  try {
    await RelevamientoTrimesAutoelev.findByIdAndUpdate(
      _id,
      { $set: update },
      { useFindAndModify: true }
    );
    res.send(`Actualizaste datos del estudio${_id}`);
  } catch (error) {
    console.error(`Error al actualizar los datos del estudio${_id}`, error);
    res.status(500).send('Error al actualizar los datos');
  }
};

const getItems = async (req, res) => {
  const data = await RelevamientoTrimesAutoelev.find({});
  return res.status(200).send({
    status: 'success',
    data: normalizeEntregaDocumentacionDocs(data),
  });
};

module.exports = { getItems, postItem, updateItem };
