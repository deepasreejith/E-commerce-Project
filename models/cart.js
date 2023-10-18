const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    },
    product_id: [{
        quantity:{
            type:Number,
            required:true,
        },
        item:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', 
        },
        Lflag:{
            type:Number,
            default:0,
        },
        Qflag:{
            type:Number,
            default:0,
        }
        
    }],
    total:{
        type:Number,
        default:0,
        required:false
    },
    subtotal:{
        type:Number,
        default:0,
        required:false
    },
    coupondiscount:{
        type:Number,
        default:0,
        required:false
    },
    discountAmount:{
        type:Number,
        default:0,
        required:false
    },
    couponcode:{
        type:String,
        required:false
    },
    address:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address', 
    },
    payment:{
        type:String,
        default:'1'  ,
        required:false       //1 means cash on delivery and 2 means netbanking
    },
    
})

module.exports = mongoose.model('cart',cartSchema);