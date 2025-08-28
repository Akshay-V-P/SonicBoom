const mongoose = require('mongoose')
const cartModel = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    items: {
        type: [{
            itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
            variantId:{type:mongoose.Schema.Types.ObjectId, required:true},
            quantity: { type: Number, required: true }
        }],
        default:[]
    }
}, {
    timestamps:true
})


module.exports = mongoose.model('Cart', cartModel)