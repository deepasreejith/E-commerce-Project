const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    name:{
            type:String,
            required:true
     },
    address:{
            type:String,
            
            required:true
    },
     pin:{
            type:String,
            
            required:true
    },
     mobile:{
            type:Number,
            required:true
        }
    
    
})

module.exports = mongoose.model('address',addressSchema);