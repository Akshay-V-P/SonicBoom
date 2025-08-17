const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    developer: {
        type: String,
        required:true
    },
    description: {
        type: String,
        required:true
    },
    categoryId: {
        type:String,
        type: mongoose.Schema.Types.ObjectId,
        ref:'category',
        required:true
    },
    price: {
        type: Number,
        required:true
    },
    offerPrice: {
        type: Number,
        required:true
    },
    coverImage: {
        type: [String],
        default:[],
        required:true
    },
    thumbnail: {
        type: String,
        required:true
    },
    isActive: {
        type: Boolean,
        default:true,
        required:true
    },
    rating: {
        type: Number,
        default:0,
        required:true
    },
    stock: {
        type: Number,
        required:true
    },
    variants: {
        type: [{
            name: { type: String, require: true },
            price: { type: Number, require: true },
            thumbnail: { type: String, require: true },
            stock:{type:String, require:true}
        }],
        default:[],
        required:true
    }
},
    {
    timestamps:true
})

module.exports = mongoose.model('Products', productSchema)