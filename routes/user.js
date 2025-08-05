const router = require('express').Router()
const userController = require('../controller/userController')
const validator = require('../middleware/validator')

router.route('/login')
    .get(userController.loadLogin)

router.route('/signup')
    .get(userController.loadSignup)
    .post(validator, userController.signup)

module.exports = router