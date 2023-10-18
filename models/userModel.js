const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
  
    password:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:"Active"
    },
    is_varified:{
        type:Number,
        default:0
    },
    mobile:{
        type:Number,
        required:false
    },
    gender:{
        type:String,
        required:false
    }
});

module.exports = mongoose.model('user',userSchema);