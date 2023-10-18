const mongoose = require("mongoose");
const damageProductSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  
    },
    product_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
    },
   quantity:{
        type:Number,
        required:false
   }
    
})

module.exports = mongoose.model('damageProduct',damageProductSchema);