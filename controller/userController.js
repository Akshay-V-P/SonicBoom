const {validationResult} = require('express-validator')


const loadLogin = (req, res) => {
    res.render('user/login')
}

const loadSignup = (req, res) => {
    res.render('user/signup')
}

const signup = async (req, res) => {
    try {
        console.log(req.body)
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors:errors.array()})
        }

        res.send('No validation errors')
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    loadLogin,
    loadSignup,
    signup
}