const express =require('express')
const router = express.Router();
const check = require('../../middlewares/auth')
const{getItems,postItem,updateItem, crearRevalidacionCargaDeFuego, habilitarRelevamientoCargaDeFuego}=require('../../controllers/form/cargaDeFuego')

router.get('/', getItems)
router.put('/:_id',updateItem)
router.post('/:id/revalidar', crearRevalidacionCargaDeFuego)
router.post('/:id/habilitar-relevamiento', check.auth, habilitarRelevamientoCargaDeFuego)
router.post('/',postItem)



module.exports=router;
