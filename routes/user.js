const router = require('express').Router()
const userController = require('../controller/user/userAuthController')
const landingController = require('../controller/user/landingController')
const productPageController = require('../controller/user/productPageController')
const accountController = require('../controller/user/accountController')

const shopController = require('../controller/user/shopController')
const { validate, validateSignin } = require('../middleware/validator')
const passport = require('passport')
const userAuth = require('../middleware/userAuth')

// User routes
router.route('/login')
    .get(userAuth.isSession,userController.loadLogin)
    .post(userAuth.isSession, userController.loginUser)

router.route('/signup')
    .get(userAuth.isSession,userController.loadSignup)
    .post(userAuth.isSession,validate, userController.signup)

router.route('/validate_otp')
    .post(userAuth.isSession, userController.validateOtp)
    .get(userAuth.isSession, userController.resendOtp)
router.post('/validate_login',validateSignin,userController.validateLogin)

router.get('/landing_page', landingController.loadLandingPage) // userAuth.isAuthenticated,

router.route('/forgot_password')
    .get(userAuth.isSession, userController.loadForgotPass)
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

// account
router.get('/account', accountController.showPage)
router.get('/account/:id', accountController.showEditPage)

module.exports = router