const express =require('express')
const router = express.Router();
const{getItems,postItem,creandoEstablecimiento,deleteItem}=require('../controllers/clientes')
const check= require('../middlewares/auth')

router.get('/',check.auth, getItems)
router.post('/',check.auth,postItem)
router.put('/:_id',check.auth,creandoEstablecimiento)
router.delete('/:_id',check.auth,deleteItem)


module.exports=router;