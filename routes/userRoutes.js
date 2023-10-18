const express = require('express');
const user_route = express();
const path = require("path");
const session = require('express-session');
const nocache = require('nocache');


const config = require('../config/config');

user_route.use(session({secret:config.sessionSecret,
                    resave: false,
                    saveUninitialized: true}));

const auth = require('../middleware/auth')

user_route.use(express.static('public'));


user_route.set('view engine','ejs');
user_route.set('views','./views/users');

user_route.use(express.json());
user_route.use(express.urlencoded({extended:false}))


const userController = require('../controllers/userController');

user_route.get('/register',auth.isLogin,nocache(),userController.loadRegister)

user_route.get('/resend',userController.resend)

user_route.post('/register',userController.manage_reg)

user_route.get('/login',auth.isLogin,nocache(),userController.loadLogin)

user_route.post('/login',userController.manage_user)

user_route.get('/forget',auth.isLogin,nocache(),userController.forgetLoad)

user_route.post('/forget',userController.manage_passwordchange);

user_route.get('/home',nocache(),userController.loadHome);

user_route.get('/shop',userController.loadShop);

user_route.get('/category',userController.loadCategory);

user_route.get('/product_view',nocache(),userController.loadViewPage);

user_route.post('/search',userController.search);

user_route.get('/search',userController.search);

user_route.get('/logout',auth.isLogout,nocache(),userController.logout);

user_route.get('/cart',auth.isLogout,nocache(),userController.loadCart);

user_route.get('/add-to-cart',auth.isLogout,userController.addToCart);

user_route.get('/add-to-wishlist',auth.isLogout,nocache(),userController.addToWishlist);

user_route.get('/remove-from-wishlist',auth.isLogout,userController.removeFromWishlist);

user_route.post('/plusbuttoninc',userController.plusbuttoninc);

user_route.post('/minusbuttondec',userController.minusbuttondec);

user_route.post('/updatelimit',userController.updateLimit);

user_route.post('/updatequantity',userController.updatequantity);

user_route.get('/productremove',auth.isLogout,nocache(),userController.productRemove);

user_route.get('/address',auth.isLogout,nocache(),userController.addressList);

user_route.get('/addaddress',auth.isLogout,nocache(),userController.addAddress);

user_route.post('/addaddress',userController.saveAddress);

user_route.post('/payment',auth.isLogout,userController.payment);

user_route.get('/paymentpage',auth.isLogout,nocache(),userController.choosePayment);

user_route.get('/checkout',auth.isLogout,nocache(),userController.checkout);

user_route.post('/onlinepayment',auth.isLogout,userController.onlinePayment);

user_route.post('/verify-payment',auth.isLogout,userController.verifyPayment);

user_route.get('/orderhistory',auth.isLogout,nocache(),userController.orderHistory);

user_route.get('/orderdetails',auth.isLogout,nocache(),userController.orderDetails);

user_route.get('/cancelorder',auth.isLogout,nocache(),userController.cancelOrder);

user_route.post('/returnorder',auth.isLogout,nocache(),userController.returnOrder);

user_route.get('/myaddress',auth.isLogout,nocache(),userController.myAddresses);

user_route.get('/editaddress',auth.isLogout,nocache(),userController.editAddress);

user_route.post('/editaddress',auth.isLogout,nocache(),userController.updateAddress);

user_route.get('/deleteaddress',auth.isLogout,nocache(),userController.deleteAddress);

user_route.get('/change_password',auth.isLogout,nocache(),userController.userChangePassword);

user_route.post('/change_password',auth.isLogout,nocache(),userController.updateChangePassword);

user_route.get('/wishlist',auth.isLogout,nocache(),userController.loadWishlist);

user_route.post('/checkcoupon',userController.checkCoupon);

user_route.get('/success',auth.isLogout,nocache(),userController.success);

user_route.get('/myaccount',auth.isLogout,nocache(),userController.myAccount);

user_route.post('/myaccount',userController.editmyAccount);

user_route.post('/editmyaccount',auth.isLogout,nocache(),userController.updatemyAccount);

user_route.get('/mywallet',auth.isLogout,nocache(),userController.myWallet);

user_route.get('/download_invoice',auth.isLogout,nocache(),userController.downloadInvoice);

user_route.get('/contactUs',nocache(),userController.contactUs);

user_route.post('/contactUs',nocache(),userController.sendContactUsDetail);

user_route.get('/aboutUs',userController.aboutUs);

user_route.get('/terms_and_conditions',userController.terms_and_conditions);

user_route.get('/privacy_policy',userController.privacy_policy);

module.exports = user_route;