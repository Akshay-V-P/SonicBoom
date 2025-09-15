const otpModel = require("../../model/otpModel")
const userModel = require("../../model/userModel")
const bcrypt = require('bcrypt')
const generateOtp = require('../../helper/randomOtp')
const mailSender = require('../../utils/mailSender')

const showPage = async (req, res) => {
    try {
        const { message } = req.query
        const _id = req.session.user._id
        if(!_id) return res.redirect('/login')
        const user = await userModel.findOne({ _id })
        if(!user) return res.redirect('/login')
        res.render('user/account', {layout:'userAccount', user, message})
    } catch (error) {
        console.log(error)
    }
}

const getInfo = async (req, res) => {
    try {
        const {_id} = req.session.user
        const user = await userModel.findOne({ _id })
        if (!user) return res.status(404).json({ success: false })
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false})
    }
}

const showEditPage = async (req, res) => {
    try {
        const { id } = req.params
        const user = await userModel.findOne({ _id: id, isBlocked:false })
        if(!user) return res.redirect('/account')
        res.render('user/editAccount', {layout:'userAccount', user})
    } catch (error) {
        console.log(error)
    }
}

const updateProfilePhoto = async (req, res) => {
    try {
        const { _id } = req.query
        const filePath = req.files[0].path
        if (filePath) {
            await userModel.updateOne({_id}, {$set:{profilePhoto:filePath}})
        } else {
            return res.status(400).json({message:"Can't upload image"})
        }
        res.status(200).json({ message: "Profile Photo Updated", profilePhoto:filePath })
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

const verifyPassword = async (req, res) => {
    try {
        const { userId, password } = req.body

        const user = await userModel.findOne({ _id: userId })
        if (!user) return res.status(404).json({ success: false })
        
        const matchPass = await bcrypt.compare(password, user.password)
        if (!matchPass) return res.status(401).json({ success: false })
        
        console.log("password verified")
        res.status(200).json({success:true})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false})
    }
}

const sendOtp = async (req, res) => {
    try {
        console.log("Enterd to sendOtp")
        const { newEmail, userId } = req.body
        let otp = generateOtp()

        const result = await otpModel.updateOne(
            { email:newEmail },
            { $set: { otp, createdAt: Date.now() } },
            { upsert: true }
        )
        if (result.upsertedCount > 0 || result.modifiedCount > 0) {
            await mailSender(newEmail, otp)
        }
        res.status(200).json({success:true})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false})
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { otp, userId, newEmail } = req.body
        const isOtp = await otpModel.findOne({ email:newEmail })
        if (!isOtp) return res.status(404).json({ success: false })
        if (otp !== isOtp.otp) return res.status(401).json({ success: false })
        res.status(200).json({success:true})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false})
    }
}

const updateProfile = async (req, res) => {
    try {
        let body = {}
        const { _id } = req.query
        
        if (req.body.name) {
            body.name = req.body.name
        }
        if (req.body.mobile) {
            body.mobile = req.body.mobile
        }
        if (req.body.email) {
            body.email = req.body.email
        }
        const emailExist = await userModel.find({ email: req.body.email })
        if (emailExist.length == 0) return res.status(401).json({ success: false })
        
        const mobileExist = await userModel.findOne({ mobile: req.body.mobile })
        if(mobileExist && (mobileExist._id !== emailExist._id)) return res.status(401).json({success:false})
        
        const user = await userModel.findOne({ _id })
        if (!user) return res.status(404).json({ success: false })
        if (user.isBlocked) return res.status(401).json({ success: false })
        
        await userModel.updateOne({ _id }, { $set: body })
        res.status(200).json({success:true})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false})
    }
}


module.exports = {
    showPage,
    getInfo,
    showEditPage,
    updateProfilePhoto,
    verifyPassword,
    sendOtp,
    verifyOtp,
    updateProfile,
}