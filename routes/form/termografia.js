const express =require('express')
const router = express.Router();
const {
  getItems,
  postItem,
  updateItem,
  getHistorial,
  getHistorialByClienteEst,
} = require('../../controllers/form/termografia')

router.get('/', getItems)
router.put('/:_id',updateItem)
router.post('/',postItem)
router.get('/historial', getHistorial)
router.get('/historial/:clienteId/:establecimientoId', getHistorialByClienteEst)

module.exports=router;
