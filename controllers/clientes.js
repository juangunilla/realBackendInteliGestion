const clientes = require('../models/clientes');
const establecimientos = require('../models/establecimientos');

const postItem = async (req, res) => {
  const { body } = req;
  const cuit = (body.cuit || '').toString().trim();
  
  // Validar la longitud del cuit (solo dígitos)
  const cuitLimpio = cuit.replace(/\D/g, '');
  if (cuitLimpio.length !== 11) {
    return res.status(400).send({
      status: 'cuit invalido',
      message: 'El CUIT debe tener exactamente 11 dígitos',
    });
  }
  
  const existingClient = await clientes.findOne({ cuit });
  if (existingClient) {
    return res.status(400).send({
      status: 'cuit duplicado',
      message: 'El CUIT está duplicado',
    });
  }
  
  const data = await clientes.create(body);
  return res.status(200).send({
    status: 'success',
    message: 'Cliente Creado',
    data,
  });
};



const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getItems = async (req, res) => {
  try {
    const { page = 1, limit = 500, search = '' } = req.query;
    const normalizedSearch = search?.toString().trim();

    let searchQuery = {};

    if (normalizedSearch) {
      const safeRegex = new RegExp(escapeRegex(normalizedSearch), 'i');
    const orConditions = [
        { rozonSocial: safeRegex },
        { razonSocial: safeRegex },
        { nombreFantasia: safeRegex },
        { domicilio: safeRegex },
        { cuit: safeRegex },
      ];

      searchQuery = { $or: orConditions };
    }

    const total = await clientes.countDocuments(searchQuery);
    const clientesData = await clientes
      .find(searchQuery)
      .populate('establecimientos._id')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    return res.status(200).json({
      status: 'success',
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: clientesData,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener los clientes',
      error: error.message,
    });
  }
};


const creandoEstablecimiento = async (req, res) => {
    try {
        const { _id } = req.params;
        const establecimientoPayload =
            req.body.establecimiento || req.body.establecimientos || req.body;

        if (!establecimientoPayload || typeof establecimientoPayload !== 'object') {
            return res.status(400).send({
                status: 'error',
                message: 'Debes enviar los datos del establecimiento',
            });
        }

        const cliente = await clientes.findById(_id);
        if (!cliente) {
            return res.status(404).send({
                status: 'error',
                message: 'El cliente no existe',
            });
        }

        let establecimientoDoc = null;
        if (establecimientoPayload._id) {
            establecimientoDoc = await establecimientos.findById(establecimientoPayload._id);
            if (!establecimientoDoc) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El establecimiento indicado no existe',
                });
            }
        } else {
            establecimientoDoc = await establecimientos.create(establecimientoPayload);
        }

        const resumen = {
            _id: establecimientoDoc._id,
            nombre: establecimientoDoc.nombre,
            direccion: establecimientoDoc.direccion,
            localidad: establecimientoDoc.localidad,
            frecuencia: establecimientoDoc.frecuencia,
            responsable: establecimientoDoc.responsable,
        };

        const yaAsignado = (cliente.establecimientos || []).some(
            (e) => `${e._id}` === `${establecimientoDoc._id}`
        );
        if (yaAsignado) {
            const clienteActualizado = await clientes
                .findById(_id)
                .populate('establecimientos._id');
            return res.status(200).send({
                status: 'success',
                data: clienteActualizado,
                warning: 'El establecimiento ya estaba asignado',
            });
        }

        const clienteActualizado = await clientes
            .findByIdAndUpdate(
                _id,
                { $push: { establecimientos: resumen } },
                { new: true }
            )
            .populate('establecimientos._id');

        return res.status(200).send({
            status: 'success',
            data: clienteActualizado,
        });
    } catch (error) {
        console.error('Error al crear establecimiento para cliente:', error);
        return res.status(500).send({
            status: 'error',
            message: 'No se pudo crear el establecimiento',
            error: error.message,
        });
    }
};



const deleteItem = async (req, res) => {
    const { _id } = req.params;
  
    try {
      // Verificar si el cliente existe
      const existingClient = await clientes.findById(_id).populate('establecimientos._id');
      if (!existingClient) {
        return res.status(404).json({
          status: 'error',
          message: 'El cliente no existe',
        });
      }
  
      // Eliminar los establecimientos relacionados al cliente
      const establecimientosIds = (existingClient.establecimientos || [])
        .map((e) => e?._id)
        .filter(Boolean);

      await establecimientos.deleteMany({ _id: { $in: establecimientosIds } });
  
      // Eliminar el cliente
      await clientes.findByIdAndDelete(_id);
  
      // Devolver una respuesta exitosa
      return res.status(200).json({
        status: 'success',
        message: 'Cliente eliminado correctamente',
      });
    } catch (error) {
      // Manejar errores
      console.error(error);
      return res.status(500).json({
        status: 'error',
        message: 'Ocurrió un error al eliminar el cliente',
        error: error.message,
      });
    }
  };
  
module.exports = { getItems, postItem, creandoEstablecimiento, deleteItem };
