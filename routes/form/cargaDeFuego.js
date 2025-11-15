const express =require('express')
const router = express.Router();
const{getItems,postItem,updateItem}=require('../../controllers/form/cargaDeFuego')

router.get('/', getItems)
router.put('/:_id',updateItem)
router.post('/',postItem)



module.exports=router;