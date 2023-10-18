const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
     
    name:{
            type:String,
            required:true
     },
    code:{
            type:String,
            required:true
    },
     startdate:{
              type:Date,
              default: Date.now, 
            required:true,
            
    },
     expiredate:{
              type:Date,
              default: Date.now,
            required:true,
            
        },
     discount:{
            type:Number,
            required:true
     }
    
    
})

module.exports = mongoose.model('coupon',couponSchema);