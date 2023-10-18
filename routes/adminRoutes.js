const express = require('express');
const admin_route = express();
const session = require('express-session');
const nocache = require('nocache');

const config = require('../config/config');

admin_route.use(session({secret:config.sessionSecret,
                    resave: false,
                    saveUninitialized: true}));

const auth = require('../middleware/admin_auth')

admin_route.use(express.static('public'));

admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin')

admin_route.use(express.json());
admin_route.use(express.urlencoded({extended:true}))

const multer = require('multer');
const path = require('path');

admin_route.use(express.static('public'));

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/categoryimages'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})

const upload = multer({storage:storage});

const subcategorystorage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/subcategoryimages'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})

const subcategoryupload = multer({storage:subcategorystorage})

const productstorage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/productimages'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})


const productupload = multer({ storage: productstorage })

const bannerstorage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/bannerimages'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})

const bannerupload = multer({storage:bannerstorage});



const adminController = require('../controllers/adminController');

admin_route.get('/',auth.isLogout,nocache(),adminController.loadLogin);

admin_route.post('/',nocache(),adminController.variyAdmin);

admin_route.get('/home',auth.isLogin,nocache(),adminController.loadDashboard);

admin_route.post('/home',adminController.dashboardGraph);

admin_route.post('/dashboard_radio1',adminController.dashboardRadio1);

admin_route.post('/dashboard_radio2',adminController.dashboardRadio2);

admin_route.get('/category',auth.isLogin,adminController.loadCategoryList);

admin_route.get('/editcategory',auth.isLogin,adminController.loadEditCategory);

admin_route.post('/editcategory',auth.isLogin,upload.single('image'),adminController.updateCategory);

admin_route.get('/deletecategory',auth.isLogin,adminController.deleteCategory);

admin_route.get('/addcategory',auth.isLogin,nocache(),adminController.loadAddCategory);

admin_route.post('/addcategory',auth.isLogin,nocache(),upload.single('image'),adminController.createCategory);

admin_route.get('/subcategory',auth.isLogin,adminController.loadSubCategoryList);

admin_route.get('/editsubcategory',auth.isLogin,adminController.loadEditSubCategory);

admin_route.post('/editsubcategory',subcategoryupload.single('image'),adminController.updateSubCategory);

admin_route.get('/deletesubcategory',auth.isLogin,adminController.deleteSubCategory);

admin_route.get('/addsubcategory',auth.isLogin,adminController.loadAddSubcategory);

admin_route.post('/addsubcategory',subcategoryupload.single('image'),adminController.createSubcategory);

admin_route.get('/addproduct',auth.isLogin,adminController.loadAddProduct);

admin_route.get('/showsubcategory',auth.isLogin,adminController.subcategory);

admin_route.post('/addproduct',productupload.array('images', 3),adminController.createProduct);

admin_route.get('/product',auth.isLogin,adminController.loadProductList);

admin_route.get('/unlistproduct',auth.isLogin,adminController.loadUnlistProduct);

admin_route.get('/addlistproduct',auth.isLogin,adminController.addListProduct);

admin_route.get('/editproduct',auth.isLogin,adminController.loadEditProduct);

admin_route.post('/editproduct',productupload.array('image',3),adminController.updateProduct);

admin_route.get('/deleteproduct',auth.isLogin,adminController.deleteProduct);

admin_route.get('/customer',auth.isLogin,adminController.loadCustomerList);

admin_route.get('/editcustomer',auth.isLogin,nocache(),adminController.editCustomer);

admin_route.post('/editcustomer',adminController.updateCustomer);

admin_route.get('/deletecustomer',auth.isLogin,adminController.deleteCustomer);

admin_route.post('/search',auth.isLogin,adminController.search);

admin_route.post('/filter',auth.isLogin,adminController.filter);

admin_route.get('/addbanner',auth.isLogin,adminController.loadAddBanner);

admin_route.post('/addbanner',bannerupload.single('image'),adminController.createBanner);

admin_route.get('/banner',auth.isLogin,adminController.loadBannerList);

admin_route.get('/editbanner',auth.isLogin,adminController.loadEditBanner);

admin_route.post('/editbanner',bannerupload.single('image'),adminController.updateBanner);

admin_route.get('/deletebanner',adminController.deleteBanner);

admin_route.get('/orderlist',auth.isLogin,adminController.orderList);

admin_route.get('/orderdetails',auth.isLogin,adminController.orderDetails);

admin_route.get('/cancelorder',auth.isLogin,adminController.cancelOrder);

admin_route.get('/deliverorder',auth.isLogin,adminController.deliverOrder);

admin_route.get('/coupon',auth.isLogin,adminController.couponList);

admin_route.get('/addcoupon',auth.isLogin,adminController.addCoupon);

admin_route.post('/addcoupon',adminController.createCoupon);

admin_route.get('/editcoupon',auth.isLogin,adminController.editCoupon);

admin_route.post('/editcoupon',adminController.updateCoupon);

admin_route.get('/deletecoupon',auth.isLogin,adminController.deleteCoupon);

admin_route.get('/categoryoffer',auth.isLogin,adminController.loadCategoryOffer);

admin_route.get('/editcategoryoffer',auth.isLogin,adminController.editCategoryOffer);

admin_route.post('/editcategoryoffer',adminController.updateCategoryOffer);

admin_route.get('/addcategoryoffer',auth.isLogin,adminController.addCategoryoffer);

admin_route.post('/addcategoryoffer',adminController.createCategoryoffer);

admin_route.get('/deletecategoryoffer',auth.isLogin,adminController.deleteCategoryoffer);

admin_route.get('/sales_report',auth.isLogin,adminController.salesReport);

admin_route.post('/sales_report',adminController.salesReport);

admin_route.get('/salesreport_excel',auth.isLogin,adminController.salesreportExcel);

admin_route.get('/salesreport_pdf',auth.isLogin,adminController.salesreportPdf);

admin_route.get('/return_report',auth.isLogin,adminController.returnReport);

admin_route.post('/return_report',adminController.returnReport);

admin_route.get('/returnreport_excel',auth.isLogin,adminController.returnreportExcel);

admin_route.get('/returnreport_pdf',auth.isLogin,adminController.returnreportPdf);

admin_route.get('/logout',auth.isLogin,nocache(),adminController.logout);


module.exports = admin_route;
