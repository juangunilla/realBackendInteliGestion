const res = require('express/lib/response')
const { default: mongoose, model } = require('mongoose');
const iluminacionyruido = require('../../models/form/iluminacionyruido')
const { normalizeFechaDerivadoPayload } = require('../../helpers/fechaDerivado');
const {
    normalizeEntregaDocumentacionPayload,
    normalizeEntregaDocumentacionDocs,
} = require('../../helpers/entregaDocumentacion');

const postItem = async (req, res) => {
    const body = normalizeEntregaDocumentacionPayload(
        normalizeFechaDerivadoPayload(req.body)
    )
    console.log(body)
    const data = await iluminacionyruido.create(body)
    return res.status(200).send({
        status: "success",
        data
    })
};

//actualizar items
const updateItem= async(req,res)=>{
    const {_id}=req.params
    const update = normalizeEntregaDocumentacionPayload(
        normalizeFechaDerivadoPayload(req.body)
    )
    try{
        await iluminacionyruido.findByIdAndUpdate(_id, {$set:update},{useFindAndModify: true})
        res.send(`Actualizaste datos del estudio${_id}`)
    }catch(error){
        console.error(`Error al  actualizar los  datos del estudio${_id}`,error)
        res.status(500).send('Error al actualizar los datos')
    }
}

const getItems = async (req, res) => {
    const data = await iluminacionyruido.find({})
    return res.status(200).send({
        status: "success",
        data: normalizeEntregaDocumentacionDocs(data)
    })

};
module.exports = { getItems, postItem,updateItem}
