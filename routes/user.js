  const router = require('express').Router()
  const userController = require('../controller/user/userAuthController')
  const landingController = require('../controller/user/landingController')
  const productPageController = require('../controller/user/productPageController')
  const accountController = require('../controller/user/accountController')
const orderController = require('../controller/user/orderController')
const addressController = require('../controller/user/addressController')
const cartController = require('../controller/user/cartController')
const checkoutController = require('../controller/user/checkoutController')
  const wishlistController = require('../controller/user/wishlistController')

  const shopController = require('../controller/user/shopController')
  const { validate, validateSignin } = require('../middleware/validator')
  const passport = require('passport')
  const userAuth = require('../middleware/userAuth')
  const upload = require('../config/multerUpload')
const ordersModel = require('../model/ordersModel')

  // ---------- dev codes -----------
router.use((req, res, next) => {
  req.session.user = { _id: '68a9ab4e5584c7d280baa625', email:"akshayvp002@gmail.com" }
  next()
})
  // --------------------------------

  // User routes
  router.route('/login')
      .get(userAuth.isSession,userController.loadLogin)
      .post(userAuth.isSession, userController.loginUser)

  router.route('/signup')
      .get(userAuth.isSession,userController.loadSignup)
      .post(userAuth.isSession,validate, userController.signup)

  router.route('/validate_otp')
      .post(userController.validateOtp)
      .get(userController.resendOtp)
  router.post('/validate_login', validateSignin, userController.validateLogin)
  router.post('/validate_reset', userController.validateResetEmail)

  router.get('/landing_page', landingController.loadLandingPage) // userAuth.isAuthenticated,

  router.route('/forgot_password')
      .get(userController.loadForgotPass)
      .post(userController.verifyEmail)

  router.patch('/forgot_password/reset', userController.resetPassword)



  // GOOGLE login
  router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

  // GOOGLE callback
  router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/user/login?error=Account Blocked' }),
    (req, res) => {
      res.redirect('/user/landing_page')
    }
  )



  // shop router
  router.get('/shop', shopController.showShop)
  router.get('/shop/load', shopController.loadShopContents)

  // product details page
router.get('/product_details', productPageController.showPage)
router.get('/product-info', productPageController.getInfo)

  // account
  router.get('/account',userAuth.isAuthenticated, accountController.showPage)
  router.get('/account/:id',userAuth.isAuthenticated, accountController.showEditPage)
  router.post('/account/profilephoto',userAuth.isAuthenticated, upload, accountController.updateProfilePhoto)
  router.get('/account/profile/info',userAuth.isAuthenticated, accountController.getInfo)

  // account details update
  router.post('/verify-password',userAuth.isAuthenticated, accountController.verifyPassword)
  router.post('/send-otp',userAuth.isAuthenticated, accountController.sendOtp)
  router.post('/verify-otp',userAuth.isAuthenticated, accountController.verifyOtp)
  router.post('/account/update',userAuth.isAuthenticated, accountController.updateProfile)

  // user/orders 
router.get('/orders',userAuth.isAuthenticated, orderController.loadOrders)
router.get('/orders/details', userAuth.isAuthenticated, orderController.loadDetails)
router.get('/orders/status', userAuth.isAuthenticated, orderController.loadOrderStatus)
router.patch('/orders/cancel', userAuth.isAuthenticated, orderController.cancelOrder)
router.patch('/orders/cancel-item', userAuth.isAuthenticated, orderController.cancelItem)
router.patch('/orders/return-item', userAuth.isAuthenticated, orderController.returnItem)

// invoice download
router.get('/orders/download-invoice/:orderId', userAuth.isAuthenticated, orderController.downloadInvoice)
  
// user-address
router.get('/manage-address',userAuth.isAuthenticated, addressController.loadAddress)
router.route('/manage-address/add')
  .get(userAuth.isAuthenticated,addressController.loadAddAddress)
  .post(userAuth.isAuthenticated,addressController.addAddress)
router.route('/manage-address/edit')
  .get(userAuth.isAuthenticated, addressController.loadEditAddress)
  .post(userAuth.isAuthenticated, addressController.setDefault)
  .patch(userAuth.isAuthenticated, addressController.updateAddress)
  .delete(userAuth.isAuthenticated, addressController.deleteAddress)


// cart
router.get('/cart',userAuth.isAuthenticated, cartController.loadCart)
router.get('/cart/details',userAuth.isAuthenticated, cartController.cartDetails)
router.post('/cart/add',userAuth.isAuthenticated, cartController.addToCart)
router.post('/cart/remove',userAuth.isAuthenticated, cartController.removeFromCart)
router.post('/cart/decrement', userAuth.isAuthenticated, cartController.decrementQuantity)

// wishlist 
router.get('/wishlist', userAuth.isAuthenticated, wishlistController.loadWishlist)
router.get('/api/wishlist/details', wishlistController.getDetails)
router.post('/api/wishlist/add', wishlistController.addToWishlist)
router.post('/api/wishlist/remove', wishlistController.removeFromWishlist)

// checkout
router.get('/checkout',userAuth.isAuthenticated, checkoutController.loadCheckout)
router.get('/checkout/details',userAuth.isAuthenticated, checkoutController.loadDetails)
router.post('/checkout/place-order',userAuth.isAuthenticated, checkoutController.placeOrder)
router.get('/order-success',userAuth.isAuthenticated, checkoutController.loadOrderSuccess)

router.get('/logout',userAuth.isAuthenticated, userController.logout)

module.exports = router