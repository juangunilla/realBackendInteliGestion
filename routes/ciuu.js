const express =require('express')
const router = express.Router();
const{getItems,postItem}=require('../controllers/ciuu')
const check= require('../middlewares/auth')

router.get('/',check.auth, getItems)
router.post('/',postItem)



module.exports=router;