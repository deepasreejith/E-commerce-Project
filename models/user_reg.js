const mongoose = require("mongoose");

const currentDate = new Date();

const user_regSchema = new mongoose.Schema({

    name:{
        type:String,
        required:false
    },
    email:{
        type:String,
        required:true
    },
   otp:{
    type:String,
    required:true
   },
   createdAt:{
    type:Date,
    default:currentDate,
    required:true
   },
   otpFlag : {
    type:Number,
    required:true  //0 means web reg and 1 means userlogin otp
   }
});

module.exports = mongoose.model('user_reg',user_regSchema);