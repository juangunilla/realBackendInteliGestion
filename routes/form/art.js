const express =require('express')
const router = express.Router();
const{getItems,postItem,updateItem,deleteItem}=require('../../controllers/form/art')

router.get('/', getItems)
router.put('/:_id',updateItem)
router.post('/',postItem)
router.delete('/',deleteItem)



module.exports=router;