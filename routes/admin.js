const router = require('express').Router()
const adminController = require('../controller/adminController')
const { validateSignin } = require('../middleware/validator')
const adminAuth = require('../middleware/adminAuth')
const upload = require('../config/multerUpload')



router.route('/login')
    .get(adminAuth.isSession,adminController.loadLogin)
    .post(validateSignin, adminController.loginAdmin)

router.route('/dashboard')
    .get(adminAuth.isAuthenticated, adminController.loadDashboard)

router.get('/logout', adminController.logout)

router.route('/users')
    .get(adminController.loadUsers)

router.patch('/users/edit', adminController.editUser)

router.route('/users/:id/edit')
    .get(adminController.loadUserEdit)
router.get('/users/search', adminController.searchUser)
router.patch('/users/:id/block', adminController.changeUserStatus)
router.patch('/users/:id/active', adminController.changeUserStatus)

router.route('/products')
    .get(adminController.loadProducts)

router.route('/products/add')
    .get(adminController.loadProductsAdd)
    .post(upload.fields([{name:'coverImage', maxCount:1},{name:'thumbnail', maxCount:1}]), adminController.addProduct)

router.get('/products/:_id/edit', adminController.editProduct)

router.route('/orders')
    .get(adminController.loadOrders)

router.route('/banners')
    .get(adminController.loadBanners)

router.route('/coupons')
    .get(adminController.loadCoupons)

router.route('/sales')
    .get(adminController.loadSales)

router.route('/category')
    .get(adminController.loadCategory)

router.route('/settings')
    .get(adminController.loadSettings)

module.exports = router