const res = require('express/lib/response')
const { default: mongoose, model } = require('mongoose');
const establecimientos = require('../models/establecimientos')
const profesionales= require('../models/profesionales')

const postItem = async (req, res) => {
    const { body } = req
    const {calle,numero} = body
    console.log(body)
    const existingEstable = await establecimientos.findOne({ calle,numero });
    if (existingEstable) {
        return res.status(400).send({
            status: 'Establecimiento existente',
            message: 'Este establecimiento ya existe'
        });
    }
    const data = await (await establecimientos.create(body))
    res.send({ data })
    console.log(data)
};



const updateItem = async (req, res) => {
    const { _id } = req.params;
    const updatedFields = req.body;
  
    try {
      await establecimientos.findByIdAndUpdate(_id, { $set: updatedFields }, { useFindAndModify: true });
      res.send(`Actualizaste los campos del establecimiento con ID ${_id}.`);
    } catch (error) {
      console.error('Error al actualizar el establecimiento:', error);
      res.status(500).send('Error al actualizar el establecimiento.');
    }
  };
  

const profesionalItem=async (req, res) => {
    const {_id} =req.params
    const {profesionalesAsignado}=req.body
    await establecimientos.findByIdAndUpdate(
        _id,
        {
            $push:
            {profesionalesAsignado:profesionales}
        },

        {useFindAndModify:true}
        
    )
    res.send(``)
}


const getItems = async (req, res) => {
    const getEstablecimientos = await establecimientos.find()
    res.send( getEstablecimientos );
};

const deleteItem = async (req, res) => {
    const { _id } = req.params;
  
    try {
      // Buscar el establecimiento por su ID
      const result = await establecimientos.deleteOne({ _id });
  
      if (result.deletedCount === 0) {
        return res.status(404).send({
          status: 'error',
          message: 'El establecimiento no existe',
        });
      }
  
      res.send({
        status: 'success',
        message: 'Establecimiento eliminado correctamente',
      });
    } catch (error) {
      console.error('Error al eliminar el establecimiento:', error);
      res.status(500).send({
        status: 'error',
        message: 'Error al eliminar el establecimiento',
      });
    }
  };
  
 

const profile = async (req, res) => {
    const { _id } = req.params;
    try {
        const data = await establecimientos.findById(_id);
        if (!data) {
            return res.status(404).send({
                status: "error",
                message: "El establecimiento no existe"
            });
        }
        return res.status(200).send({
            status: "success",
            data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: "error",
            message: "Error al obtener establecimiento"
        });
    }
}


module.exports = { getItems, postItem, updateItem, profesionalItem, profile, deleteItem };