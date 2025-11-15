const express =require('express')
const router = express.Router();
const check=require('../../middlewares/auth')
const{getItems,postItem,updateItem}=require('../../controllers/form/capacitaciones')

router.get('/',check.auth, getItems)
router.put('/:_id',check.auth,updateItem)
router.post('/',check.auth,postItem)



module.exports=router;
