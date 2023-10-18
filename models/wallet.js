const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    amount:{
        type:Number,
        default:0
    },
})

module.exports = mongoose.model('wallet',walletSchema);