const express =require('express')
const router = express.Router();
const check = require('../../middlewares/auth')
const{getItems,postItem,updateItem, crearRevalidacionCargaDeFuego, habilitarRelevamientoCargaDeFuego}=require('../../controllers/form/cargaDeFuego')

router.get('/', check.auth, getItems)
router.put('/:_id',check.auth, updateItem)
router.post('/:id/revalidar', check.auth, crearRevalidacionCargaDeFuego)
router.post('/:id/habilitar-relevamiento', check.auth, habilitarRelevamientoCargaDeFuego)
router.post('/',check.auth, postItem)



module.exports=router;
