const res = require('express/lib/response')
const { default: mongoose, model } = require('mongoose');
const profesionales = require('../models/profesionales')

const postItem = async (req, res) => {
  const { body } = req
  console.log(body)
  const data = await profesionales.create(body)
  return res.status(200).send({
    status: "success",
    data
  })

};


const getItems = async (req, res) => {
  const data = await profesionales.find({})
  return res.status(200).send({
    status: "success",
    profesional: data
  })

};
const updateItem = async (req, res) => {
  const { _id } = req.params;
  const {
    nombreyapellido,
    telefono,
    celular,
    correo,
    especialidades,
    colegiado,
    matricula,
    sepadomicilio,
    departamento,
    sepa,
    provincia,
    localidad,
    partido,
    comentario
  } = req.body;
  await profesionales.findByIdAndUpdate(
    _id,
    {
      $set: {
        nombreyapellido,
        telefono,
        celular,
        correo,
        especialidades,
        colegiado,
        matricula,
        sepadomicilio,
        departamento,
        sepa,
        provincia,
        localidad,
        partido,
        comentario
      },
    },
    { useFindAndModify: true }
  )
  return res.status(200).send({
    status: "success",
  })

};

const deleteItem = async (req, res) => {
  const { _id } = req.params;
  try {
    const data = await profesionales.deleteOne({ _id })
    if (data.deletedCount === 0) {
      return res.status(404).send({
        status: "error",
        message: "El profesional no existe"
      })
    }
    res.send({
      status: "success",
      message: "Profesional eliminado"
    })
  } catch (error) {
    console.error(`error al eliminar el profesional`, error)
    res.status(500).send({
      status:"error",
      message:"error al eliminar el profesional"
    })
  }
}
module.exports = { getItems, postItem, updateItem, deleteItem}