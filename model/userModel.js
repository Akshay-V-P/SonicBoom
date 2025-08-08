const mongoose = require('mongoose')

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
        required: function () {
            return !this.googleId
        },
        unique:true
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId
        },
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
        enum:['User', 'Admin'],
        default:"User",
        required: true,
    }
}, {
    timestamps:true
})

module.exports = mongoose.model('Users', userSchema)