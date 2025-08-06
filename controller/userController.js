const { validationResult } = require('express-validator')
const otpModel = require('../model/otpModel')
const userModel = require('../model/userModel')
const generateOtp = require('../helper/randomOtp')
const bcrypt = require('bcrypt')
const mailSender = require('../utils/mailSender')


const loadLogin = (req, res) => {
    res.render('user/login')
}

const loadSignup = (req, res) => {
    res.render('user/signup')
}

const signup = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.render('user/signup', { message: "invalid credentials", icon: "error" })
        }
        const { name, email, mobile, password, confirmPassword } = req.body
        
        // checking for email exists
        const user = await userModel.findOne({ email })
        if (user) return res.render('user/login', { message: "User already exists", icon: "info" })
        
        // checking for mobile number exists
        const mobileExists = await userModel.findOne({ mobile })
        if(mobileExists) return res.render('user/signup',{message:"Phone number already exists", icon:"warning"})
        
        req.session.user = {
            name,
            email,
            mobile,
            password,
            confirmPassword
        }

        // generating otp
        let otp = generateOtp()

        // update if exists else insert
        const result = await otpModel.updateOne(
            { email }, 
            { $set: { otp, createdAt: Date.now() } }, 
            { upsert: true } 
        )

        // if any updation or modification done sending email to user
        if (result.upsertedCount > 0 || result.modifiedCount > 0) {
            await mailSender(email, otp)
        }
        res.render('user/otpValidation',{url:"/user/validate_otp"})
    } catch (error) {
        console.log(error)
    }
}

const validateOtp = async (req, res) => {
    const { otp } = req.body
    const { name, email, mobile, password } = req.session.user
    const savedOtp = await otpModel.findOne({ email })
    if (!savedOtp) return res.render('user/otpValidation', { message: "OTP expired, request a new one", icon: "info" })
    if (otp !== savedOtp.otp) return res.render('user/otpValidation', { message: "Invalid OTP", icon: "error" })
    const hashedPassword = await bcrypt.hash(password, 12)
    const newUser = new userModel({
        name,
        email,
        mobile,
        password: hashedPassword,
    })
    await newUser.save()
    res.render('user/login', {message:"User created", icon:"success"})
}



module.exports = {
    loadLogin,
    loadSignup,
    signup,
    validateOtp,
}