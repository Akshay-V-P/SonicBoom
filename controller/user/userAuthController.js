const { validationResult } = require('express-validator')
const otpModel = require('../../model/otpModel')
const userModel = require('../../model/userModel')
const generateOtp = require('../../helper/randomOtp')
const bcrypt = require('bcrypt')
const mailSender = require('../../utils/mailSender')

// Page loading functions
const loadLogin = (req, res) => {
    const error = req.query.error
    res.render('user/login',{message:error, icon:'error'})
}

const loadSignup = (req, res) => {
    res.render('user/signup')
}


// Authentication functions
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
        
        req.session.tempUser = {
            name,
            email,
            mobile,
            password,
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
        res.render('user/otpValidation',{url:"/user/validate_otp", createdAt: Date.now()})
    } catch (error) {
        console.log(error)
    }
}

const validateOtp = async (req, res) => {
    try {
        console.log('validate')
        const { otp } = req.body
        const { name, email, mobile, password } = req.session.tempUser
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
        req.user = {email}
        res.render('user/login', {message:"User created", icon:"success"})
    } catch (error) {
        console.log(error)
    }
}

const loginUser = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.render('user/signin', { message: "invalid credentials", icon: "error" })
        }
        
        const { email, password } = req.body
        
        const user = await userModel.findOne({ email })
        if (!user) return res.render('user/login', { message: "User not found", icon: "error" })
        
        if(user.isBlocked) return res.render('user/login', {message: "User is Blocked, Please contact Administration", icon:"error"})
        
        const matchPass = await bcrypt.compare(password, user.password)
        if (!matchPass) return res.render('user/login', { message: "Invalid Password", icon: "error" })
        
        let otp = generateOtp()

        const result = await otpModel.updateOne(
            { email },
            { $set: { otp, createdAt: Date.now() } },
            { upsert: true }
        )

        if (result.upsertedCount > 0 || result.modifiedCount > 0) {
            await mailSender(email, otp)
        }

        req.session.tempUser = user.email
        const sendOtp = await otpModel.findOne({email})
        res.render('user/otpValidation', { url: "/user/validate_login", createdAt: sendOtp.createdAt.getTime()})
    } catch (error) {
        console.log(error)
        res.render('user/500Error', { url: "/user/login" })
    }
}

const validateLogin = async (req, res) => {
    try {
        const { otp } = req.body
        
        const email = req.session.tempUser
        const savedOtp = await otpModel.findOne({ email })
        if (!savedOtp) {
            return res.render('user/otpValidation', {
                message: "OTP expired, request a new one",
                icon: "info",
                url: "/user/validate_login", // <-- Add this
                // Pass a timestamp from the past to ensure the timer is expired on the frontend
                createdAt: Date.now() - 61000 // <-- Add this
            });
        }
        if (otp !== savedOtp.otp) {
            return res.render('user/otpValidation', {
                message: "Invalid OTP",
                icon: "error",
                url: "/user/validate_login", // <-- Add this
                // Pass the original timestamp back to continue the timer
                createdAt: savedOtp.createdAt.getTime() // <-- Add this
            });
        }
        req.session.user = email
        res.redirect('/user/landing_page')
    } catch (error) {
        console.log(error)
    }
}

const resendOtp = async (req, res) => {
    try {
        // 1. Correctly retrieve email from the session for both signup and login flows
        const tempUser = req.session.tempUser;
        if (!tempUser) {
            return res.status(400).json({ success: false, message: "Session has expired. Please start over." });
        }
        // This handles cases where tempUser is an object (signup) or a string (login)
        const email = (typeof tempUser === 'string') ? tempUser : tempUser.email;

        // 2. Find the last OTP sent to this email to check its timestamp
        const otpDetails = await otpModel.findOne({ email });

        const now = Date.now();
        // Calculate the time difference in seconds. Default to 61 if no OTP exists.
        const timeDiff = otpDetails ? (now - otpDetails.createdAt.getTime()) / 1000 : 61;

        // 3. Prevent spamming by enforcing a 60-second cooldown period
        if (timeDiff < 60) {
            const timeLeft = Math.ceil(60 - timeDiff);
            // Respond with a "Too Many Requests" status and a helpful message
            return res.status(429).json({
                success: false,
                message: `Please wait ${timeLeft} more seconds before resending.`
            });
        }

        // 4. Generate a new OTP and send it via email
        const newOtp = generateOtp();
        await mailSender(email, newOtp);

        // 5. Update the database with the new OTP and the current timestamp
        await otpModel.updateOne(
            { email },
            { $set: { otp: newOtp, createdAt: now } },
            { upsert: true }
        );

        // 6. Send a success response back to the client with the new timestamp
        res.status(200).json({
            success: true,
            message: "A new OTP has been sent to your email.",
            createdAt: now 
        });

    } catch (error) {
        console.error("Error in resendOtp:", error);
        res.status(500).json({ success: false, message: "An internal server error occurred." });
    }
};



// Forgot password

const loadForgotPass = (req, res) => {
    res.render('user/forgotPassword')
}

const verifyEmail = async (req, res) => {
    try {
        const { email } = req.body
        const user = await userModel.findOne({ email })

        if (!user) return res.render('user/forgotPassword', { message: "Can't find user with this Email", icon: "info" })
        
        if(user.isBlocked) return res.render('user/forgotPassword', {message:"User is blocked please contact Administration"})
        req.session.resetUser = user
        res.render('user/resetPassword')
    } catch (error) {
        console.log(error)
        res.render('user/500Error')
    }
}

const resetPassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body
        console.log()
        const user = await userModel.findOne({ email: req.session.resetUser.email })
        if (!user) return res.render('user/resetPassword', { message: "unable to find user", icon: "error" })
        
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        user.password = hashedPassword
        await user.save()
        res.status(200).json({message:"Password updated successfully"})
    } catch (error) {
        console.log(error)
        res.render('user/500Error')
    }
}


module.exports = {
    loadLogin,
    loadSignup,
    signup,
    validateOtp,
    loginUser,
    validateLogin,
    resendOtp,
    loadForgotPass,
    verifyEmail,
    resetPassword,
}