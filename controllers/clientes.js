const clientes = require('../models/clientes');
const establecimientos = require('../models/establecimientos');

const postItem = async (req, res) => {
  const { body } = req;
  const { cuit } = body;
  
  // Validar la longitud del cuit
  if (cuit.length !== 11) {
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
      ];

      if (/^\d+$/.test(normalizedSearch)) {
        orConditions.push({ cuit: Number(normalizedSearch) });
      }

      searchQuery = { $or: orConditions };
    }

    const total = await clientes.countDocuments(searchQuery);
    const clientesData = await clientes
      .find(searchQuery)
      .populate('establecimientos')
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
    const { _id } = req.params
    const { establecimientos } = req.body
    await clientes.findByIdAndUpdate(
        _id,
        {
            $push: { establecimientos: establecimientos }
        },

        { useFindAndModify: true }
    )
    return res.status(200).send({
        status: "success",
    })
}



const deleteItem = async (req, res) => {
    const { _id } = req.params;
  
    try {
      // Verificar si el cliente existe
      const existingClient = await clientes.findById(_id).populate('establecimientos');
      if (!existingClient) {
        return res.status(404).json({
          status: 'error',
          message: 'El cliente no existe',
        });
      }
  
      // Eliminar los establecimientos relacionados al cliente
      await establecimientos.deleteMany({ _id: { $in: existingClient.establecimientos } });
  
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
