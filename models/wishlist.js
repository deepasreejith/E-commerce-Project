const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    },
    product_id: [{
        item:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', 
        },
        wishflag:{
            type:Number,
            default:1  ,
        }
    }]
    
})

module.exports = mongoose.model('wishlist',wishlistSchema);