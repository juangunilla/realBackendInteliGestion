const res = require('express/lib/response')
const { default: mongoose, model } = require('mongoose');
const proveedores = require('../models/proveedores')

const postItem = async (req, res) => {
    const { body } = req
    console.log(body)
    const data = await proveedores.create(body)
    return res.status(200).send({
        status: "success",
        data
    })
};

const getItems = async (req, res) => {
    const data = await proveedores.find({})
    return res.status(200).send({
        status: "success",
        proveedores: data
    })

};
const updateItem = async (req, res) => {
    const { _id } = req.params;
    const {
        razonsocial,
        calle,
        numero,
        entreCalles, provincia,localidad,partido, georeferencia,
        telefonos,
        contacto,
        rubroActividad
    } = req.body;
    await proveedores.findByIdAndUpdate(
        _id,
        {
            $set: {
                razonsocial,
                calle,
                numero,
                entreCalles,
                partido,
                provincia,
                localidad,
                georeferencia,
                telefonos,
                contacto,
                rubroActividad
            },
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
      const data = await proveedores.deleteOne({ _id })
      if (data.deletedCount === 0) {
        return res.status(404).send({
          status: "error",
          message: "El proveedor no existe"
        })
      }
      res.send({
        status: "success",
        message: "Proveedor eliminado"
      })
    } catch (error) {
      console.error(`error al eliminar el proveedor`, error)
      res.status(500).send({
        status:"error",
        message:"error al eliminar el proveedor"
      })
    }
  }
module.exports = { getItems, postItem,updateItem, deleteItem}