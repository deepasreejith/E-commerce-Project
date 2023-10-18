const mongoose = require("mongoose");

const wallet_transactionSchema = new mongoose.Schema({
    order_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    amount:{
        type:Number,
        default:0
    },
    date:{
        type:Date,
        default: Date.now,
        required:true
    },
    order_status:{
        type:Number,
        default:1  ,
        required:false     //1 ->order completed,2->cancelled,3->delivered,4->return,5->processing,6->rejected
    },
    payment:{
        type:String,
        default:'1'  ,
        required:false 
    },
    OrderID:{
        type:String,
        required:false
    }
})

module.exports = mongoose.model('wallet_transaction',wallet_transactionSchema);