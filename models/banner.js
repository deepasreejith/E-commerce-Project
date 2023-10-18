const mongoose = require("mongoose");
const bannerSchema = new mongoose.Schema({
    
    image:{
        type:String,
        required:true
    },
    link:{
        type:String,
        required:false
    }
})

module.exports = mongoose.model('banner',bannerSchema);