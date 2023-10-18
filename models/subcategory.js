const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
 /*   category_id:{
        type:String,
        required:true
    } */
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', 
    }
})

module.exports = mongoose.model('subcategory',subcategorySchema);