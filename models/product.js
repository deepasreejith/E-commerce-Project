const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:false
    },
    mrp:{
        type:Number,
        required:true
    },
    selling_price:{
        type:Number,
        required:true
    },
    discount_sellingprice:{
        type:Number,
        required:false
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', 
    },
    subcategory_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory' 
    },
    description:{
        type:String,
        required:false
    },
    delete_status:{   
        type:Number,
        default:1  // 1 means product live,-1 means delete product
    },
    quantity:{
        type:Number,
        required:true
    },
    product_status:{
        type:Number,  //1 means instock 2 means out of stock
        required:true
    },
    limit:{
        type:Number,
        required:false
    },
    images:{
        type: [{
            type: String, // Assuming moreimages is an array of strings (image URLs)
            required: false // You can adjust this as needed
        }],
        default: [] ,
       
       
    }
})

module.exports = mongoose.model('product',productSchema);