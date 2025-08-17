const router = require('express').Router()
const adminController = require('../controller/admin/adminAuthController')
const categoryController = require('../controller/admin/categoryController')
const dashboardController = require('../controller/admin/dashboardController')
const userController = require('../controller/admin/userManagement')
const productController = require('../controller/admin/productController')
const orderController = require('../controller/admin/ordersManagement')
const bannerController = require('../controller/admin/bannerManagement')
const couponController = require('../controller/admin/couponController')
const salesController = require('../controller/admin/salesManagement')
const profileSettings = require('../controller/admin/profileSetting')
const { validateSignin } = require('../middleware/validator')
const adminAuth = require('../middleware/adminAuth')
const upload = require('../config/multerUpload')


// login
router.route('/login')
    .get(adminAuth.isSession,adminController.loadLogin)
    .post(validateSignin, adminController.loginAdmin)

// logout
router.get('/logout', adminController.logout)

// dashboard
router.route('/dashboard')
    .get(adminAuth.isAuthenticated, dashboardController.loadDashboard)

// user
router.route('/users')
    .get(userController.loadUsers)
router.patch('/users/edit', userController.editUser)
router.route('/users/:id/edit')
    .get(userController.loadUserEdit)
router.get('/users/search', userController.searchUser)
router.patch('/users/:id/block', userController.changeUserStatus)
router.patch('/users/:id/active', userController.changeUserStatus)

// products
router.route('/products')
    .get(productController.loadProducts)
router.route('/products/add')
    .get(productController.loadProductsAdd)
    .post(upload.fields([{name:'coverImage', maxCount:5},{name:'thumbnail', maxCount:1}]), productController.addProduct)
router.get('/products/:_id/edit', productController.editProduct)

// orders
router.route('/orders')
    .get(orderController.loadOrders)
router.get('/orders/search', orderController.showOrders)

// banners
router.route('/banners')
    .get(bannerController.loadBanners)

// coupon
router.route('/coupons')
    .get(couponController.loadCoupons)

//sales
router.route('/sales')
    .get(salesController.loadSales)


// Category routes
router.route('/category')
    .get(categoryController.loadCategory)
    .post(categoryController.addCategory)
    .patch(categoryController.editCategory)
router.get('/category/search', categoryController.showCategorys)
router.get('/category/:id', categoryController.showDetails)
router.patch('/category/:id/block', categoryController.changeCategoryStatus)
router.patch('/category/:id/active', categoryController.changeCategoryStatus)

// settings
router.route('/settings')
    .get(profileSettings.loadSettings)

module.exports = router