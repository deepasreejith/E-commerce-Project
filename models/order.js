const mongoose = require("mongoose");
const currentDate = new Date();
const orderSchema = new mongoose.Schema({
    cart_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart', 
    },
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
        return_reason:{
            type:Number,
            required:false //1.Damaged,2.Wrong item,3.Changed mind,4.others
        },
        return_status:{
            type:Number,
            default:0      //0 ->not return ,1->return
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
        required:false       //1 means cash on delivery and 2 means netbanking,3 means wallet,4 means walet+netbanking
    },
    order_status:{
        type:Number,
        default:1  ,
        required:false     //1 ->order completed,2->cancelled,3->delivered,4->return,5->processing,6->rejected,7->deliver with return
    },
    date:{
        type:Date,
        default: Date.now,
        required:true
    },
    OrderID:{
        type:String,
        required:false
    },
    netbankingAmount:{
        type:Number,
        required:false
    },
    walletAmount:{
        type:Number,
        required:false
    }
    
    
})

module.exports = mongoose.model('order',orderSchema);