const express =require('express')
const router = express.Router();
const{getItems,postItem,updateItem,profesionalItem,profile,deleteItem}=require('../controllers/establecimientos')
const check= require('../middlewares/auth')


router.get('/',check.auth, getItems)
router.get('/profile/:_id',check.auth,profile)
router.post('/',check.auth,postItem)
router.put('/:_id',check.auth,updateItem)
router.put('/:_id',profesionalItem)
router.delete('/:_id',deleteItem)
module.exports=router; 