const User = require('../models/userModel');
const user_reg = require('../models/user_reg');
const Category = require('../models/category');
const Product = require('../models/product');
const Banner = require('../models/banner')
const Cart = require('../models/cart')
const Order = require('../models/order')
const Address = require('../models/address');
const Wishlist = require('../models/wishlist');
const Coupon = require('../models/coupon');
const Wallet = require('../models/wallet');
const Wallet_transaction = require('../models/wallet_transaction');
const DamageProduct = require('../models/damage_product');
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const ObjectId = require('mongoose').Types.ObjectId;
const moment = require('moment');
const uuid = require('uuid');
var easyinvoice = require('easyinvoice');
//html-pdf generate require things
const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
//const Swal = require('sweetalert2');

const Razorpay = require('razorpay');
require('dotenv').config();
let gid;


const key_secret = process.env.KEY_SECRET;
const key_id = process.env.KEY_ID
var instance = new Razorpay({
    key_id: key_id ,
    key_secret: key_secret
    })

//resend otp
const resend = async(req,res)=>{
    const email = req.query.emailid;
    const flag = req.query.flag;
   
    const otp = otpGenerator.generate(4, { upperCase: true, specialChars: false });
    user_reg_check_resend(flag,email,otp)
}

const user_reg_check_resend = async(flag,email,otp)=>{
   // const category = await Category.find({})
    const userCheck = await user_reg.find({$and :[{email:email},{otpFlag:flag}]});
    console.log("usercheck:"+userCheck);
    if(userCheck.length !== 0){
        console.log("not null check")
    const userUpdate = await user_reg.updateOne(
            {
              $and: [
                { email:email},
                { otpFlag:flag },
               
              ]
            },
            {
              $set: { otp: otp }
            }
             
          );
          if(userUpdate){
            sendVerifyOtp(email,otp)
            
          }
    }else{
        console.log('else check')
        insertOtp_resend(flag,email,otp)
    }
}

const insertOtp_resend = async(flag,email,otp)=>{
   
    try{
       
        const register_user = new user_reg({
            
            email:email,
            otp:otp,
            otpFlag:flag
        });
        const user_regData = await register_user.save();
        console.log(user_regData)
        if(user_regData){
            sendVerifyOtp(email,otp);
            
            
           }
    }
    catch(error){
        console.log(error.message)
    }
}
//make secure password
const securePassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    }catch(error){
        console.log(error.message);
    }
}
//loading register page
const loadRegister = async(req,res)=>{
    try{ 
        const category = await Category.find({})
        let emailValue = '';
        let nameValue = '';
       let count=null
        res.render('registration',{emailValue,nameValue,category,count});

    }catch(error){
        console.log(error.message)
    }
}
//manage register by otp
const manage_reg =(req,res)=>{
    
    const action = req.body.action;
   if(action == 'genotp')
   {
    const otp = otpGenerator.generate(4, { upperCase: true, specialChars: false });
    const email = req.body.email
    user_reg_check(req,res,email,otp)
  
   }
   else if(action == 'signin')
   {
    console.log("sigin")
    user_signin(req,res);
    
 }
}
//check in user_reg already generate otp if it yes update it
const user_reg_check = async(req,res,email,otp)=>{
    const category = await Category.find({})
    const userCheck = await user_reg.find({$and :[{email:email},{otpFlag:0}]});
    console.log("usercheck:"+userCheck);
    let count=null
    if(userCheck.length !== 0){
        console.log("not null check")
    const userUpdate = await user_reg.updateOne(
            {
              $and: [
                { email:email},
                { otpFlag:0 },
               
              ]
            },
            {
              $set: { otp: otp }
            }
             
          );
          if(userUpdate){
            sendVerifyOtp(email,otp)
            emailValue = req.body.email;
             nameValue = req.body.name;
            
            res.render('registration',{emailValue,nameValue,message1:"OTP send succesfully",category,count})
          }
    }else{
        console.log('else check')
        insertOtp(otp,req,res)
    }
}
//user signin

const user_signin = async(req,res)=>{
    try{
        const category = await Category.find({})
        
       let count = null
        const email = req.body.email;
        const otp = req.body.otp; 
       
       
        const userData1 = await user_reg.find({email:email}).sort({createdAt:-1}).limit(1);
       
        if(userData1.length > 0){
           
            const userotp = userData1[0].otp;
            emailValue = req.body.email;
             nameValue = req.body.name;
            if(userotp === otp){ 
                const userExist = await User.find({email:email})
                if(userExist.length === 0){
                console.log('testing otp module')
                insertUser(req,res)
                }else{
                    res.render('registration',{message:"User already exist ",emailValue,nameValue,category,count})
                }
            }else{
                res.render('registration',{message :"incorrect otp",category,emailValue,nameValue,count})
            }
        }else{
            res.render('registration',{message:"incorrect mailid or otp",category,emailValue,nameValue,count})
        }
       
       }catch(error){
        console.log(error.message)
       }
}
//if no otp generated it insert into user_reg
const insertOtp = async(otp,req,res)=>{
   
    try{
        const category = await Category.find({})
        let count = await cartCount(userid)
        const register_user = new user_reg({
            name:req.body.name,
            email:req.body.email,
            otp:otp,
            otpFlag:0
        });
        const user_regData = await register_user.save();
        console.log(user_regData)
        if(user_regData){
            sendVerifyOtp(req.body.email,otp);
             emailValue = req.body.email;
             nameValue = req.body.name;
            res.render('registration',{emailValue,nameValue,message1:"OTP send succesfully",category,count})
            
           }else{
            res.render('registration',{emailValue,nameValue,message1:"failed in OTP send",category,count})
           }
    }
    catch(error){
        console.log(error.message)
    }
}
//inser user into User table
const insertUser = async(req,res)=>{
    try{
        let count = null
        const category = await Category.find({})
        console.log('test')
        const spassword = await securePassword(req.body.password);
        console.log(req.body)
        const user = new User({
           name:req.body.name,
           email:req.body.email,
           password:spassword,
          
        }); 
       
       const userData = await user.save();

       if(userData){
        res.redirect('/login')
      //  res.render('registration',{message:"your registration has been success "})
       }else{
        res.render('registration',{message:"your registration has been failed",category,count})
       }
    }catch(error){
        console.log(error.message)
    }  
}
//for send otp
const sendVerifyOtp = async(email,otp)=>{
    try {

        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:'deepakh2014@gmail.com',
                pass:'ukggrqmlldzwjfke'
            }
        });
        const mailOptions = {
            from:'deepakh2014@gmail.com',
            to:email,
            subject:'OTP verification',
            text:otp
        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log(' email send successfully')
            }
        })
        
    } catch (error) {
        console.log(error.message)
    }
}
//load login page
const loadLogin = async(req,res)=>{
    try{ 
        const category = await Category.find({})
        let emailValue = '';
        let passwordValue = '';
       // let userid = req.session.user;
       // let count = await cartCount(userid)
       let count = null
        res.render('login',{emailValue,passwordValue,category,count});

    }catch(error){
        console.log(error.message)
    }
}
//login user manage by otp
const manage_user = async(req,res)=>{
    
    try{
     const category = await Category.find({})
    const action = req.body.action;
    console.log("action is: " + action)
   if(action == 'genotp')
   {
    const email = req.body.email
    
    const userExist = await User.find({email:email});
    console.log("user:"+userExist)
    if(userExist.length!== 0){
    const loginotp = otpGenerator.generate(4, { upperCase: true, specialChars: false });
    console.log("loginotp:"+loginotp)
    
    user_login_Otpcheck(req,res,loginotp)
    }else{
        const emailValue =''
        const passwordValue = ''
        let userid = req.session.user;
        const user = await User.find({_id:userid});
        let count = await cartCount(userid)
        res.render('login',{emailValue,passwordValue,message1:"kindly register",category,user,count})
    }
   }
   else if(action == 'login')
   {
    user_login(req,res);
    
 }
}catch(error){
    console.log(error.message)
}
}
//user login time otp exist check
const user_login_Otpcheck = async(req,res,otp)=>{
    try{
        const category = await Category.find({})
    const email = req.body.email
    console.log("email is:"+email)
    const userLoginCheck = await user_reg.find({$and :[{email:email},{otpFlag:1}]});
    console.log("usercheck:"+userLoginCheck);
    if(userLoginCheck.length !== 0){
        console.log("not null check")
    const userLoginOtpUpdate = await user_reg.updateOne(
            {
              $and: [
                { email:email},
                { otpFlag:1 },
               
              ]
            },
            {
              $set: { otp: otp }
            }
             
          );
          if(userLoginOtpUpdate){
            console.log("email:"+ req.body.email)
            sendVerifyOtp(email,otp)
            emailValue = req.body.email;
            passwordValue = req.body.password;
            let userid = req.session.user;
            const user = await User.find({_id:userid});
            let count = await cartCount(userid)
            res.render('login',{emailValue,passwordValue,message1:"OTP send succesfully",category,user,count})
          }
    }else{
        console.log('else check')
        insertLoginOtp(otp,req,res)
    }
    }catch(error){
    console.log(error.message)
    }
}

const insertLoginOtp = async(otp,req,res)=>{
   
    try{
        const category = await Category.find({})
        const login_user = new user_reg({
            
            email:req.body.email,
            otp:otp,
            otpFlag:1
        });
       console.log(login_user)
        const user_loginData = await login_user.save();
       // console.log(user_loginData)
       const email = req.body.email;
       let userid = req.session.user;
       //     const user = await User.find({_id:userid});
            let count = await cartCount(userid)
            emailValue = req.body.email;
             passwordValue = req.body.password;
        if(user_loginData){
            sendVerifyOtp(email,otp);
             
            res.render('login',{emailValue,passwordValue,message1:"OTP send succesfully",category,user,count})
            
           }else{
            res.render('login',{emailValue,passwordValue,message1:"failed in OTP send",category,user,count})
           }
    }
    catch(error){
        console.log(error.message)
    }
}
//user login
const user_login = async(req,res)=>{
    try{
       // let userid = req.session.user;
     //   const user = await User.find({_id:userid});
        let count = null
        const category = await Category.find({})
        const email = req.body.email;
        const otp = req.body.otp; 
        console.log("password:"+req.body.password)
       // const spassword = await securePassword(req.body.password);
        const password = req.body.password
        console.log(otp);
        const status = await User.findOne({$and :[{email:email},{status:"Blocked"}]})
        console.log("status:"+status)
        let emailValue = '';
        let passwordValue = '';
        

        if( status === null )
        {
       
        const userData1 = await user_reg.find({$and :[{email:email},{otpFlag:1}]}).sort({createdAt:-1}).limit(1);
       
        if(userData1.length > 0){
          
            const userotp = userData1[0].otp;
           
            if(userotp === otp){ 
                const userPasswordCheck = await User.findOne({email:email})
                console.log("userPasswordCheck"+userPasswordCheck)
               
                const passwordMatch = await bcrypt.compare(password, userPasswordCheck.password);
                if (passwordMatch){
               
              req.session.user=userPasswordCheck._id;
              console.log("user session:"+req.session.user)
              
                
                
              res.redirect('/home');
                }else{
                    res.render('login',{message:"invalid password ",category,emailValue,passwordValue,count})
                }
            }else{
                res.render('login',{message :"incorrect otp",category,emailValue,passwordValue,count})
            }
        }else{
            res.render('login',{message:"incorrect mailid or otp",category,emailValue,passwordValue,count})
        }
    }else{
        res.render('login',{message :"User Blocked",category,emailValue,passwordValue,count})
    }
       }catch(error){
        console.log(error.message)
       }

}
//forget password code
const forgetLoad = async(req,res)=>{
    try{
        const category = await Category.find({})
        let emailValue = '';
        let passwordValue = '';
        
        let count = null
        res.render('forget',{emailValue,passwordValue,category,count})
    }catch(error){
        console.log(error.message)
    }
}

const manage_passwordchange =async (req,res)=>{
    try{
     const category = await Category.find({})
     let userid = req.session.user;
    const user = await User.find({_id:userid});
     let count = await cartCount(userid)
    const action = req.body.action;
    const email = req.body.email
   
   if(action == 'genotp')
    {
     const userExist = await User.find({email:email});
     console.log("user:"+userExist)
     if(userExist.length!== 0){
         const otp = otpGenerator.generate(4, { upperCase: true, specialChars: false });
         passwordchange_check(req,res,otp)
         }else{
            let emailValue = '';
            let passwordValue = '';
            res.render('forget',{emailValue,passwordValue,message1:'invalid mailid',category,user,count})
         }
     }
     else if(action == 'passwordchange')
    {
     changePassword(req,res); 
     }
    }catch(error){
    console.log(error.mesage)
}
}
    //forget password otp manage
const passwordchange_check = async(req,res,otp)=>{
    try {
        const category = await Category.find({})
        let userid = req.session.user;
        const user = await User.find({_id:userid});
        let count = await cartCount(userid)
        const email = req.body.email
        const userPasswordCheck = await user_reg.find({$and :[{email:email},{otpFlag:2}]});
        console.log("usercheck:"+userPasswordCheck);
        if(userPasswordCheck.length !== 0){
            console.log("not null check")
            const userChangePasswordOtpUpdate = await user_reg.updateOne(
                {
                  $and: [
                    { email:email},
                    { otpFlag:2 },
                   
                  ]
                },
                {
                  $set: { otp: otp }
                }
                 
              );
              if(userChangePasswordOtpUpdate){
                console.log("email:"+ req.body.email)
                sendVerifyOtp(email,otp)
                emailValue = req.body.email;
                passwordValue = req.body.password;
                res.render('forget',{emailValue,passwordValue,message1:"OTP send succesfully",category,user,count})
              }
        }else{
            console.log('else check')
            insertForgetpasswordOtp(otp,req,res)
        }
        
    } catch (error) {
        console.log(error.message)
    }
}
//insert new data of otpflag=2
const insertForgetpasswordOtp = async(otp,req,res)=>{
   
    try{
        const category = await Category.find({})
        let userid = req.session.user;
        const user = await User.find({_id:userid});
        let count = await cartCount(userid)
        const forgetPassword_user = new user_reg({
           
            email:req.body.email,
            otp:otp,
            otpFlag:2
        });
        const forgetUser_Data = await forgetPassword_user.save();
        
        emailValue = req.body.email;
         passwordValue = req.body.password;
        if(forgetUser_Data){
            sendVerifyOtp(req.body.email,otp);
             
            res.render('forget',{emailValue,passwordValue,message1:"OTP send succesfully",category,user,count})
            
           }else{
            res.render('forget',{emailValue,passwordValue,message1:"failed in OTP send",category,user,count})
           }
    }
    catch(error){
        console.log(error.message)
    }
}
//changing password
const changePassword = async(req,res)=>{
    try {
        const category = await Category.find({})
        
        let count = null
        const email = req.body.email;
        const otp = req.body.otp; 
        console.log("password:"+req.body.password)
        const spassword = await securePassword(req.body.password);
        emailValue = req.body.email;
        passwordValue = req.body.password;
       
        const userData1 = await user_reg.find({$and :[{email:email},{otpFlag:2}]}).sort({createdAt:-1}).limit(1);
       
        if(userData1.length > 0){
           // console.log(userData1)
            console.log(userData1[0])
            const userotp = userData1[0].otp;
            console.log(userotp)
            if(userotp === otp){ 
                const userPasswordCheck = await User.findOne({email:email})
                
                if (userPasswordCheck){
                console.log('testing authorizeuser ')
                res.render('forget',{message:" Your password has been changed",category,count})
                const userPasswordUpdate = await User.updateOne( { email:email}, { $set: { password: spassword }});
                   
                }else{
                    res.render('forget',{emailValue,passwordValue,message:"check your mailid",category,count})
                }
            }else{
                res.render('forget',{emailValue,passwordValue,message :"incorrect otp",category,count})
            }
        }else{
            res.render('forget',{emailValue,passwordValue,message:"incorrect mailid or otp",category,count})
        }
    } catch (error) {
        console.log(error.message)
    }
}
//load home page
const loadHome = async(req,res)=>{
    try {
        let userid = req.session.user;
        const user = await User.findOne({_id:userid})
        
        const category = await Category.find({})
        
        const banner = await Banner.find({})
        
        let count = await cartCount(userid)
        res.render('home',{category,banner,count,user})
    } catch (error) {
        console.log(error.message)
    }
}

//list category
const loadCategory = async(req,re)=>{
    try {
        let userid = req.session.user;
        const user = await User.findOne({_id:userid})
        const category = await Category.find({})
        console.log(category)
       
        let count = await cartCount(userid)
        res.render('header',{category,user,count})
    } catch (error) {
        console.log(error.message)
    }
}
//load shoping page
const loadShop = async(req,res)=>{
    try {
        let userid = req.session.user;
        const user = await User.findOne({_id:userid})
         gid = req.query.id
        console.log("gid=="+gid)
        const orderObjectId = new ObjectId(gid)
        const category = await Category.find({})
        
    const products = await Product.aggregate([
    { $match: { category_id:orderObjectId , delete_status: 1 } },
    {
      $addFields: {
        price_difference_percentage: {
          $multiply: [
            { $divide: [{ $subtract: ["$mrp", "$selling_price"] }, "$mrp"] },
            100
          ]
        }
      }
    },
      {
        $addFields: {
            rounded_percentage: {
              $concat: [{ $toString: { $floor: "$price_difference_percentage" } }, "% Offer"],
            },
          },
    },
    
  ]);
  
        let count = await cartCount(userid)
        const wishlist = await Wishlist.findOne({user_id:userid});
       const categoryid = req.query.id
       
        res.render('shop',{product: products,category,user,count,wishlist,categoryid})
    } catch (error) {
        console.log(error.message)
    }
}

//load product view page
const loadViewPage = async(req,res)=>{
    try {
        let wishflag;
        let wishdata = req.query.data;
        
        let userid = req.session.user;
        const user = await User.findOne({_id:userid})
        const id = req.query.id;
        const category = await Category.find({})
       // const product = await Product.find({_id:id});
       const orderObjectId = new ObjectId(id)
       const products = await Product.aggregate([
        { $match: { _id:orderObjectId  } },
        {
          $addFields: {
            price_difference_percentage: {
              $multiply: [
                { $divide: [{ $subtract: ["$mrp", "$selling_price"] }, "$mrp"] },
                100
              ]
            }
          }
        },
          {
            $addFields: {
                rounded_percentage: {
                  $concat: [{ $toString: { $floor: "$price_difference_percentage" } }, "% Offer"],
                },
              },
        }
      ]);
      
        let count = await cartCount(userid)
        const wishlist = await Wishlist.findOne({user_id:userid,'product_id.item': id});
        if(wishlist){
             wishflag = wishlist.product_id[0].wishflag
            
        }else{
            wishflag = null
        }
        
        res.render('product',{product: products,category,user,count,wishflag,wishdata})
    } catch (error) {
        console.log(error.message)
    }
}
//search products
const search = async(req,res)=>{
    try {
       
        const ITEMS_PER_PAGE = 6;
        const page = req.query.page || 1;
       
        let userid = req.session.user;
        const user = await User.findOne({_id:userid})
        const category = await Category.find({})
        let searchTerm = req.body.name;
        if(typeof searchTerm === 'undefined'){
            console.log("**************")
            searchTerm = req.query.searchTerm
            console.log("searchTerm"+searchTerm)
        }
       
        const totalProducts = await Product.countDocuments({
            name: { $regex: `${searchTerm}`, $options: 'i' }
        });
        const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
     
      const product = await Product.aggregate([
        {
          $match: {
            name: { $regex: `${searchTerm}`, $options: 'i' }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: '$category'
        },
        {
          $addFields: {
            price_difference_percentage: {
              $multiply: [
                { $divide: [{ $subtract: ['$mrp', '$selling_price'] }, '$mrp'] },
                100
              ]
            },
            rounded_percentage: {
              $concat: [
                { $toString: { $floor: { $multiply: [{ $divide: [{ $subtract: ['$mrp', '$selling_price'] }, '$mrp'] }, 100] } } },
                '% Offer'
              ]
            }
          }
        }
      ])
      .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
        let count = await cartCount(userid)
        const wishlist = await Wishlist.findOne({user_id:userid});
        //const pageurl = 1
        res.render('searchpage',{product,category,user,count,totalPages, currentPage: page,searchTerm,wishlist });
       
    } catch (error) {
        console.log(error.message)
    }
}


//logout
const logout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/home')
    } catch (error) {
        console.log(error.message)
    }
}
//loading cart page
const loadCart = async(req,res)=>{
    
    let userid = req.session.user;
    let count = await cartCount(userid);
    const user = await User.findOne({_id:userid});
    const newObjectId = new ObjectId(userid);
    const category = await Category.find({})
    try {
        const cartitems = await Cart.aggregate([
            {
                $match:{user_id:newObjectId}
            },
            {
                $unwind: "$product_id"
            },
            {
                $project:{
                    item:'$product_id.item',
                    quantity:'$product_id.quantity',
                    Qflag:'$product_id.Qflag',
                    Lflag:'$product_id.Lflag'
                }
            },
            {
                $lookup:{
                    from: 'products',
                    localField: 'item',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $project:{
                    item:1,
                    quantity:1,
                    Qflag:1,
                    Lflag:1,
                    productDetails:{$arrayElemAt:['$productDetails',0]}, 
                     
                }
            },
        
           
        ])
        
        if(count === 0){
            res.redirect('/home')
        }else{ 
            const message = req.query.message;
           
            res.render('cart',{category,cartitems,count,user,message})
        }
       
    } catch (error) {
        console.log(error.message)
    }

}
//cart count
const cartCount = async(userid)=>{
    let count = null
    console.log("userid"+userid)
    
    try{
        
        if(typeof userid !== 'undefined' ){ 
            count =0
            //const newObjectId = new ObjectId(userid);
            const cart = await Cart.findOne({user_id:userid})
            if (cart && cart.product_id) {
                count = cart.product_id.length;
                console.log("count:", count);
            } else {
                console.log("Cart is null or product_id is undefined");
            }
          /*  if(cart.length >0){
             count =  cart.product_id.length
            console.log("count::"+count)
            }else{
                count = null
            }*/
        }
        return count;
    }
   
   catch(error){
    console.log(error.message)
   }
   
}


//add to cart 
const addToCart = async(req,res)=>{
    try {
       
        const productid = req.query.id;
        
        const wishdata = req.query.data;
        
        let userid = req.session.user;
        
        let proObj = {
            quantity:1,
            item:new ObjectId(productid),
           
        }
        let userCart = await Cart.find({user_id:userid})
        
        if(userCart.length>0){
            
            let proExist = userCart[0].product_id.findIndex((product) =>product.item.equals(proObj.item))
            
           if(proExist!== -1 ){
           
           const update = await Cart.findOneAndUpdate({_id:userCart[0]._id,'product_id.item':productid},{$inc:{'product_id.$.quantity':1}});
                if(wishdata){
                     res.redirect(`/wishlist`)
                    }else{
                     res.redirect(`/shop?id=${gid}`)
                 }
            
           }else{
           
           const update = await Cart.findOneAndUpdate({_id:userCart[0]._id},{$push:{'product_id':proObj}})
             if(wishdata){
                 res.redirect(`/wishlist`)
                }else{
                 res.redirect(`/shop?id=${gid}`)
             }
        }
        }else{
           
            const cart = new Cart({
                user_id:userid,
                product_id:[proObj]
            })
            
            const newcart = await cart.save();
            
            if(newcart){
                if(wishdata){
                    res.redirect(`/wishlist`)
                   }else{
                    res.redirect(`/shop?id=${gid}`)
                }
              }
        }

    } catch (error) {
        console.log(error.message)
    }
}

const plusbuttoninc = async(req,res)=>{
    try {
        let userid = req.session.user;
       
        const cartid = req.body.cartid;
        
        const productid = req.body.productid;
        const currentQuantity = parseInt(req.body.currentQuantity) +1 
        const product = await Product.find({_id:productid});
        const pro_quantity = product[0].quantity;
        const limit = product[0].limit;
        
          //condition for quantity and limt
        if(currentQuantity <= pro_quantity){
            
            if(currentQuantity <= limit){
                const update = await Cart.findOneAndUpdate({_id:cartid,'product_id.item':productid},{$inc:{'product_id.$.quantity':1}});
                console.log("update"+update)
                 if(update)
                 {
                     const cart = await Cart.findOne({'product_id.item':productid},{ 'product_id.$': 1 })
         
                     
                    const quantity = cart.product_id[0].quantity;
                    
                    res.json({ quantity: quantity }); // Include the quantity in the response
                }
            }else{
                const limitResponse = "limit exceeded"
                res.json({limit:limitResponse})
        }

        }else{
            const quantityResponse = "Out of stock"
            res.json({stock:quantityResponse})
        }
       
    } catch (error) {
        console.log(error.message)
    }
}


const minusbuttondec = async(req,res)=>{
    try {
        let userid = req.session.user;
       
        const cartid = req.body.cartid;
        const currentQuantity = req.body.currentQuantity;
        const productid = req.body.productid;
        const cart1 = await Cart.findOne({'product_id.item':productid},{ 'product_id.$': 1 })
        
         const quantity1 = cart1.product_id[0].quantity;
         const Lflag = cart1.product_id[0].Lflag;
        

         const Qflag = cart1.product_id[0].Qflag;
        
        if(currentQuantity === quantity1 && (Lflag === 1 || Qflag === 1) ){
            const update = await Cart.findOneAndUpdate({_id:cartid,'product_id.item':productid},{ $set: { 'product_id.$.Qflag': 0,'product_id.$.Lflag': 0}} );
            res.json({ quantity: quantity1 });
            console.log("line 897")
        }else{
        
        const update = await Cart.findOneAndUpdate({_id:cartid,'product_id.item':productid},{ $set: { 'product_id.$.Qflag': 0,'product_id.$.Lflag': 0},$inc:{'product_id.$.quantity':-1} } );
        
        if(update){
            const cart = await Cart.findOne({'product_id.item':productid},{ 'product_id.$': 1 })
            
           const quantity = cart.product_id[0].quantity;
           
           res.json({ quantity: quantity }); // Include the quantity in the response
           
           
        }
    }
    } catch (error) {
        console.log(error.message)
    }
}
//limit flag set
const updateLimit = async(req,res)=>{
    try {
        const productid = req.body.id;
        const cartid = req.body.cartid
       
        const newObjectId = new ObjectId(productid);
       
        const update = await Cart.findOneAndUpdate({_id:cartid,'product_id.item':productid}, 
            { $set: { 'product_id.$.Lflag': 1 } })
        
        
    } catch (error) {
        console.log(error.message)
    }
}
//quantity flag set
const updatequantity = async(req,res)=>{
    try {
        const productid = req.body.id;
        const cartid = req.body.cartid
        console.log("cartid====="+cartid)
        const newObjectId = new ObjectId(productid);
        console.log("pro id======="+newObjectId)
        const update = await Cart.findOneAndUpdate({_id:cartid,'product_id.item':productid}, 
            { $set: { 'product_id.$.Qflag': 1 } })
        console.log("updated")
        
    } catch (error) {
        console.log(error.message)
    }
}

//product remove from cart 
const productRemove = async(req,res)=>{
    try {
        const cartId = req.query.cartid;
        const productId = req.query.productid;
      const update = await Cart.updateOne(
            { _id:cartId},
            { $pull: { product_id: { item: productId } } },
          );
          if(update){
            res.redirect('/cart')
          }
    } catch (error) {
        console.log(error.message)
    }
}
//select address(address list page) page
const addressList = async(req,res)=>{
    try {
        
        let total = req.query.total;
        const discountAmount = req.query.discountAmount;
        const subtotal = req.query.subtotal;
        const couponDiscount =req.query.discount;
        const couponcode = req.query.code;
        
        let userid = req.session.user;
        const checkCart = await Cart.find({user_id: userid,product_id: {
            $elemMatch: {
              $or: [{ Lflag: 1 }, { Qflag: 1 }]
            }
          }})
          
          if(checkCart.length>0){
           
            const message = 'please check your cart';
            res.redirect(`/cart?message=${encodeURIComponent(message)}`);
          }else{
           
        const update = await Cart.updateOne(
            { user_id: userid }, 
            { $set: { total: total ,subtotal:subtotal,coupondiscount:couponDiscount,couponcode:couponcode,discountAmount:discountAmount} })
        
        const address = await Address.find({user_id:userid})
        const user = await User.findOne({_id:userid})
        const category = await Category.find({})
        let count = await cartCount(userid)
        
        res.render('addresslist',{user,category,count,address})
        }
    } catch (error) {
        console.log(error.message)
    }
}

//add address
const addAddress = async(req,res)=>{
    try {
        
        const action = req.query.action;
        
        let userid = req.session.user;
        const user = await User.findOne({_id:userid})
        const category = await Category.find({})
        let count = await cartCount(userid)
        res.render('addresscreate',{user,category,count,userid})
    } catch (error) {
        console.log(error.message)
    }
}
//save address
const saveAddress = async(req,res)=>{
    try {
        
        const action = req.query.action;
        
        const userid = req.body.userid
       

       const address = new Address({
        user_id : req.body.userid,
        name:req.body.name,
        address:req.body.address,
       pin:req.body.pin,
       mobile:req.body.mno
    })
    const addressData = await address.save();

    if(action == 'addaddress'){
        
        res.redirect('/myaddress')
     }else{
        res.redirect('/address')
     }

    } catch (error) {
        console.log(error.message)
    }
}
//fetch api radio button select for address
const payment = async(req,res)=>{
    try {
        const selectedId = req.body.id; 
        console.log('Selected _id:', selectedId);
        let userid = req.session.user;
        const update = await Cart.updateOne(
            { user_id: userid }, 
            { $set: { address: selectedId } });
        const address = await Address.findById({_id:selectedId})
       
        res.json({address:address})
        
    } catch (error) {
        
    }
}
//load payment choosing page
const choosePayment = async(req,res)=>{
    try {
        const addId = req.query.id;
        
        let userid = req.session.user;
        let walletAmount;
        const wallet = await Wallet.findOne({user_id:userid});
        if(wallet){
            walletAmount = wallet.amount
        
        }else{
            walletAmount = 0
        }
       const address = await Address.findOne({_id:addId})
        const user = await User.findOne({_id:userid})
        const category = await Category.find({})
        const cartitems = await Cart.find({user_id:userid})
        console.log("cart----"+cartitems.total)
        //----------------------------------------------
        const userObjectId = new ObjectId(userid);
        const cartDetail = await Cart.aggregate([
            {
                $match:{user_id:userObjectId}
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
                    address:1,
                    total:1,
                    subtotal:1,
                    couponcode:1,
                    coupondiscount:1,
                    discountAmount:1,
                    productDetails:{$arrayElemAt:['$productDetails',0]},
                    
                     
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
                    total: 1,
                    subtotal:1,
                    couponcode:1,
                    coupondiscount:1,
                    discountAmount:1,

                    address: { $arrayElemAt: ['$addressDetails', 0] },
                 
                    productDetails:1
                }
            }
         
        ])
        
       
        console.log("cartDetail:", JSON.stringify(cartDetail))
        //--------------------------------------------------
        let count = await cartCount(userid)
        res.render('payment',{user,category,count,walletAmount,address,cartitems,cartDetail})
    } catch (error) {
        
    }
}

//checkout button actions 
const checkout = async(req,res)=>{
    try {
        let userid = req.session.user;
        const selectedValue = req.query.selectedValue;
        const walletAmount = req.query.walletAmount;
        const user = await User.findOne({_id:userid})
        const category = await Category.find({})
        let count = null
        let cartData = await Cart.find({user_id:userid})  
        const currentAmount =cartData[0].subtotal

        const uuidV4 = uuid.v4();   
        const numericOrderID = parseInt(uuidV4.replace(/-/g, '').slice(0, 10), 16);
        const OrderID = numericOrderID.toString().padStart(10, '0');
        
        if(selectedValue === '3')
        {
            if(currentAmount > walletAmount){
           // const message = 'Not enough Balance'
           // count = await cartCount(userid)
           // res.render('payment',{message:message,user,category,count,walletAmount})
            }else{
                console.log(selectedValue)
               
               const update = await Cart.updateOne(
                    { user_id: userid }, 
                    { $set: { payment: selectedValue } });
                const cartData = await Cart.find({user_id:userid}) 
                const cartId = cartData[0]._id
                if (cartData.length > 0) {   
                   
                const order = new Order({
                    cart_id:cartData[0]._id,
                    user_id: cartData[0].user_id,
                    product_id: cartData[0].product_id,
                    total: cartData[0].total,
                    subtotal:cartData[0].subtotal,
                    coupondiscount:cartData[0].coupondiscount,
                    discountAmount:cartData[0].discountAmount,
                    couponcode:cartData[0].couponcode,
                    address: cartData[0].address,
                    payment: cartData[0].payment,
                    order_status: 1,  // Set the order status (e.g., 1 for order completed)
                    OrderID:OrderID
                  });
                    const orderData = await order.save(); 
                  console.log("-----------------------------"+orderData._id)
                  const wallet_transaction = new Wallet_transaction({
                    order_id : orderData._id,
                    user_id: userid,
                    amount:currentAmount,
                    order_status:1,
                    payment:orderData.payment,
                    OrderID:orderData.OrderID
                  });
                  const wallet_transactionData = await wallet_transaction.save();
                  
                //change product quantity based on order quantity
                const productQuantities = orderData.product_id.map(productItem => ({
                    productId: productItem.item,
                    quantity: -productItem.quantity  // Negative quantity for decrementing
                  }));
              
                  await Product.bulkWrite(
                    productQuantities.map(item => ({
                      updateOne: {
                        filter: { _id: item.productId },
                        update: { $inc: { quantity: item.quantity } }
                      }
                    }))
                  );
              
                }
                 
                 const remove = await Cart.findByIdAndRemove({_id:cartId})
                 const orders = await Order.find({cart_id:cartId})
                 const orderId = orders[0]._id
                const walletData = await Wallet.findOne({user_id:userid})
                 walletData.amount -= currentAmount;
                await walletData.save();
                const  message = 'Order placed successfully!'
                res.redirect(`/success?message=${message}&orderid=${orderId}`)

              
            }
        }
        else if(selectedValue === '1'){
           
            
        const update = await Cart.updateOne(
            { user_id: userid }, 
            { $set: { payment: selectedValue } });
            
        const cartData = await Cart.find({user_id:userid}) 
         const cartId = cartData[0]._id
        if (cartData.length > 0) {
           
        const order = new Order({
            cart_id:cartData[0]._id,
            user_id: cartData[0].user_id,
            product_id: cartData[0].product_id,
            total: cartData[0].total,
            subtotal:cartData[0].subtotal,
            coupondiscount:cartData[0].coupondiscount,
            discountAmount:cartData[0].discountAmount,
            couponcode:cartData[0].couponcode,
            address: cartData[0].address,
            payment: cartData[0].payment,
            order_status: 1 , // Set the order status (e.g., 1 for order completed)
            OrderID:OrderID
          });

          const orderData = await order.save(); 
          
          console.log("-----------------------")
        //change product quantity based on order quantity
        const productQuantities = orderData.product_id.map(productItem => ({
            productId: productItem.item,
            quantity: -productItem.quantity  // Negative quantity for decrementing
          }));
      
          await Product.bulkWrite(
            productQuantities.map(item => ({
              updateOne: {
                filter: { _id: item.productId },
                update: { $inc: { quantity: item.quantity } }
              }
            }))
          );
      
        }
         
         const remove = await Cart.findByIdAndRemove({_id:cartId})
         const orders = await Order.find({cart_id:cartId})
         const orderId = orders[0]._id
         
         const  message = 'Order placed successfully!'
         res.redirect(`/success?message=${message}&orderid=${orderId}`)
        
       
    }
    
    } catch (error) {
        console.log(error.message)
    }
}
//when clicking netbanking option 
const onlinePayment = async(req,res)=>{
    try {
        const uuidV4 = uuid.v4();   
        const numericOrderID = parseInt(uuidV4.replace(/-/g, '').slice(0, 10), 16);
        const OrderID = numericOrderID.toString().padStart(10, '0');
        const userid = req.session.user;
        const selectedValue = req.body.selectedValue;
        const balanceAmount =req.body.balanceAmount;
       console.log("balanceAmount"+balanceAmount)
        const update = await Cart.updateOne(
            { user_id: userid }, 
            { $set: { payment: selectedValue } });
            
        const cartData = await Cart.find({user_id:userid}) 
        let order;
        const cartId = cartData[0]._id
        if (cartData.length > 0) {
               
         order = new Order({
            cart_id:cartData[0]._id,
            user_id: cartData[0].user_id,
            product_id: cartData[0].product_id,
            total: cartData[0].total,
            subtotal:cartData[0].subtotal,
            coupondiscount:cartData[0].coupondiscount,
            discountAmount:cartData[0].discountAmount,
            couponcode:cartData[0].couponcode,
            address: cartData[0].address,
            payment: cartData[0].payment,
            order_status: 5 , // Set the order status (e.g., 5 for order processing)
            OrderID:OrderID
          });
        }
        const orderData = await order.save();
        
        const productQuantities = orderData.product_id.map(productItem => ({
            productId: productItem.item,
            quantity: -productItem.quantity  // Negative quantity for decrementing
          }));
      
          await Product.bulkWrite(
            productQuantities.map(item => ({
              updateOne: {
                filter: { _id: item.productId },
                update: { $inc: { quantity: item.quantity } }
              }
            }))
          );
         
         const remove = await Cart.findByIdAndRemove({_id:cartId})
        const orders = await Order.find({cart_id:cartId})
        const orderId = orders[0]._id;
        const totalamount = orders[0].subtotal;
        console.log("subtotal:"+totalamount)
        if(balanceAmount > 0){    //when user pay balance amount through online  in the case of insufficient wallet
                
                const currentAmount = totalamount -balanceAmount
                const walletData = await Wallet.findOne({user_id:userid})
                 walletData.amount -= currentAmount;
                await walletData.save();
                const wallet_transaction = new Wallet_transaction({
                    order_id : orderData._id,
                    user_id: userid,
                    amount:currentAmount,
                    order_status:1,
                    payment:orderData.payment,
                    OrderID:OrderID
                  });
                  const wallet_transactionData = await wallet_transaction.save();
                 const data = await Order.findByIdAndUpdate({_id: orderData._id},{ $set: { 'payment': '4' ,'netbankingAmount':balanceAmount,'walletAmount':currentAmount} })
           console.log("data"+data)
                  generateRazorpay(orderId,balanceAmount,req,res);
        }else{
            generateRazorpay(orderId,totalamount,req,res);
        }
              
        
    } catch (error) {
        console.log(error.message)
    }
}

//generate razorpay  function calling
const generateRazorpay = async(orderId,totalamount,req,res)=>{
    try {
        var options = {
            amount: totalamount*100,
            currency: "INR",
            receipt: orderId,
        };
       
        instance.orders.create(options,function(err,order){
            if(err){
                console.log(err)
            }else{
                console.log("new order:"+JSON.stringify(order))
                
            }
            
            const oid = order.id;
            const oamount = order.amount;
            const oreceipt = order.receipt;
           
            res.json({oid:oid,oamount:oamount,oreceipt:oreceipt,key_id :key_id  }) 
        });
       
        

    } catch (error) {
       console.log(error.message) 
    }
}

//verify payment request from fetchapi -clent side
const verifyPayment = async(req,res)=>{
    try {
        const details = req.body.payment
        
        const orderId = req.body.orderid
        
        const razorpay_signature = details.razorpay_signature
        
        const razorpay_order_id = details.razorpay_order_id;
       
        const razorpay_payment_id = details.razorpay_payment_id;
        

        const razorpay_concat = razorpay_order_id+razorpay_payment_id
        
        const crypto = require('crypto');
        let hmac = crypto.createHmac("sha256", key_secret);
        hmac.update(razorpay_order_id +'|')
        hmac.update(razorpay_payment_id)
        hmac = hmac.digest('hex')
        
        if(hmac == razorpay_signature){
            console.log("order success")
            const update = await Order.findOneAndUpdate({_id:orderId}, //---------
            { $set: { 'order_status': 1 } })
           
            const  message = 'Order placed successfully!'
            const oid = orderId
            res.json({message:message,oid:oid})   
           
        }
        else{
            console.log("oder failed")
            const update = await Order.findOneAndUpdate({_id:orderId}, 
                { $set: { 'order_status': 6 } })
               
                const  message = 'Order Rejected'
                const oid = orderId
                res.json({message:message,oid:oid}) 
        }
    } 
    catch (error) {
        console.log(error.message)
    }
}

//success page
const success = async(req,res)=>{
    try {
        const message = req.query.message;
        const orderId = req.query.orderid;
      
        console.log("mess:"+message) 

        const newOrder = await Order.findById({_id:orderId});
        const newOrderId = newOrder.OrderID
        console.log("----"+newOrderId)

        let userid = req.session.user;
        const user = await User.findOne({_id:userid})
        const category = await Category.find({})
        let count = null
        res.render('success',{user,category,count,orderId,message,newOrderId})
    } catch (error) {
        console.log(error.message)
    }
}

//order history showing 
const orderHistory = async(req,res)=>{
    try {
        const ITEMS_PER_PAGE = 8; 
        const page = req.query.page || 1;

        let userid = req.session.user;
        const user = await User.findOne({_id:userid})
        const category = await Category.find({})
        let count = await cartCount(userid)
        const order = await Order.find({user_id:userid})
            .sort({ date: -1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);    

        res.render('orderhistory',{order,user,category,count,moment,totalPages, currentPage: page})
    } catch (error) {
        console.log(error.message)
    }
}
//view order details
const orderDetails = async(req,res)=>{
    try {
        const orderId = req.query.id
        
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
                    subtotal:1,
                    couponcode:1,
                    coupondiscount:1,
                    discountAmount:1,
                    order_status:1,
                    OrderID:1,
                    payment:1,
                    netbankingAmount:1,
                    walletAmount:1,
                    productDetails:{$arrayElemAt:['$productDetails',0]},
                    date:1
                     
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
                    subtotal:1,
                    couponcode:1,
                    coupondiscount:1,
                    discountAmount:1,
                    order_status:1,
                    OrderID:1,
                    payment:1,
                    netbankingAmount:1,
                    walletAmount:1,
                    address: { $arrayElemAt: ['$addressDetails', 0] },
                    date:1,
                    productDetails:1
                }
            }
         
        ])
        const createDate = orderDetail[0].date;
        const dateObject = new Date(createDate);
        const formattedDate = dateObject.toISOString().split('T')[0];
       const currentDate = new Date()
        const expireDate = new Date(createDate); 
        expireDate.setDate(createDate.getDate() + 5); 
        
        let userid = req.session.user;
        const user = await User.findOne({_id:userid})
        const category = await Category.find({})
        let count = await cartCount(userid)
        res.render('orderdetails',{orderDetail,user,category,count,expireDate,currentDate})
        
    } catch (error) {
        console.log(error.message)
    }
}
//cancel order by user
const cancelOrder = async(req,res)=>{
    try {
        const userid = req.session.user;
        const orderId = req.query.id;
        const orderData = await Order.findOne({_id:orderId})
        const amount = orderData.subtotal
       
       if(orderData.payment === '2' || orderData.payment === '3'||orderData.payment === '4' )
       {
        const walletData = await Wallet.findOne({user_id:userid});
        if(walletData){
            walletData.amount = (parseFloat(walletData.amount) + parseFloat(amount)).toFixed(2);
          //  walletData.amount += amount;
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
            order_id:orderId,
            user_id: userid,
            amount:amount,
            order_status:2,
            payment:orderData.payment ,
            OrderID:orderData.OrderID
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
      
        await Order.findByIdAndUpdate({_id:orderId},{$set:{order_status:2}});
       
        res.redirect('orderhistory');
    } catch (error) {
        console.log(error.message)
    }
}
//return order
const returnOrder = async(req,res)=>{
    try {
        const userid = req.session.user;
        const reason = req.body.reason;
        const product_id = req.body.itemId;
        const quantity = req.body.quantity;
        const orderId = req.body.orderId
        const product_details = await Product.findById({_id:product_id});
        const selling_price = product_details.selling_price;
       const eachProductTotal = selling_price * quantity;
       const orderDetails = await Order.findById({_id:orderId});
       const discount = orderDetails.coupondiscount;
       const newTotal = orderDetails.total - eachProductTotal; 
       const newDiscount = newTotal * (discount/100);
       const newSubtotal = newTotal - newDiscount;
       const amount = eachProductTotal;
       const updatedOrder = await Order.updateOne({_id:orderId,'product_id': { $elemMatch: { item: product_id, quantity: quantity } }  },{$set:{'product_id.$.return_reason': reason,'product_id.$.return_status': 1,'total':newTotal,
       'subtotal':newSubtotal,'discountAmount':newDiscount,'order_status':7}})
        

       const walletData = await Wallet.findOne({user_id:userid});
        if(walletData){
            //walletData.amount += amount;
            walletData.amount = (parseFloat(walletData.amount) + parseFloat(amount)).toFixed(2);
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
            order_id:orderId,
            user_id: userid,
            amount:amount,
            order_status:4,
            payment:orderDetails.payment,
            OrderID:orderDetails.OrderID
          });
          const wallet_transactionData = await wallet_transaction.save();
    if(reason == '1'){
        const damageData = new DamageProduct({
            user_id:userid,
            product_id:product_id,
            quantity:quantity
        })
        const damageProduct = await damageData.save();
    }else{
        const productQuantities = orderDetails.product_id.map(productItem => ({
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
    }
    //when user return one by one then ttal amount reduced when it reach 0 then order completely returned
    if(newSubtotal === 0){
        await Order.updateOne({_id:orderId,'product_id': { $elemMatch: { item: product_id, quantity: quantity } }  },{$set:{order_status:4}})
    }
    res.json("ok")
        
    } catch (error) {
        console.log(error.message)
    }
}

//show user to his address for edit
const myAddresses = async(req,res)=>{
    try {
        
        let userid = req.session.user;
        const user = await User.findOne({_id:userid})
        const category = await Category.find({})
        let count = await cartCount(userid)
        const address = await Address.find({user_id:userid})
        
        res.render('myaddresses',{user,category,count,address})
    } catch (error) {
        console.log(error.message)
    }
}
//edit user address
const editAddress = async(req,res)=>{
    try {
        const addressId = req.query.id;
        const address = await Address.find({_id:addressId})
        let userid = req.session.user;
        const user = await User.findOne({_id:userid})
        const category = await Category.find({})
        let count = await cartCount(userid)
        res.render('editaddress',{address,user,category,count})
    } catch (error) {
        console.log(error.message)
    }
}
//update address
const updateAddress = async(req,res)=>{
    try {
        const addressId = req.query.id;
        const name = req.body.name;
        const useraddress = req.body.address;
        const pin = req.body.pin;
        const mobile = req.body.mno;
        const update = await Address.findByIdAndUpdate({_id:addressId},{$set:{name:name,address:useraddress,pin:pin,mobile:mobile}});
         console.log("update "+update)
        if(update){
            console.log("update ok");
            let userid = req.session.user;
            const address = await Address.find({_id:addressId})
            const user = await User.findOne({_id:userid})
            const category = await Category.find({})
            let count = await cartCount(userid)
          //  res.redirect('/myaddress')
            res.render('editaddress',{message:"Address Update sucessfully",user,category,count,address})
           
        }
    } catch (error) {
        console.log(error.message);
    }
}
//delete user address
const deleteAddress = async(req,res)=>{
    try {
        const addressid = req.query.id;
        await Address.deleteOne({_id:addressid});
        res.redirect('/myaddress');
    } catch (error) {
        console.log(error.message)
    }
}
//change user password after login
const userChangePassword = async(req,res)=>{
    try {
        let userid = req.session.user; 
            const user = await User.findOne({_id:userid})
            const category = await Category.find({})
            let count = await cartCount(userid)
        res.render('setpassword',{user,category,count})
    } catch (error) {
        console.log(error.message)
    }
}
//update user changed password
const updateChangePassword = async(req,res)=>{
    try {
        let userid = req.session.user;
        const category = await Category.find({})
         let count = await cartCount(userid)
        const oldpassword = req.body.oldpassword;
        const newpassword = req.body.newpassword;
        const confirmpassword = req.body.confirmpassword;
        const user = await User.findOne({_id:userid});
        const password = user.password;
        const passwordMatch = await bcrypt.compare(oldpassword, password);
        const spassword = await securePassword(newpassword);
        if(newpassword == confirmpassword){

        if (passwordMatch){
            const userPasswordUpdate = await User.updateOne( { _id:userid}, { $set: { password: spassword }});
            res.render('setpassword',{message:"Password Update sucessfully",user,category,count})
        }
        } else{
            res.render('setpassword',{message:"Please check your password",user,category,count})
        }
            
    } catch (error) {
        console.log(error.message)
    }
}
//add to product in wishlist
const addToWishlist = async(req,res)=>{
    try {
        const productid = req.query.id;
        const shopid = req.query.categoryid;
        let userid = req.session.user;
       let searchTerm =req.query.searchTerm;
        let proObj = {
            item:new ObjectId(productid),  
        }
        let userWishlist = await Wishlist.find({user_id:userid})
        
        if(userWishlist.length>0){
            const update = await Wishlist.findOneAndUpdate({_id:userWishlist[0]._id},{$push:{'product_id':proObj}})
           if(shopid){
            res.redirect(`/shop?id=${shopid}`)
           }else if(searchTerm){
            res.redirect(`/shop?id=${shopid}`)
           }
           else{
            res.redirect(`/product_view?id=${productid}`)
           }
        }else{
            const wishlist = new Wishlist({
                user_id:userid,
                product_id:[proObj]
            })
            wishflag = 1;
            console.log("create wishlist")
            const newWishlist = await wishlist.save();
            
            if(newWishlist){
                if(shopid){
                    res.redirect(`/shop?id=${shopid}`)
                   
                   }
                   else{
                res.redirect(`/product_view?id=${productid}`)
                   }
              }
        }
    } catch (error) {
        console.log(error.message)
    }
}
//remove from wishlist 
const removeFromWishlist = async(req,res)=>{
    try {
        const productid = req.query.id;
        let searchTerm =req.query.searchTerm;
        const shopid = req.query.categoryid;
        let userid = req.session.user;
        const wishdata = req.query.data
        const update = await Wishlist.findOneAndUpdate(
            { user_id: userid },
            { $pull: { product_id: { item: productid } } },
            { new: true }
          );
          if(update){
            console.log('Product removed from the wishlist successfully.');
            if(shopid){
                res.redirect(`/shop?id=${shopid}`)
            }else if(wishdata ){
                res.redirect(`/wishlist`)
            }  else if(searchTerm){
                res.redirect(`/shop?id=${shopid}`)
               } 
               
               else{
            res.redirect(`/product_view?id=${productid}`)
          // res.redirect('/wishlist')
          }
        }
          
    } catch (error) {
        console.log(error.message)
    }

}
//load wishlist page 
const loadWishlist = async(req,res)=>{
    
        let userid = req.session.user;
        const category = await Category.find({})
        const user = await User.findOne({_id:userid})
        let count = await cartCount(userid)
        const newObjectId = new ObjectId(userid);
        const wishlist = await Wishlist.findOne({user_id:userid})
        
        try {
            const wishlistitems = await Wishlist.aggregate([
                {
                    $match:{user_id:newObjectId}
                },
                {
                    $unwind: "$product_id"
                },
                {
                    $project:{
                        item:'$product_id.item',
                    }
                },
                {
                    $lookup:{
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                {
                    $project:{
                        item:1,
                       
                        productDetails:{$arrayElemAt:['$productDetails',0]}, 
                         
                    }
                },
            
               
            ])
           
            let wishdata = 1
           
        res.render('wishlist',{category,user,count,wishlistitems,wishdata})
    } catch (error) {
        console.log(error.message)
    }
}

const checkCoupon = async(req,res)=>{
    try {
        const userEnterCode = req.body.code;
        const totalAmount = parseFloat(req.body.total);
       
        const currentDate = new Date();
        const formattedCurrentDate = currentDate.toISOString().split('T')[0];
        
        const couponDetails = await Coupon.findOne({code:userEnterCode});
        if(couponDetails){
            const formattedCouponDate = couponDetails.expiredate.toISOString().split('T')[0];
           
            if (formattedCouponDate >= formattedCurrentDate) {
                console.log('Coupon is still valid.');
                const couponDiscount = parseFloat(couponDetails.discount);
                const discountAmount = (couponDiscount / 100) * totalAmount;
                const saveAmount = parseFloat(discountAmount.toFixed(2
                    )) 
                const subtotal = totalAmount - discountAmount
                res.json({subtotal:subtotal,c_discount:couponDiscount,saveAmount:saveAmount})
            }else{
                const message = "coupon has expired"
                res.json({message:message})
            }
        }else{
            const message1 = "coupon not valid"
            res.json({message1:message1})
        }
        
        

        
    } catch (error) {
        console.log(error.message)
    }
}
//my account page 
const myAccount = async(req,res)=>{
    try {
        let userid = req.session.user;
        const user = await User.findOne({_id:userid})
        const category = await Category.find({})
        let count = await cartCount(userid)
        res.render('myaccount',{user,category,count})
       
    } catch (error) {
        console.log(error.message)
    }
}
//editmyAccount
const editmyAccount = async(req,res)=>{
    try {
        let userid = req.session.user;
        const user = await User.findOne({_id:userid})
        const category = await Category.find({})
        let count = await cartCount(userid)
        res.render('editmyaccount',{user,category,count})
    } catch (error) {
        console.log(error.message)
    }
}
//updatemyAccount details
const updatemyAccount = async(req,res)=>{
    try {
        const userid = req.session.user;
        const category = await Category.find({})
         let count = await cartCount(userid)
        const newname = req.body.name;
        const mobile = req.body.mobile;
        const gender = req.body.gender;
        const user = await User.findOne({_id:userid});
            const userPasswordUpdate = await User.updateOne( { _id:userid}, { $set: { name: newname,mobile:mobile,gender:gender}});
            res.redirect('/myaccount')
        
    } catch (error) {
        console.log(error.message)
    }
}
//load mywallet page
const myWallet = async(req,res)=>{
    try {
        const userid = req.session.user;
        const user = await User.findOne({_id:userid})
        const category = await Category.find({})
        let count = await cartCount(userid)
        const wallet = await Wallet.findOne({user_id:userid});
        
        if(!wallet){
            const wallet = new Wallet({
                user_id:userid,
                amount:0
            })
            const newwallet = await wallet.save();
        }
        const wallet_transaction = await Wallet_transaction.find({user_id:userid}).sort({ date: -1 })
        res.render('wallet',{user,category,count,wallet,wallet_transaction,moment});

    } catch (error) {
        console.log(error.message)
    }
}
//invoice download
const downloadInvoice = async(req,res)=>{
    try {
        const orderId = req.query.id
        
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
                    subtotal:1,
                    couponcode:1,
                    coupondiscount:1,
                    discountAmount:1,
                    order_status:1,
                    OrderID:1,
                    payment:1,
                    netbankingAmount:1,
                    walletAmount:1,
                    productDetails:{$arrayElemAt:['$productDetails',0]},
                    date:1,
                     
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
                    subtotal:1,
                    couponcode:1,
                    coupondiscount:1,
                    discountAmount:1,
                    order_status:1,
                    OrderID:1,
                    payment:1,
                    netbankingAmount:1,
                    walletAmount:1,
                    address: { $arrayElemAt: ['$addressDetails', 0] },
                    date:1,
                    productDetails:1
                }
            }
         
        ])
        if (!orderDetail || orderDetail.length === 0) {
            return res.status(404).send('Order not found');
        }
       
        console.log("orderDetail:", JSON.stringify(orderDetail))
        
       

        const formattedInvoiceDate = new Date(orderDetail[0].date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const data = {
            orderDetail:orderDetail,
            formattedInvoiceDate:formattedInvoiceDate
           }
           const filePathName = path.resolve(__dirname,'../views/users/invoice.ejs');
           const htmlString = fs.readFileSync(filePathName).toString();   
           const styledHtmlString = `
           <style>
           body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            background-color: #f7f7f7;
        }

        .invoice-header {
           
            margin-bottom: 20px;
            background-color: #fcdcf3;
            color: black;
            padding: 20px;
            display: flex;
            justify-content: space-between;
        }

        .invoice-address {
            margin-bottom: 20px;
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .invoice-details {
            margin-bottom: 20px;
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .invoice-table th,
        .invoice-table td {
            border: 1px solid #ddd;
            padding: 15px;
            text-align: left;
        }

        .invoice-total {
            text-align: right;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }
    </style>
    ${htmlString}`;
    let options = {
        format:'A4',
        orientation:"portrait",
        border:"10mm"
       }
       const ejsData = ejs.render(styledHtmlString,data);
       pdf.create(ejsData,options).toFile('invoice.pdf',(err,response)=>{
        if(err) console.log(err);

       const filePath = path.resolve(__dirname,'../invoice.pdf');
        fs.readFile(filePath,(err,file)=>{
            if(err){
                console.log(err);
                return res.status(500).send('could not download')
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment;filename="invoice.pdf"');
            res.send(file);
        })
       });

        
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Error generating invoice');
    }
}
//load contact us form
const contactUs = async(req,res)=>{
    try {
        
        const category = await Category.find({})
        
        let count = null
        res.render('contactUs',{category,count});
    } catch (error) {
        console.log(error.message)
    }
}
//send sendContactUsDetail 
const sendContactUsDetail = async(req,res)=>{
    try {
        const category = await Category.find({})
        let count = null
        const name= req.body.name;
        const email = req.body.email;
        const telephone = req.body.telephone;
        const comment = req.body.comment;
        const textContent = `Name: ${name}\nEmail: ${email}\nTelephone: ${telephone}\nComment: ${comment}`;
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:'deepakh2014@gmail.com',
                pass:'ukggrqmlldzwjfke'
            }
        });
        const mailOptions = {
            from:'deepakh2014@gmail.com',
            to:'beautyboanza@gmail.com',
            subject:'Contact Us Form Submission',
            text:textContent
        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }
            else{
                res.render('contactUs',{category,count,message:'Email send sucessfully'});
            }
        })
       
    } catch (error) {
        console.log(error.message)
    }
}

//load about us page
const aboutUs = async(req,res)=>{
    try {
        const category = await Category.find({})
        
        let count = null
        res.render('aboutUs',{category,count});
    } catch (error) {
        console.log(error.message)
    }
}
//load terms and conditions
const terms_and_conditions = async(req,res)=>{
    try {
        const category = await Category.find({})
        
        let count = null
        res.render('terms&condition',{category,count});
    } catch (error) {
        console.log(error.message)
    }
}
//load privacy policy
const privacy_policy = async(req,res)=>{
    try {
        const category = await Category.find({})
        
        let count = null
        res.render('privacy_policy',{category,count});
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadRegister,
    manage_reg,
    loadLogin,
    manage_user,
    forgetLoad ,
    manage_passwordchange,
    loadHome,
    loadShop,
    loadCategory,
    resend,
    loadViewPage,
    search,
    logout,
    loadCart,
    addToCart,
    plusbuttoninc,
    minusbuttondec,
    productRemove,
    addressList,
    addAddress,
    saveAddress,
    payment,
    choosePayment,
    checkout,
    orderHistory,
    orderDetails,
    myAddresses,
    editAddress,
    updateAddress,
    deleteAddress,
    userChangePassword,
    updateChangePassword,
    updateLimit,
    updatequantity,
    cancelOrder,
    returnOrder,
    addToWishlist,
    removeFromWishlist,
    loadWishlist,
    checkCoupon,
    onlinePayment,
    verifyPayment,
    success,
    myAccount,
    editmyAccount,
    updatemyAccount,
    myWallet,
    downloadInvoice,
    contactUs,
    sendContactUsDetail,
    aboutUs,
    terms_and_conditions,
    privacy_policy
}