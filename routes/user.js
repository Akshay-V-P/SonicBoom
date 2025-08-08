const router = require('express').Router()
const userController = require('../controller/userController')
const { validate, validateSignin } = require('../middleware/validator')
const passport = require('passport')

// User routes
router.route('/login')
    .get(userController.loadLogin)
    .post(userController.loginUser)

router.route('/signup')
    .get(userController.loadSignup)
    .post(validate, userController.signup)

router.post('/validate_otp',userController.validateOtp)
router.post('/validate_login',validateSignin,userController.validateLogin)

router.get('/landing_page', userController.loadLandingPage)


// GOOGLE login
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// GOOGLE callback
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/user/landing_page')
  }
)

module.exports = router