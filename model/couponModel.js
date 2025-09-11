const mongoose = require('mongoose')

const couponSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique:true
    },
    description: {
        type: String,
        required:true
    },
    discount: {
        type: Number,
        required:true
    },
    discountType: {
        type: String,
        enum: ["percentage", "amount"],
        default:"amount",
        required:true
    },
    maxDiscount: {
        type: Number,
        required:true
    },
    minPurchase: {
        type: Number,
        default:0,
        required:true
    },
    isActive: {
        type: Boolean,
        default:true,
        required:true
    },
    usedBy: {
        type: [mongoose.Schema.Types.ObjectId]
    },
    expiryDate: {
        type: Date,
        required:true
    }
}, {
    timestamps:true
})


module.exports = mongoose.model("coupons", couponSchema)