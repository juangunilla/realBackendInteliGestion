const express =require('express')
const router = express.Router();
const check = require('../../middlewares/auth')
const {
  getItems,
  postItem,
  updateItem,
  getHistorial,
  getHistorialByClienteEst,
} = require('../../controllers/form/termografia')

router.get('/', check.auth, getItems)
router.put('/:_id',check.auth, updateItem)
router.post('/',check.auth, postItem)
router.get('/historial', check.auth, getHistorial)
router.get('/historial/:clienteId/:establecimientoId', check.auth, getHistorialByClienteEst)

module.exports=router;
