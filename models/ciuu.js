const { create } = require('express-handlebars')
const mongoose= require('mongoose')

const ciuusSheme= new mongoose.Schema({
    CIUU:{
        type:String
    }
}
)

module.exports=mongoose.model("ciuu",ciuusSheme)