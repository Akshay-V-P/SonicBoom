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
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true,
    },
    isBlocked: {
        type: Boolean,
        default:false,
        required: true,
    },
    isRemoved: {
        type: Boolean,
        default: false,
        required: true
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