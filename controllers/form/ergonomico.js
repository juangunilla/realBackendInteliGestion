const res = require('express/lib/response')
const { default: mongoose, model } = require('mongoose');
const ergonomico = require('../../models/form/ergonomico')
const { normalizeFechaDerivadoPayload } = require('../../helpers/fechaDerivado');

const postItem = async (req, res) => {
    const body = normalizeFechaDerivadoPayload(req.body)
    console.log(body)
    const data = await ergonomico.create(body)
    return res.status(200).send({
        status: "success",
        data
    })
};

const updateItem= async(req,res)=>{
    const {_id}=req.params
    const update = normalizeFechaDerivadoPayload(req.body)
    try{
        await ergonomico.findByIdAndUpdate(_id, {$set:update},{useFindAndModify: true})
        res.send(`Actualizaste datos del estudio${_id}`)
    }catch(error){
        console.error(`Error al  actualizar los  datos del estudio${_id}`,error)
        res.status(500).send('Error al actualizar los datos')
    }
}
const getItems = async (req, res) => {
    const data = await ergonomico.find({})
    return res.status(200).send({
        status: "success",
        data
    })

};
module.exports = { getItems, postItem,updateItem}
