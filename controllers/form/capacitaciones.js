const { registrarAccion } = require('../../helpers/auditHelper');
const capacitaciones = require('../../models/form/capacitaciones')

const postItem = async (req, res) => {
    const { body } = req
    console.log(body)
    const data = await capacitaciones.create(body)
    await registrarAccion({
        user: req.user,
        action: 'create',
        entity: 'capacitaciones',
        entityId: data._id,
        description: 'Creación de estudio de capacitaciones',
        payload: body,
    });
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
        await capacitaciones.findByIdAndUpdate(_id, {$set:update},{useFindAndModify: true})
        res.send(`Actualizaste datos del estudio${_id}`)
    }catch(error){
        console.error(`Error al  actualizar los  datos del estudio${_id}`,error)
        res.status(500).send('Error al actualizar los datos')
    }
}

const getItems = async (req, res) => {
    const data = await capacitaciones.find({})
    return res.status(200).send({
        status: "success",
        data
    })

};
module.exports = { getItems, postItem,updateItem}
