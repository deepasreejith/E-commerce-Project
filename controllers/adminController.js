const Admin = require('../models/admin_login');
const Category = require('../models/category');
const Subcategory = require('../models/subcategory');
const Product = require('../models/product');
const User = require('../models/userModel');
const Banner = require('../models/banner');
const Order = require('../models/order');
const Coupon = require('../models/coupon');
const CategoryOffer = require('../models/category_offer');
const Wallet = require('../models/wallet');
const Wallet_transaction = require('../models/wallet_transaction');
const Excel = require('exceljs');

const moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId;
let totalSaleEx;
let totalReturnEx;
//html-pdf generate require things
const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
//load admin page
const loadLogin = async(req,res)=>{
    try{ 
       
        res.render('login');

    }catch(error){
        console.log(error.message)
    }
}
//admin varification
const variyAdmin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;

       const adminData = await Admin.findOne({email:email});
       if(adminData){
        if(password === adminData.password){
            req.session.admin=adminData._id;
            console.log("admin session:"+req.session.admin)
           res.redirect('/admin/home') 
        }else{
            res.render('login',{message:"email and password incorrect"})
        }
       }else{
        res.render('login',{message:"email and password incorrect"})
       }
    } catch (error) {
        console.log(error.message)
    }
}


//load category list
const loadCategoryList = async(req,res)=>{
    try{ 
        const categories = await Category.find({},'name image')
        res.render('categorylist',{categories});

    }catch(error){
        console.log(error.message)
    }
}

//edit category
const loadEditCategory = async(req,res)=>{
    
    try {
        const id = req.query.id;
        const categoryData = await Category.findById({_id:id});
        if(categoryData){
            res.render('editcategory',{category:categoryData})
        }else{
            res.redirect('/admin/dashboard')
        }
         
    } catch (error) {
        console.log(error.mesage)
    }
}

//update category/edit
const updateCategory = async(req,res)=>{
  
        const name = req.body.name
        console.log("name:"+name)
        let cimage = req.body.cimage;
        console.log("cimage:"+cimage)
        const queryid = req.query.id;
        console.log('qid ='+queryid)
        try { 
            let image = cimage;
            if (req.file) {
                image = req.file.filename; // Use the new file's filename
              }
       
        const update = await Category.findByIdAndUpdate({_id:queryid},{$set:{name:name,image:image}});
         console.log("update "+update)
        if(update){
            console.log("update ok")
           // res.render('editcategory',{message:"update sucessfully"})
           res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message)
    }

}

//delete category
const deleteCategory = async(req,res)=>{
    try {
        console.log("delete route")
        const id = req.query.id;
       await Category.deleteOne({_id:id});
       res.redirect('category');
    
    } catch (error) {
        console.log(error.message)
    }
}

//load addcategory page
const loadAddCategory = async(req,res)=>{
    try {
        res.render('addcategory')
    } catch (error) {
        console.log(error.message)
    }
}

//adding category and insert in db
const createCategory = async(req,res)=>{
    try {
        const categoryName = req.body.name.toLowerCase();
        const existingCategory = await Category.findOne({ name: { $regex: new RegExp("^" + categoryName, "i") } });
        if (existingCategory) {
             res.render('addcategory', { message: "Category with this name already exists" });
        }else{
        const category = new Category({
            name:req.body.name,
            image:req.file.filename
        })

        const categoryData = await category.save();

        if(categoryData){
            res.render('addcategory',{message:"category created"})
           
        }
    }
    } catch (error) {
        console.log(error.message)
    }
}
//load subcategory list
const loadSubCategoryList = async(req,res)=>{
    try {

        const subcategories = await Subcategory.aggregate([
            {
                $lookup: {
                    from: 'categories', // The name of the Category collection second collection to join
                    localField: 'category_id', //field from first collection
                    foreignField: '_id',  //field from second collection
                    as: 'category', // Alias for the joined data
                },
            },
            {
                $project: {
                    name: 1,
                    image: 1,
                    'category': 1, // Include the category name in the result
                },
            },
        ]);

        console.log(subcategories);

        
        res.render('subcategorylist', { subcategories });

    } catch (error) {
        console.log(error.message)
    }
}
//load edit subcategory page
const loadEditSubCategory = async(req,res)=>{
    try {
    
        const id = req.query.id;
        const subcategory = await Subcategory.find({_id:id})

        console.log("subcategories: "+subcategory);

        
        const category = subcategory[0].category_id;
        console.log("categori id from subcategory:"+category)
        const categories = await Category.find({})
        console.log("categories:"+categories)
        const categorydata = await Category.find({_id:category},'name ')

        console.log("categorydata:"+categorydata)
        console.log("categorydataname:"+categorydata[0].name)
       // res.render('editsubcategory', { subcategory }); 

        res.render('editsubcategory', { subcategory,categorydata,categories });
    } catch (error) {
        console.log(error.message)
    }
}
//update subcategory
const updateSubCategory = async(req,res)=>{
    
        const name = req.body.name
        let cimage = req.body.cimage;
        const queryid = req.query.id;
        const category = req.body.combobox
        console.log("category:"+category)
        try { 
            let image = cimage;
            if (req.file) {
                image = req.file.filename; // Use the new file's filename
              }
       
        const update = await Subcategory.findByIdAndUpdate({_id:queryid},{$set:{name:name,image:image,category_id:category}});
         console.log("update "+update)
        if(update){
            console.log("update ok")
           // res.render('editcategory',{message:"update sucessfully"})
           res.redirect('/admin/subcategory')
        }
    } catch (error) {
        console.log(error.message)
    }
}
//delete subcategory
const deleteSubCategory = async(req,res)=>{
    try {
        const id = req.query.id;
        await Subcategory.deleteOne({_id:id});
        res.redirect('/admin/subcategory');
    } catch (error) {
        console.log(error.message)
    }
}

//loading subcateory adding page
const loadAddSubcategory = async(req,res)=>{
    try {
        const categories = await Category.find({},'name')
        console.log(categories)
        res.render('addsubcategory',{categories})
    } catch (error) {
       console.log(error.message) 
    }
}



//creating subcategory and insert in db
const createSubcategory = async(req,res)=>{
    try {
        const selectedCategoryId = req.body.combobox; 
        
    
        const subcategory = new Subcategory({
            name:req.body.name,
            image:req.file.filename,
            category_id:selectedCategoryId
        })
        console.log(subcategory)
        const subcategoryData = await subcategory.save();

        if(subcategoryData){
           // res.render('addsubcategory',{message:"subcategory created"})
           res.redirect('/admin/subcategoy')
        }

    } catch (error) {
        console.log(error.message)
    }
}
//load add product page
const loadAddProduct = async(req,res)=>{
    try {
        const categories = await Category.find(); 
       
        res.render('addproduct', { categories });
       // res.render('addproduct')
    } catch (error) {
        console.log(error.message)
    }
}
//fetch api
const subcategory = async(req,res)=>{
    try {
        console.log("test")
        const category_id = req.query.category_id;
        console.log(req.query.category_id)
        const subcategories = await Subcategory.find({category_id:category_id });
        console.log(subcategories)
        res.json(subcategories);
    } catch (error) {
        console.log(error.message)
    }
    
}
//create a product
const createProduct = async(req,res)=>{
    try {
        console.log("images------------------")
        const moreImages = req.files.map(file => file.filename);
        console.log("moreimages"+moreImages)
        const product = new Product({
            name:req.body.name,
           // image:req.file.filename,
            mrp:req.body.mrp,
            selling_price:req.body.sellprice,
            category_id:req.body.category,
            subcategory_id:req.body.subcategory,
            description:req.body.description,
            quantity:req.body.quantity ,
            product_status:req.body.status ,
            limit:req.body.limit,
            images: moreImages
        });

        console.log("images::==========="+moreImages)
        const newproduct = await product.save();

        if(newproduct){
         
          console.log("product created")
          res.redirect('/admin/product')
        }
    } catch (error) {
        console.log(error.message)
    }
}
//load product list
const loadProductList = async(req,res)=>{
    try {
        const ITEMS_PER_PAGE = 5;  
        const page = req.query.page || 1;

        const products = await Product.aggregate([
            {
              $lookup: {
                from: 'categories', // The name of the Category collection
                localField: 'category_id',
                foreignField: '_id',
                as: 'category',
              },
            },
            {
              $lookup: {
                from: 'subcategories', // The name of the Subcategory collection
                localField: 'subcategory_id',
                foreignField: '_id',
                as: 'subcategory',
              },
            },
            {
                $match: {
                  "delete_status": 1,
                }
            },
            {
              $project: {
                name: 1,
                images: 1,
                mrp: 1,
                selling_price: 1,
                description: 1,
                quantity:1,
                product_status:1,
                limit:1,
                'category': 1, // Extract the first element of the 'category' array
                'subcategory':1, // Extract the first element of the 'subcategory' array
              },
            },
          ])
          .skip((page - 1) * ITEMS_PER_PAGE)
          .limit(ITEMS_PER_PAGE);
        const totalProdcts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProdcts / ITEMS_PER_PAGE);   
      
         const categories = await Category.find({},'name');
        
        res.render('productlist',{products,categories,totalPages, currentPage: page })
      
    } catch (error) {
        console.log(error.message)
    }
}

//load unlist product page
const loadUnlistProduct = async(req,res)=>{
    try {
       
        const products = await Product.aggregate([
            {
              $lookup: {
                from: 'categories', // The name of the Category collection
                localField: 'category_id',
                foreignField: '_id',
                as: 'category',
              },
            },
            {
              $lookup: {
                from: 'subcategories', // The name of the Subcategory collection
                localField: 'subcategory_id',
                foreignField: '_id',
                as: 'subcategory',
              },
            },
            {
                $match: {
                  "delete_status": -1 
                }
            },
            {
              $project: {
                name: 1,
                images: 1,
                mrp: 1,
                selling_price: 1,
                description: 1,
                'category': 1, // Extract the first element of the 'category' array
                'subcategory':1, // Extract the first element of the 'subcategory' array
              },
            },
          ])
        
        res.render('unlistproduct',{products})
    } catch (error) {
        console.log(error.mesage)
    }
}

//unlisted product add to list
const addListProduct = async(req,res)=>{
    try {
        const id = req.query.id;
        console.log(id)
        await Product.findByIdAndUpdate({_id:id},{$set:{delete_status:1}});
        res.redirect('/admin/product')
    } catch (error) {
        console.log(error.message)
    }
}

//load edit product page
const loadEditProduct = async(req,res)=>{
    try {
        const id = req.query.id;
        const product = await Product.find({_id:id});
       
        const categories = await Category.find({});
        
        const subcategories = await Subcategory.find({});
        
        const category = product[0].category_id;
        
        const categorydata = await Category.find({_id:category},'name')

        
        const subcategory = product[0].subcategory_id;
       
        const subcategorydata = await Subcategory.find({_id:subcategory},'name ')

        

        res.render('editproduct',{product,categories,subcategories,categorydata,subcategorydata})
    } catch (error) {
        console.log(error.message)
    }
}

//update prouct
const updateProduct = async(req,res)=>{
    let selectdimage = req.files.map(file => file.filename);
    let countList = req.body.count
    let newarray = []
    selectdimage.forEach(obj => {
         newarray.push(obj)
          });
      
       let defaultImages = req.body.images;
       let simage;
       let n;
       var j=0
       console.log("old defaultImages: "+defaultImages)
        for(let i=0; i<3; i++){
             n = countList[i]
            if(n != 5){
                simage = newarray[j]
                defaultImages[n] = simage
                j=j+1
            } 
        }
        console.log("defaultImages: "+defaultImages)
        const name = req.body.name;
        const queryid = req.query.id;
        const mrp = req.body.mrp;
        const sellprice = req.body.sellprice;
        const description = req.body.description;
        const category = req.body.category;
        const subcategory = req.body.subcategory;
        const quantity = req.body.quantity ;
        const limit = req.body.limit ;
        const status = req.body.status;
       
       try {
           
        const update = await Product.findByIdAndUpdate({_id:queryid},{$set:{name:name,images:defaultImages,category_id:category,subcategory_id:subcategory,mrp:mrp,selling_price:sellprice,description:description,quantity:quantity,limit:limit,product_status:status}});      
         /*
         if(req.files){
            await Product.findByIdAndUpdate({_id:queryid},{$push:{images:moreImages}})
           }
  */
        if(update){
            console.log("update ok")
           
           res.redirect('/admin/product')
        }
    } catch (error) {
        console.log(error.message)
    }
}
//delete product

const deleteProduct = async(req,res)=>{
    try {
        const id = req.query.id;
        await Product.findByIdAndUpdate({_id:id},{$set:{delete_status:-1}});
       
        res.redirect('product');
    } catch (error) {
       console.log(error.message) 
    }
}
//load customer list
const loadCustomerList = async(req,res)=>{
    try {
        const user = await User.find({})
        
        res.render('customerlist',{user})
    } catch (error) {
        console.log(error.message)
    }
}

//loadedit customer

const editCustomer = async(req,res)=>{
    
    try {
        const id = req.query.id;
        console.log('idtestsreejith ='+id)
         const userData = await User.findById({_id:id});
         console.log(userData)
        if(userData){
            res.render('editcustomer',{user:userData})
        }else{
            res.redirect('/admin/dashboard')
        }
         
    } catch (error) {
        console.log(error.mesage)
    }
}

//update customer

const updateCustomer = async(req,res)=>{
    try {
        const status = req.body.combobox
        console.log("status:"+status)
        const queryid = req.query.id;
        console.log("id:"+queryid);
        const update = await User.findByIdAndUpdate({_id:queryid},{$set:{status:status}});
        if(update){
            
           res.redirect('/admin/customer')
        }
    } catch (error) {
        console.log(error.message)
    }
}

//delete customer
const deleteCustomer = async(req,res)=>{
    try {
        const id = req.query.id;
        await User.deleteOne({_id:id});
        res.redirect('/admin/customer');
        
    } catch (error) {
        console.log(error.message)
    }
}

//search product
const search = async(req,res)=>{
    try {
        
        const searchTerm = req.body.name;
        console.log("search value:"+searchTerm)
       
        const products = await Product.aggregate([
            {
              $lookup: {
                from: 'categories', // The name of the Category collection
                localField: 'category_id',
                foreignField: '_id',
                as: 'category',
              },
            },
            {
              $lookup: {
                from: 'subcategories', // The name of the Subcategory collection
                localField: 'subcategory_id',
                foreignField: '_id',
                as: 'subcategory',
              },
            },
            {
                $match: {
                  "delete_status": 1,
                  "name": { $regex: `${searchTerm}`, $options: 'i' }
                }
            },
            {
              $project: {
                name: 1,
                images: 1,
                mrp: 1,
                selling_price: 1,
                description: 1,
                'category': 1, // Extract the first element of the 'category' array
                'subcategory':1, // Extract the first element of the 'subcategory' array
              },
            },
          ])
          
          
         const categories = await Category.find({},'name');
         currentPage = null
        res.render('productlist',{products,categories, currentPage})
        
    } catch (error) {
        console.log(error.message)
    }
}
const filter = async(req,res)=>{
    try {
        const CategoryId = req.body.combobox; 
        const objectId = new ObjectId(CategoryId);
        console.log(objectId)
        const products = await Product.aggregate([
            {
              $lookup: {
                from: 'categories', // The name of the Category collection
                localField: 'category_id',
                foreignField: '_id',
                as: 'category',
              },
            },
            {
              $lookup: {
                from: 'subcategories', // The name of the Subcategory collection
                localField: 'subcategory_id',
                foreignField: '_id',
                as: 'subcategory',
              },
            },
            {
                $match: {
                 
                  category_id: objectId,
                  
                }
            },
            {
              $project: {
                name: 1,
                images: 1,
                mrp: 1,
                selling_price: 1,
                description: 1,
             //   'category': 1, // Extract the first element of the 'category' array
              //  'subcategory':1, // Extract the first element of the 'subcategory' array
              category: '$category', // Extract the first element.
             subcategory:'$subcategory',
              },
            },
          ])
          console.log("products:"+products)
          const categories = await Category.find({},'name');
          currentPage = null
          res.render('productlist',{products,categories,currentPage })
    } catch (error) {
        console.log(error.message)
    }
}
//banner adding page
const loadAddBanner = async(req,res)=>{
    try {
        res.render('addbanner')
    } catch (error) {
        console.log(error.message)
    }
}
//creating banner image,insert into db
const createBanner = async(req,res)=>{
    try {
        const banner = new Banner({
            
            image:req.file.filename,
            link:req.body.link
        })

        const bannerImage = await banner.save();

        if(bannerImage){
            res.redirect('/admin/banner')
           
        }
    } catch (error) {
        console.log(error.message)
    }
}
//load banner list page

const loadBannerList = async(req,res)=>{
    try {
        const banner = await Banner.find({},' image')
        console.log(banner)
        res.render('bannerlist',{banner});
    } catch (error) {
        console.log(error.message)
    }
}
//load edit banner page
const loadEditBanner = async(req,res)=>{
    try {
        const id = req.query.id;
        
        const bannerData = await Banner.findById({_id:id});
        
        if(bannerData){
            res.render('editbanner',{banner:bannerData})
        }else{
            res.redirect('/admin/dashboard')
        }
    } catch (error) {
        console.log(error.message)
    }
}

//update banner
const updateBanner = async(req,res)=>{
    
        let cimage = req.body.cimage;
        const queryid = req.query.id;
        const link = req.body.link;
        console.log("link:"+link)
        console.log('qid ='+queryid)
        try { 
            let image = cimage;
            if (req.file) {
                image = req.file.filename; // Use the new file's filename
              }
       
        const update = await Banner.findByIdAndUpdate({_id:queryid},{$set:{image:image,link:link}});
        
        if(update){
            
           res.redirect('/admin/banner')
        }
    } catch (error) {
        console.log(error.message)
    }
}
//delete banner
const deleteBanner = async(req,res)=>{
    try {
        const id = req.query.id;
       await Banner.deleteOne({_id:id});
       res.redirect('banner');
    } catch (error) {
        console.log(error.message)
    }
}
//show all orders

const orderList = async(req,res)=>{
    const ITEMS_PER_PAGE = 8;  
    const page = req.query.page || 1;

    try {
        const order = await Order.find({})
                .sort({ date: -1 })
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);        
        console.log("orders:"+order)

        res.render('orderlist',{order,moment,totalPages, currentPage: page })
    } catch (error) {
        console.log(error.message)
    }
}

//show order details 
const orderDetails = async(req,res)=>{
    try {
        const orderId = req.query.id;
        const orderStatus = req.query.status;
        
        const orderObjectId = new ObjectId(orderId);

        const orderDetail = await Order.aggregate([
            {
                $match:{_id:orderObjectId}
            },
            
            
            {
                $unwind: "$product_id"
            },
           
            {
                $lookup:{
                    from: 'products',
                    localField: 'product_id.item',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
           
            {
                $project:{
                   
                    quantity:'$product_id.quantity',
                    item:'$product_id.item',
                    return_status:'$product_id.return_status',
                    address:1,
                    total:1,
                    productDetails:{$arrayElemAt:['$productDetails',0]},
                    couponcode:1,
                    coupondiscount:1,
                    discountAmount:1,
                    OrderID:1,  
                    subtotal:1,
                    order_status:1,
                    payment:1,
                    netbankingAmount:1,
                    walletAmount:1,
                     
                }
            },
            {
                $lookup: {
                    from: 'addresses',
                    localField: 'address',
                    foreignField: '_id',
                    as: 'addressDetails'
                }
            },
            {
                $project: {
                    item: 1,
                    quantity: 1,
                    return_status:1,
                    total: 1,
                    address: { $arrayElemAt: ['$addressDetails', 0] },
                    productDetails:1,
                    _id:1,
                    order_status:1,
                    couponcode:1,
                    coupondiscount:1,
                    discountAmount:1,
                    OrderID:1,
                    subtotal:1,
                    payment:1,
                    netbankingAmount:1,
                    walletAmount:1,
                }
            }
         
        ])
        
       
        console.log("orderDetail:", JSON.stringify(orderDetail))

        res.render('orderdetails',{orderDetail ,orderStatus})

    } catch (error) {
        console.log(error.message)
    }
}
//cancel order
const cancelOrder = async(req,res)=>{
    try {
        const orderid = req.query.id;
        const orderData = await Order.findOne({_id:orderid})
        const amount = orderData.subtotal;
        const userid = orderData.user_id;
        if(orderData.payment === '2' || orderData.payment === '3'||orderData.payment === '4')
       {

        const walletData = await Wallet.findOne({user_id:userid});
        if(walletData){
            walletData.amount += amount;
            await walletData.save();
            console.log('Wallet updated successfully');
        }else{
            const wallet = new Wallet({
                user_id:userid,
                amount:amount
            })
            const newwallet = await wallet.save();
        }
        const wallet_transaction = new Wallet_transaction({
            order_id:orderid,
            user_id: userid,
            amount:amount,
            order_status:2,
            payment:orderData.payment 
          });
          const wallet_transactionData = await wallet_transaction.save();

       }
       const productQuantities = orderData.product_id.map(productItem => ({
        productId: productItem.item,
        quantity: productItem.quantity  // Negative quantity for decrementing
      }));
  
      await Product.bulkWrite(
        productQuantities.map(item => ({
          updateOne: {
            filter: { _id: item.productId },
            update: { $inc: { quantity: item.quantity } }
          }
        }))
      );

        await Order.findByIdAndUpdate({_id:orderid},{$set:{order_status:2}});
       
        res.redirect('orderlist');
    } catch (error) {
        console.log(error.message)
    }
}

//deliver order
const deliverOrder = async(req,res)=>{
    try {
        const orderid = req.query.id;
        await Order.findByIdAndUpdate({_id:orderid},{$set:{order_status:3}});
       
        res.redirect('orderlist');
    } catch (error) {
        console.log(error.message)
    }
}

//logout
const logout = async(req,res)=>{
    try {
        req.session.destroy();
        console.log("destroy")
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}
//coupon list 
const couponList =  async(req,res)=>{
    try {
        const coupon = await Coupon.find({})
        
        res.render('couponlist',{coupon,moment})
    } catch (error) {
        console.log(error.message)
    }
}

//add coupon(loading coupon create page)
const addCoupon = async(req,res)=>{
    try {
        res.render('addcoupon');
    } catch (error) {
        console.log(error.message)
    }
}

//create coupon
const createCoupon = async(req,res)=>{
    try {
       console.log("sdate:"+req.body.sdate)
       
        const coupon = new Coupon({
            name:req.body.name,
            code:req.body.code,
            startdate:req.body.sdate,
            expiredate:req.body.edate,
            discount:req.body.discount,

        })

        const couponData = await coupon.save();


        if(couponData){
            res.render('addcoupon',{message:"coupon created"})
           
        }
    } catch (error) {
        console.log(Error.meessage)
    }
}
//edit coupon
const editCoupon = async(req,res)=>{
    
    try {
        const id = req.query.id;
       
         const couponData = await Coupon.findById({_id:id});
        
        if(couponData){
            res.render('editcoupon',{coupon:couponData})
        }else{
            res.redirect('/admin/dashboard')
        }
         
    } catch (error) {
        console.log(error.mesage)
    }
}
//update coupon
const updateCoupon = async(req,res)=>{
    try {
        const queryid = req.query.id;
        console.log("id:"+queryid);
         const name = req.body.name;
        const code = req.body.code;
        const startdate= req.body.sdate;
        const expiredate = req.body.edate;
        const discount= req.body.discount;
        const update = await Coupon.findByIdAndUpdate({_id:queryid},{$set:{name:name,code:code,startdate:startdate,expiredate:expiredate,discount:discount}});
      
        if(update){
             
           res.redirect('/admin/coupon')
        }
    } catch (error) {
        console.log(error.message)
    }
}
//delete coupon
const deleteCoupon = async(req,res)=>{
    try {
        const id = req.query.id;
        await Coupon.deleteOne({_id:id});
        res.redirect('/admin/coupon');
        
    } catch (error) {
        console.log(error.message)
    }
}
//add addCategoryoffer
const addCategoryoffer = async(req,res)=>{
    try {
        const categories = await Category.find({},'name')
        
        res.render('addcategoryoffer',{categories})
    } catch (error) {
        console.log(error.message)
    }
}
//create category offer
const createCategoryoffer = async(req,res)=>{
    try {
        const categories = await Category.find({},'name')
        const selectedCategoryId = req.body.combobox; 
        console.log('Selected Value:', selectedCategoryId);

        const categoryOffer = new CategoryOffer({
        category_id:selectedCategoryId,
        discount:req.body.discount,
        c_flag:req.body.status,
        
        })

        const categoryOfferData = await categoryOffer.save();
        const newObjectId = new ObjectId(selectedCategoryId)
        const discount = req.body.discount;
        const products = await Product.aggregate([
            { $match: { category_id: newObjectId, delete_status: 1 } },
            {
              $addFields: {
                new_selling_price: {
                  $subtract: ["$mrp", { $multiply: ["$mrp", discount / 100] }] // Calculate discount based on the provided percentage
                }
              }
            }
          ]);
          
          // Update the selling_price in each product with the new calculated selling_price
          const updateOperations = products.map(product => ({
            updateOne: {
              filter: { _id: product._id },
              update: { $set: { discount_sellingprice: product.new_selling_price } }
            }
          }));
          
          await Product.bulkWrite(updateOperations);

        if(categoryOfferData){
            res.render('addcategoryoffer',{message:"Category offer created",categories})
           
        }
    } catch (error) {
        console.log(error.message)
    }
}
//load category offerlist
const loadCategoryOffer = async(req,res)=>{
    try {
        
        const categoryOffer = await CategoryOffer.aggregate([
            {
                $lookup: {
                    from: 'categories', // The name of the Category collection second collection to join
                    localField: 'category_id', //field from first collection
                    foreignField: '_id',  //field from second collection
                    as: 'category', // Alias for the joined data
                },
            },
            {
                $project: {
                    name: 1,
                    'category': 1, // Include the category name in the result
                    discount:1,
                    c_flag:1
                },
            },
        ]);
        console.log("categoryOffer:", JSON.stringify(categoryOffer))
       
        res.render('categoryoffer', { categoryOffer });
      
    } catch (error) {
        console.log(error.message)
    }
}
//load editCategoryOffer
const editCategoryOffer = async(req,res)=>{
    try {
        const id = req.query.id;
        const category_offer = await CategoryOffer.find({_id:id})

        console.log("category_offer: "+category_offer);

        
        const category = category_offer[0].category_id;
        console.log("categori id from :"+category)
        const categories = await Category.find({})
        console.log("categories:"+categories)
        const categorydata = await Category.find({_id:category},'name ')

        console.log("categorydata:"+categorydata)
        console.log("categorydataname:"+categorydata[0].name)
        

        res.render('editcategoryoffer', { category_offer,categorydata,categories });
    } catch (error) {
        console.log(error.message)
    }
}
//update category offer
const updateCategoryOffer = async(req,res)=>{
    try {
        const category = req.body.combobox;
        const discount = req.body.discount;
        const status = req.body.status;
        const queryid = req.query.id;
        const orderObjectId = new ObjectId(category)
        if(status == 1){

        
        const update = await CategoryOffer.findByIdAndUpdate({_id:queryid},{$set:{discount:discount,category_id:category,c_flag:status}});      
       
        
        const products = await Product.aggregate([
            { $match: { category_id: orderObjectId, delete_status: 1 } },
            {
              $addFields: {
                new_selling_price: {
                  $subtract: ["$mrp", { $multiply: ["$mrp", discount / 100] }] // Calculate discount based on the provided percentage
                }
              }
            }
          ]);
          
          // Update the selling_price in each product with the new calculated selling_price
          const updateOperations = products.map(product => ({
            updateOne: {
              filter: { _id: product._id },
              update: { $set: { discount_sellingprice: product.new_selling_price } }
            }
          }));
          
          await Product.bulkWrite(updateOperations);

        if(update){
            console.log("update ok")
            res.redirect('/admin/categoryoffer')
        }
    }else{
        const update = await CategoryOffer.findByIdAndUpdate({_id:queryid},{$set:{c_flag:status}});
        const products = await Product.aggregate([
            { $match: { category_id: orderObjectId, delete_status: 1 } },
            {
              $addFields: {
                new_selling_price: {
                  $multiply: ["$mrp", { $multiply: ["$mrp", 0 / 100] }] // Calculate discount based on the provided percentage
                }
              }
            }
          ]);
          
          // Update the selling_price in each product with the new calculated selling_price
          const updateOperations = products.map(product => ({
            updateOne: {
              filter: { _id: product._id },
              update: { $set: { discount_sellingprice: product.new_selling_price } }
            }
          }));
          
          await Product.bulkWrite(updateOperations);
        
        res.redirect('/admin/categoryoffer')
    }
    } catch (error) {
        console.log(error.message)
    }
}
//delete category offer
const deleteCategoryoffer = async(req,res)=>{
    try {
        const id = req.query.id;
        await CategoryOffer.deleteOne({_id:id});
        res.redirect('/admin/categoryoffer');
    } catch (error) {
        console.log(error.message)
    }
}
//load admin dashboard
const loadDashboard = async(req,res)=>{
    try{ 
    const totalSale =    await Order.aggregate([
        {
            $match: {
                $or: [{ order_status: 3 }, { order_status: 7 }]
            }
        },
            {
                $group: {
                    _id: null,
                    totalSale: { $sum: "$subtotal" }
                }
            }
        ]);

        console.log("totalsale"+JSON.stringify(totalSale[0].totalSale))
        const newstartDate = req.query.newstartDate;  
        const newendDate = req.query.newendDate;
        let startDateISO ;
        let endDateISO;
       
        const currentDate = new Date();
        const startDate = new Date();
        startDate.setDate(currentDate.getDate() - 6);
        const endDate = currentDate;
         startDateISO = startDate.toISOString();
         endDateISO = endDate.toISOString();
        
        
        console.log("============"+startDateISO)
   
    const aggregatedResults = await Order.aggregate([
        {
            $match: {
                $and: [
                    { $or: [{ order_status: 3 }, { order_status: 7 }] },
                    { date: { $gte: new Date(startDateISO), $lte: new Date(endDateISO) } }
                ]
            }
        },
   
    {
    $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalSubtotal: { $sum: '$subtotal' }
    }
    },
    {
    $sort: { _id: 1 }
    }
    ]);

        const labels = aggregatedResults.map(item => {
        const date = new Date(item._id); // Convert the date string to a Date object
        const day = String(date.getDate()).padStart(2, '0'); // Get the day with leading zero
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month with leading zero
        return `${day}/${month}`;
    });
     const salesData = aggregatedResults.map(item => item.totalSubtotal);  
     //fetch last five order
     const orders = await Order.aggregate([
        {$sort:{ date: -1 }},
        {
          $limit: 5 // Limit the results to 5
        },
        {
          $lookup: {
            from: 'users', // Name of the users collection
            localField: 'user_id', // Field in the orders collection
            foreignField: '_id', // Field in the users collection
            as: 'userDetails' // Alias for the merged user details
          }
        },
        {
          $unwind: '$userDetails' // Unwind the user details (assuming a one-to-one relationship)
        },
        {
          $project: {
            _id: 1,
            OrderID: 1,
            subtotal: 1,
            name: '$userDetails.name' // Replace with the actual field that contains the username
          }
        }
      ]);
      
      //fetch top customers
      const topCustomers = await Order.aggregate([
        {
            $match: {
                $or: [{ order_status: 3 }, { order_status: 7 }]
            }
        },
        {
          $group: {
            _id: '$user_id',
            totalOrderAmount: { $sum: '$subtotal' }
          }
        },
        {
          $sort: { totalOrderAmount: -1 }
        },
        {
          $limit: 5
        },
        {
          $lookup: {
            from: 'users', // Assuming the user details are in a collection named 'users'
            localField: '_id',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        {
          $unwind: '$userDetails'
        },
        {
          $project: {
            _id: 0,
            userName: '$userDetails.name',
            totalOrderAmount: 1
          }
        }
      ]);
      
      console.log('Top 5 Customers:', topCustomers);
    //count total orders
    const totalCount = await Order.countDocuments();
    const totalProduct = await Product.countDocuments(); 
      
      res.render('home',{totalSale,labels,salesData,orders,topCustomers,totalCount,totalProduct});

    }catch(error){
        console.log(error.message)
    }
}
//dashboad load with graph on specific date range
const dashboardGraph = async(req,res)=>{
    try {
       const newstartDate = req.body.startDate
       const newendDate = req.body.endDate
       
       const aggregatedResults = await Order.aggregate([
        {
            $match: {
                $and: [
                    { $or: [{ order_status: 3 }, { order_status: 7 }] },
                    { date: { $gte: new Date(newstartDate), $lte: new Date(newendDate) } }
                ]
            }
        },
      
        {
        $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            totalSubtotal: { $sum: '$subtotal' }
        }
        },
        {
        $sort: { _id: 1 }
        }
        ]);
    
            const labels = aggregatedResults.map(item => {
            const date = new Date(item._id); // Convert the date string to a Date object
            const day = String(date.getDate()).padStart(2, '0'); // Get the day with leading zero
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month with leading zero
            return `${day}/${month}`;
        });
       
        const salesData = aggregatedResults.map(item => item.totalSubtotal);
          
       res.json({labels:labels,salesData:salesData})
    
    } catch (error) {
        console.log(error.message)
    }
}
//when radiobutton click from dashboard
const dashboardRadio1 = async(req,res)=>{
    try {
        const newstartDate = req.body.startDate
       const newendDate = req.body.endDate
    
       const aggregatedResults = await Order.aggregate([
        {
          $match: {
            $and: [
                    { $or: [{ order_status: 3 }, { order_status: 7 }] },
                    { date: { $gte: new Date(newstartDate), $lte: new Date(newendDate) } }
                ]
            
          }
        },
        {
          $group: {
            _id: { month: { $month: '$date' } }, // Group by month
            totalSubtotal: { $sum: '$subtotal' }
          }
        },
        
        {
          $sort: {'_id.month': 1 } // Sort by month
        }
      ]);
      
     
      const months = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
      ];
      const labels = [];
    const salesData = [];
    for (let i = 0; i < 12; i++) {
        labels.push(months[i].substr(0, 3)); // Get the first three letters of the month
        salesData.push(0);
      }
      aggregatedResults.forEach(item => {
        const monthIndex = item._id.month - 1; // MongoDB months are 1-based
        const monthName = months[monthIndex]; // Get the month name based on index
        console.log('Month:', monthName, 'Total Sales:', item.totalSubtotal);
        salesData[monthIndex] = item.totalSubtotal;
      });
     
      res.json({ labels, salesData });
    } catch (error) {
        console.log(error.message)
    }
}
//yearly graph showing
const dashboardRadio2 = async(req,res)=>{
    try {
        const newstartDate = req.body.startDate
       const newendDate = req.body.endDate
       console.log("staryear"+newstartDate)
       console.log("end year"+newendDate)
       const aggregatedResults = await Order.aggregate([
        {
          $match: {
            $and: [
                    { $or: [{ order_status: 3 }, { order_status: 7 }] },
                    { date: { $gte: new Date(newstartDate), $lte: new Date(newendDate) } }
                ]
           
          }
        },
        {
          $group: {
            _id: { year: { $year: '$date' } }, // Group by year
            totalSubtotal: { $sum: '$subtotal' }
          }
        },
        {
          $sort: { '_id.year': 1 } // Sort by year
        }
      ]);
      
     // const labels = aggregatedResults.map(item => ` ${item._id.year}`);// in this way only shows if data have
     // const salesData = aggregatedResults.map(item => item.totalSubtotal);
     const labels = [];
     const salesData = [];
   
     // Iterate over each year from newstartDate to newendDate
     for (let year = (new Date(newstartDate)).getFullYear(); year <= (new Date(newendDate)).getFullYear(); year++) {
       const result = aggregatedResults.find(item => item._id.year === year);
   
       labels.push(`${year}`);
       salesData.push(result ? result.totalSubtotal : 0);
     }
      res.json({ labels, salesData });
    } catch (error) {
        console.log(error.message)
    }
}
//sales report

const salesReport = async(req,res)=>{
    try {
        let endDate;
        let startDate;
        if(req.body.action =='submit'){
        console.log("submit button")
         startDate = new Date(req.body.sdate); // Convert to Date object
         endDate = new Date(req.body.edate);
        }else{
        const currentDate = new Date();
         endDate =  currentDate;
         startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 30);
        }
        const totalSale = await Order.aggregate([
          {
            $match: {
            $or: [{ order_status: 3 }, { order_status: 7 }],
            date: { $gte: startDate, $lte: endDate }
             }
         },
         {
             $group: {
                _id: { $dateToString: { format: "%m/%d/%Y", date: "$date" } },
                totalOrders: { $sum: 1 },
                totalAmount: { $sum: "$total" },
                totalDiscount: { $sum: "$discountAmount" },
                totalSubtotal: { $sum: "$subtotal" },
                orders: {
                    $push: {
                        OrderID: "$OrderID",
                        total: "$total",
                        discount: "$discountAmount",
                        subtotal: "$subtotal"
                    }
                }
            }
        },
        {
            $project: {
                date: "$_id",
                totalOrders: 1,
                totalAmount: 1,
                totalDiscount: 1,
                totalSubtotal: 1,
                orders: 1,
                _id: 0
            }
        },
        {
            $sort: {
                date: -1
            }
        }
    ]);
    totalSaleEx = totalSale
    res.render('sales_report',{totalSale})

    } catch (error) {
        console.log(error.message)
    }
}

//return order report
const returnReport = async(req,res)=>{
    try {
        let endDate;
        let startDate;
        if(req.body.action =='submit'){
        console.log("submit button")
         startDate = new Date(req.body.sdate); // Convert to Date object
         endDate = new Date(req.body.edate);
        }else{
            const currentDate = new Date();
            endDate =  currentDate;
            startDate = new Date(currentDate);
           startDate.setDate(currentDate.getDate() - 30); 
        }
        const returnOrder =await Order.aggregate([
            {
                $match: {
                    $or: [{ order_status: 4 }, { order_status: 7 }],
                    date: { $gte: startDate, $lte: endDate }
                     }
            },
            {
              $unwind: '$product_id'
            },
            {
              $match: {
                'product_id.return_status': 1
              }
            },
            {
              $lookup: {
                from: 'products', // The name of the products collection
                localField: 'product_id.item',
                foreignField: '_id',
                as: 'productDetails'
              }
            },
            {
              $project: {
               
                OrderID: 1,
                productName: { $arrayElemAt: ['$productDetails.name', 0] },
                quantityOrdered: '$product_id.quantity',
                mrp: { $arrayElemAt: ['$productDetails.mrp', 0] },
                total: { $multiply: ['$product_id.quantity', { $arrayElemAt: ['$productDetails.mrp', 0] }] },
                formattedDate: { $dateToString: { format: "%m/%d/%Y", date: "$date" } }
            }
            },
            {
                $group: {
                    _id: {
                        formattedDate: "$formattedDate",
                        OrderID: "$OrderID"
                      },
                  productCount: { $sum: 1 }, // Counting the products for each OrderID
                  
                  totalAmount: { $sum: '$total' },
                  orders: {
                    $push: {
                       
                      _id: '$_id.OrderID',
                      productName: '$productName',
                      quantityOrdered: '$quantityOrdered',
                      mrp: '$mrp',
                      total: '$total'
                    }
                  }
                }
              },
              {
                $sort: {
                    "_id.formattedDate": -1
                }
            }
          ]);
          console.log("returnOrder-----"+JSON.stringify(returnOrder))
          totalReturnEx = returnOrder;
        res.render('return_report',{returnOrder})
    } catch (error) {
        console.log(error.message)
    }
}
//export excel format sales report
const salesreportExcel = async(req,res)=>{
    try {
        console.log("----"+JSON.stringify(totalSaleEx))
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');
        worksheet.columns = [
            { header: 'S.No', key: 'sNo', width: 10 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Total Orders', key: 'totalOrders', width: 15 },
            { header: 'Total Amount', key: 'totalAmount', width: 15 },
            { header: 'Discount Amount', key: 'totalDiscount', width: 15 },
            { header: 'Subtotal', key: 'totalSubtotal', width: 15 },
            
          ];
          const currentDate = new Date();
          let endDate =  currentDate;
          let startDate = new Date(currentDate);
          startDate.setDate(currentDate.getDate() - 30);
          const sname = req.body.sdate
          const ename = req.body.edate
          
  
          
          totalSaleEx.forEach((item, index) => {
        worksheet.addRow({
          sNo: index + 1,
          date: item.date,
          totalOrders:item.totalOrders,
          totalAmount:item.totalAmount,
          totalDiscount:item.totalDiscount,
          totalSubtotal:item.totalSubtotal

        });
        item.orders.forEach(order => {
            worksheet.addRow({
              sNo: '',  // Adjust this based on your requirement
              date: order.date, 
              OrderID:order.OrderID,
              total:order.total,
              discount:order.discount,
              subtotal:order.subtotal
            });
          });
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=SalesReport.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error generating Excel:', error);
        console.log(error.message)
    }
}
//sales report pdf
const salesreportPdf = async(req,res)=>{
    try {
       const totalSale = totalSaleEx;
       const data = {
        totalSale:totalSale
       }
       const filePathName = path.resolve(__dirname,'../views/admin/salesreport_pdf.ejs');
       const htmlString = fs.readFileSync(filePathName).toString();
       const styledHtmlString = `
            <style>
                
            body {
                font-family: Arial, sans-serif;
            }
            .sales-report {
                margin: 20px;
            }
            .table-container {
                margin-top: 20px;
            }
            .table-container table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
            }
            .table-container th, .table-container td {
                border: 1px solid #000; /* Change border color if needed */
                padding: 8px;
                text-align: left;
                page-break-inside: avoid; /* Avoid breaking inside the table row */
            }
            
            .table-container th {
                background-color: #f2f2f2;
            }
            .table-container .inner-table {
                width: 100%;
                border-collapse: collapse;
            }
            .table-container .inner-table th, .table-container .inner-table td {
                border: 1px solid #000; /* Change border color if needed */
                padding: 8px;
                text-align: left;
                page-break-inside: avoid; /* Avoid breaking inside the table row */
            }
            .table-container .inner-table th {
                background-color: #e0e0e0; /* Change inner table header color if needed */
            }
            </style>
            ${htmlString}`;
       let options = {
        format:'A4',
        orientation:"portrait",
        border:"10mm"
       }
       const ejsData = ejs.render(styledHtmlString,data);
       pdf.create(ejsData,options).toFile('SalesReport.pdf',(err,response)=>{
        if(err) console.log(err);

       const filePath = path.resolve(__dirname,'../SalesReport.pdf');
        fs.readFile(filePath,(err,file)=>{
            if(err){
                console.log(err);
                return res.status(500).send('could not download')
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment;filename="SalesReport.pdf"');
            res.send(file);
        })
       });

    } catch (error) {
        console.log(error.message)
    }
}
//export return report excel
const returnreportExcel = async(req,res)=>{
    try {
        console.log("----"+JSON.stringify(totalReturnEx))
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('ReturnReport');
        worksheet.columns = [
            { header: 'S.No', key: 'sNo', width: 10 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'OrderID', key: 'OrderID', width: 15 },
            { header: 'Products', key: 'Products', width: 20 },
            { header: 'Quantity', key: 'Quantity', width: 10 },
            { header: 'Price', key: 'Price', width: 15 },
            { header: 'Total', key: 'Total', width: 15 },
            { header: 'TotalAmount', key: 'TotalAmount', width: 15 },
          ];
           
          totalReturnEx.forEach((item, index) => {
        worksheet.addRow({
          sNo: index + 1,
          date: item._id.formattedDate,
          OrderID: item._id.OrderID,
          TotalAmount:item.totalAmount
        });
        item.orders.forEach(order => {
            worksheet.addRow({
                // Adjust this based on your requirement
              Products:order.productName,
              Quantity:order.quantityOrdered,
              Price: order.mrp,
              Total:order.total,
            });
          });
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=ReturnReport.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(error.message)
    }
}
//return report pdf
const returnreportPdf = async(req,res)=>{
    try {
        const returnOrder = totalReturnEx;
        const data = {
            returnOrder:returnOrder
        }
        const filePathName = path.resolve(__dirname,'../views/admin/returnreport_pdf.ejs');
        const htmlString = fs.readFileSync(filePathName).toString();
        const styledHtmlString = `
             <style>
             body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
              }
            
              .report-heading {
                margin-left: 370px;
                margin-top: 20px;
                font-size: 18px;
                font-weight: bold;
              }
            
              .table {
                width: 100%;
                border-collapse: collapse;
                margin-left: 0;
                margin-top: 20px;
              }
            
              .table th, .table td {
                border: 1px solid #ddd;
                padding: 10px;
                text-align: left;
              }
            
              .table th {
                font-weight: bold;
              }
            
              .table td {
                vertical-align: top;
              }
            
              .rowspan-td {
                vertical-align: middle;
              }    
            
             </style>
             ${htmlString}`;
        let options = {
         format:'A4',
         orientation:"portrait",
         border:"10mm"
        }
        const ejsData = ejs.render(styledHtmlString,data);
        pdf.create(ejsData,options).toFile('RetunReport.pdf',(err,response)=>{
         if(err) console.log(err);
 
        const filePath = path.resolve(__dirname,'../RetunReport.pdf');
         fs.readFile(filePath,(err,file)=>{
             if(err){
                 console.log(err);
                 return res.status(500).send('could not download')
             }
             res.setHeader('Content-Type', 'application/pdf');
             res.setHeader('Content-Disposition', 'attachment;filename="RetunReport.pdf"');
             res.send(file);
         })
        });
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadLogin,
    variyAdmin,
    loadDashboard,
    loadAddCategory,
    createCategory,
    loadAddSubcategory,
    createSubcategory,
    loadCategoryList,
    loadEditCategory,
    updateCategory,
    deleteCategory,
    loadSubCategoryList,
    loadEditSubCategory,
    updateSubCategory,
    deleteSubCategory,
    loadAddProduct,
    subcategory,
    createProduct,
    loadProductList,
    loadEditProduct,
    deleteProduct,
    updateProduct,
    loadCustomerList,
    editCustomer,
    updateCustomer,
    deleteCustomer,
    loadUnlistProduct,
    addListProduct,
    search,
    filter,
    loadAddBanner,
    createBanner,
    loadBannerList,
    loadEditBanner,
    updateBanner,
    deleteBanner,
    orderList,
    orderDetails,
    cancelOrder,
    deliverOrder,
    addCoupon,
    createCoupon,
    couponList,
    editCoupon,
    updateCoupon,
    deleteCoupon,
    loadCategoryOffer,
    addCategoryoffer,
    createCategoryoffer,
    editCategoryOffer,
    updateCategoryOffer,
    deleteCategoryoffer,
    logout,
    dashboardGraph,
    dashboardRadio1,
    dashboardRadio2,
    salesReport,
    returnReport,
    salesreportExcel,
    salesreportPdf,
    returnreportExcel,
    returnreportPdf
}