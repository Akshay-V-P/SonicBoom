const router = require('express').Router()
const userController = require('../controller/userController')
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

router.get('/landing_page',userAuth.isAuthenticated, userController.loadLandingPage)

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

module.exports = router