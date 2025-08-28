  const router = require('express').Router()
  const userController = require('../controller/user/userAuthController')
  const landingController = require('../controller/user/landingController')
  const productPageController = require('../controller/user/productPageController')
  const accountController = require('../controller/user/accountController')
const orderController = require('../controller/user/orderController')
const addressController = require('../controller/user/addressController')
const cartController = require('../controller/user/cartController')
  const checkoutController = require('../controller/user/checkoutController')

  const shopController = require('../controller/user/shopController')
  const { validate, validateSignin } = require('../middleware/validator')
  const passport = require('passport')
  const userAuth = require('../middleware/userAuth')
  const upload = require('../config/multerUpload')

  // ---------- dev codes -----------
    router.use((req, res, next)=> {
        req.session.user = { _id: "68998afac35ccc072487277a", email: "nosnoice@gmail.com" }
        next()
    })
  // --------------------------

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
  router.get('/account', accountController.showPage)
  router.get('/account/:id', accountController.showEditPage)
  router.post('/account/profilephoto', upload, accountController.updateProfilePhoto)
  router.get('/account/profile/info', accountController.getInfo)

  // account details update
  router.post('/verify-password', accountController.verifyPassword)
  router.post('/send-otp', accountController.sendOtp)
  router.post('/verify-otp', accountController.verifyOtp)
  router.post('/account/update', accountController.updateProfile)

  // user/orders 
router.get('/orders', orderController.loadOrders)
  
// user-address
router.get('/manage-address', addressController.loadAddress)
router.route('/manage-address/add')
  .get(addressController.loadAddAddress)
  .post(addressController.addAddress)
router.route('/manage-address/edit')
  .get(addressController.loadEditAddress)
  .post(addressController.setDefault)
  .patch(addressController.updateAddress)
  .delete(addressController.deleteAddress)


// cart
router.get('/cart', cartController.loadCart)
router.post('/cart/add', cartController.addToCart)

// checkout
router.get('/checkout', checkoutController.loadCheckout)

router.get('/logout', userController.logout)

module.exports = router