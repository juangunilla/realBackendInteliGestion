const { Analisis, AnalisisHist } = require('../../models/form/analisist');
const { crearConHistorial } = require('../../helpers/historialHelper');

// Crear nuevo estudio con historial
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
      Analisis,
      AnalisisHist,
      clienteId,
      establecimientoId,
      datos,
      {
        user: req.user,
        entity: "analisist",
        description: "Creación de estudio de Análisis",
        payload,
      }
    );

    return res.status(200).send({ status: "success", data: nuevo });
  } catch (error) {
    console.error("Error al crear estudio de análisis:", error);
    res.status(500).send("Error al crear el estudio");
  }
};

// Actualizar estudio activo
const updateItem = async (req, res) => {
  const { _id } = req.params;
  const update = req.body;
  try {
    await Analisis.findByIdAndUpdate(
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
    const data = await Analisis.find({});
    res.status(200).send({ status: "success", data });
  } catch (error) {
    console.error("Error al obtener estudios:", error);
    res.status(500).send("Error al obtener estudios");
  }
};

// Obtener historial completo
const getHistorial = async (req, res) => {
  try {
    const data = await AnalisisHist.find({});
    res.status(200).send({ status: "success", data });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).send("Error al obtener historial");
  }
};

// Obtener historial filtrado por cliente y establecimiento
const getHistorialByClienteEst = async (req, res) => {
  try {
    const { clienteId, establecimientoId } = req.params;
    const data = await AnalisisHist.find({
      cliente: clienteId,
      establecimiento: establecimientoId,
    });
    res.status(200).send({ status: "success", data });
  } catch (error) {
    console.error("Error al obtener historial filtrado:", error);
    res.status(500).send("Error al obtener historial filtrado");
  }
};

module.exports = { getItems, postItem, updateItem, getHistorial, getHistorialByClienteEst };
