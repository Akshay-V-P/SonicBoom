const cartModel = require("../../model/cartModel")
const productModel = require("../../model/productModel")
const wishlistModel = require("../../model/wishlistModel")

const loadCart = (req, res) => {
    res.render('user/cart', {layout:'user'})
}


const addToCart = async (req, res) => {
    try {
        const { _id } = req.query
        const variantId = req.query.variantId || null
        const userId = req.session.user._id
        const product = await productModel.findOne({ _id })
        if (!product) return res.status(404).json({ success: false })
        if (!product.isListed || !product.isActive) return res.status(401).json({ success: false })
        if (variantId) {
            var variantIndex = product.variants.findIndex(variant => variant._id.toString() == variantId.toString())
            if(product.variants[variantIndex].stock < 1)return res.status(401).json({success:false})

        } else if (product.stock < 1) return res.status(401).json({ success: false })
        
        
        let cart = await cartModel.findOne({ userId })
        if (!cart) {
            cart = new cartModel({
                userId,
                items:[{itemId:variantId?variantId:_id, variant: variantId ? variantId:null, quantity:1}]
            })
        } else {
            let itemIndex = cart.items.findIndex(item => item.itemId.toString() == _id.toString())

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += 1
            } else {
                cart.items.push({itemId:_id, quantity:1})
            }
        }

        if (variantId) {
            product.variants[variantIndex].stock -= 1
            
        } else {
            product.stock -= 1
        }

        await wishlistModel.updateOne({ userId }, { $pull: { items: { itemId: variantId || _id } } });

        await product.save()
        await cart.save()
        res.status(200).json({ success: true})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false})
    }
}

module.exports = {
    loadCart,
    addToCart
}