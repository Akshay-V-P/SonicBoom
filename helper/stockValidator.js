const cartModel = require("../model/cartModel")
const productModel = require("../model/productModel")

async function validateStockAvailability(userId) {
    try {

        const cart = await cartModel.findOne({ userId })
        
        for (let item of cart.items) {
            const product = await productModel.findOne({ _id: item.itemId })
            
            const indexOfVariant = product.variants.findIndex((v) => v._id.toString() === item.variantId.toString())
            if(product.variants[indexOfVariant].stock < item.quantity) return false
        }
        
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}


module.exports = validateStockAvailability