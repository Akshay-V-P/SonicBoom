const wishlistModel = require('../../model/wishlistModel')
const productModel = require('../../model/productModel')


const loadWishlist = (req, res) => {
    res.render('user/wishlist', {layout:"user"})
}

const addToWishlist = async (req, res) => {
    try {
        const { _id, variantId } = req.query;
        const userId = req.session.user._id;

        // Basic validation for variant ID
        if (!variantId) {
            return res.status(400).json({ success: false, message: "Please select a variant." });
        }

        // Find or create the user's wishlist
        let wishlist = await wishlistModel.findOne({ userId });
        if (!wishlist) {
            wishlist = new wishlistModel({ userId, items: [] });
        }

        // Check if the product variant is already in the wishlist
        const itemExists = wishlist.items.some(item =>
            item.itemId.toString() === _id.toString() &&
            item.variantId.toString() === variantId.toString()
        );

        if (itemExists) {
            // Item is already in the wishlist, return a success message
            return res.status(200).json({ success: true, message: "Item is already in your wishlist." });
        }

        // Add the new item to the wishlist
        wishlist.items.push({
            itemId: _id,
            variantId: variantId,
        });

        await wishlist.save();
        res.status(200).json({ success: true, message: "Added to wishlist successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An internal server error occurred." });
    }
};


module.exports = {
    loadWishlist,
    addToWishlist,
}