const mongoose = require('mongoose')

function createReferralCode() {
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    console.log(referralCode)
    return referralCode
}

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    mobile: {
        type: String,
        unique: true,
        sparse:true,
        required: function () {
            return !this.googleId
        }
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId
        },
    },
    referralCode: {
        type: String,
        required: true,
        default:createReferralCode,
        unique:true
    },
    usedReferralCode: {
        type: String,
    },
    profilePhoto: {
        type: String,
        default:"https://res.cloudinary.com/dnmpesolv/image/upload/v1755940464/profile-placeholder_fnbhjm.png"
    },
    googleId: {
        type:String
    },
    isBlocked: {
        type: Boolean,
        default:false,
        required: true,
    },
    role: {
        type: String,
        enum:['user', 'admin'],
        default:"user",
        required: true,
    }
}, {
    timestamps:true
})



module.exports = mongoose.model('Users', userSchema)