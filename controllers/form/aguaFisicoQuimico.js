const res = require('express/lib/response')
const { default: mongoose, model } = require('mongoose');
const aguas = require('../../models/form/aguaFisicoQuimico')

const postItem = async (req, res) => {
    const { body } = req
    console.log(body)
    const data = await aguas.create(body)
    return res.status(200).send({
        status: "success",
        data
    })
};

//actualizar items
const updateItem= async(req,res)=>{
    const {_id}=req.params
    const update=req.body
    try{
        await aguas.findByIdAndUpdate(_id, {$set:update},{useFindAndModify: true})
        res.send(`Actualizaste datos del estudio${_id}`)
    }catch(error){
        console.error(`Error al  actualizar los  datos del estudio${_id}`,error)
        res.status(500).send('Error al actualizar los datos')
    }
}

const getItems = async (req, res) => {
    const data = await aguas.find({})
    return res.status(200).send({
        status: "success",
        data
    })

};
module.exports = { getItems, postItem,updateItem}