const mongoose = require("mongoose");

const categoryOfferSchema = new mongoose.Schema({
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', 
    },
    discount:{
        type:Number,
        required:true
    },
    c_flag:{
        type:Number,
        required:true   //1 enabled 0 disabled
    }
})

module.exports = mongoose.model('categoryoffer',categoryOfferSchema);