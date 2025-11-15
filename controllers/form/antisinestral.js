const { Antisinestral, AntisinestralHist } = require('../../models/form/antisinestral');
const { crearConHistorial } = require('../../helpers/historialHelper');

// Crear un nuevo estudio con historial
const postItem = async (req, res) => {
  try {
    const { cliente, establecimiento, ...datos } = req.body;

    const clienteId = Array.isArray(cliente) ? cliente[0] : cliente;
    const establecimientoId = Array.isArray(establecimiento) ? establecimiento[0] : establecimiento;

    const payload = {
      cliente: clienteId,
      establecimiento: establecimientoId,
      ...datos,
    };

    const nuevo = await crearConHistorial(
      Antisinestral,
      AntisinestralHist,
      clienteId,
      establecimientoId,
      datos,
      {
        user: req.user,
        entity: "antisinestral",
        description: "Creación de estudio antisinestral",
        payload,
      }
    );

    return res.status(200).send({ status: "success", data: nuevo });
  } catch (error) {
    console.error("Error al crear estudio antisinestral:", error);
    res.status(500).send("Error al crear el estudio");
  }
};

// Actualizar un estudio activo
const updateItem = async (req, res) => {
  const { _id } = req.params;
  const update = req.body;
  try {
    await Antisinestral.findByIdAndUpdate(
      _id,
      { $set: update },
      { useFindAndModify: true }
    );
    res.send(`Actualizaste datos del estudio ${_id}`);
  } catch (error) {
    console.error(`Error al actualizar ${_id}`, error);
    res.status(500).send("Error al actualizar el estudio");
  }
};

// Obtener todos los estudios activos
const getItems = async (req, res) => {
  try {
    const data = await Antisinestral.find({});
    res.status(200).send({ status: "success", data });
  } catch (error) {
    console.error("Error al obtener estudios antisinestrales:", error);
    res.status(500).send("Error al obtener estudios");
  }
};

// Obtener historial completo
const getHistorial = async (req, res) => {
  try {
    const data = await AntisinestralHist.find({});
    res.status(200).send({ status: "success", data });
  } catch (error) {
    console.error("Error al obtener historial antisinestral:", error);
    res.status(500).send("Error al obtener historial");
  }
};

// Obtener historial por cliente y establecimiento
const getHistorialByClienteEst = async (req, res) => {
  try {
    const { clienteId, establecimientoId } = req.params;
    const data = await AntisinestralHist.find({
      cliente: clienteId,
      establecimiento: establecimientoId,
    });
    res.status(200).send({ status: "success", data });
  } catch (error) {
    console.error("Error al obtener historial filtrado antisinestral:", error);
    res.status(500).send("Error al obtener historial filtrado");
  }
};

module.exports = { getItems, postItem, updateItem, getHistorial, getHistorialByClienteEst };
