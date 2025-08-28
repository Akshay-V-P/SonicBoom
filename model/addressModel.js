const mongoose = require('mongoose')
const addressSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'category',
        required:true
    },
    name: {
        type: String,
        require:true
    },
    state: {
        type: String,
        require:true
    },
    district: {
        type: String,
        require:true
    },
    city: {
        type: String,
        require:true
    },
    address: {
        type: String,
        require:true
    },
    pincode: {
        type: Number,
        require:true
    },
    type: {
        type: String,
        enum: ["Home", "Work"],
        default:"Home",
        require:true
    },
    landmark: {
        type: String,
    },
    mobile: {
        type: Number,
        require:true
    },
    alternateMobile: {
        type: Number,
    },
    email: {
        type: String,
        require:true
    },
    default: {
        type: Boolean,
        default:false,
        require:true
    },
    isActive: {
        type: Boolean,
        default: true,
        required:true
    }
}, {
    timestamps:true
})


module.exports = mongoose.model('Address', addressSchema)