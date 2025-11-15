const express =require('express')
const router = express.Router();
const{getItems,postItem,updateItem,deleteItem}=require('../controllers/proveedores')
const check= require('../middlewares/auth')

router.get('/',check.auth, getItems)
router.post('/',check.auth,postItem)
router.put('/:_id',check.auth,updateItem)
router.delete('/:_id',check.auth,deleteItem)


module.exports=router;