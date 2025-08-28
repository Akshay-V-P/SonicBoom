const cartModel = require("../../model/cartModel")
const productModel = require("../../model/productModel")
const wishlistModel = require("../../model/wishlistModel")

const loadCart = async(req, res) => {
    try {
        const userId = req.session.user._id
        const cart = await cartModel.findOne({ userId })
        console.log(cart)
        res.render('user/cart', {layout:'user', products:cart})
    } catch (error) {
        console.log(error)
    }
}


const addToCart = async (req, res) => {
    try {
        const { _id } = req.query; // This is the Product ID
        const { variantId } = req.query; // This is the selected Variant ID
        const userId = req.session.user._id;
        console.log(variantId)

        // Ensure a variantId is provided, as your logic depends on it
        if (!variantId) {
            return res.status(400).json({ success: false, message: "Please select a variant." });
        }

        const product = await productModel.findOne({ _id });
        if (!product) return res.status(404).json({ success: false, message: "Product not found." });
        if (!product.isListed || !product.isActive) return res.status(401).json({ success: false, message: "Product not available." });

        const variant = product.variants.find(v => v._id.toString() === variantId.toString());
        if (!variant) return res.status(404).json({ success: false, message: "Variant not found." });
        if (variant.stock < 1) return res.status(401).json({ success: false, message: "Out of stock." });

        let cart = await cartModel.findOne({ userId });

        if (!cart) {
            // Case 1: User has no cart, create a new one
            cart = new cartModel({
                userId,
                items: [{
                    itemId: _id, // Always the product ID
                    variantId: variantId, // The specific variant ID
                    quantity: 1
                }]
            });
        } else {
            // Case 2: User has a cart, find the specific item (product + variant)
            const itemIndex = cart.items.findIndex(item =>
                item.itemId.toString() === _id.toString() &&
                item.variantId.toString() === variantId.toString()
            );

            if (itemIndex > -1) {
                // Item already exists, just increment quantity
                cart.items[itemIndex].quantity += 1;
            } else {
                // Item does not exist, push it to the items array
                cart.items.push({
                    itemId: _id, // Always the product ID
                    variantId: variantId, // The specific variant ID
                    quantity: 1
                });
            }
        }

        // Decrement stock for the specific variant
        const variantInProduct = product.variants.find(v => v._id.toString() === variantId.toString());
        if (variantInProduct) {
            variantInProduct.stock -= 1;
        }

        // Optional: Remove from wishlist
        // await wishlistModel.updateOne({ userId }, { $pull: { items: { variantId: variantId } } });

        await product.save();
        await cart.save();
        res.status(200).json({ success: true, message: "Added to cart." });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = {
    loadCart,
    addToCart
}