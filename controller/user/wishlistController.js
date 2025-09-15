const wishlistModel = require('../../model/wishlistModel')
const productModel = require('../../model/productModel')
const cartModel = require('../../model/cartModel')


const loadWishlist = (req, res) => {
    res.render('user/wishlist', {layout:"user"})
}

const getDetails = async (req, res) => {
    try {
        console.log("Entered")
        const userId = req.session.user._id

        const wishlist = await wishlistModel.findOne({ userId })
        if(!wishlist) return res.status(200).json({products:[]})

        let products = []
        
        for (let item of wishlist.items) {
            const product = await productModel.findOne({ _id: item.itemId });

            if (!product) return res.status(404).json({ success: false })
            
            let variant = JSON.parse(JSON.stringify(product.variants.find(v => v._id.toString() == item.variantId.toString())));
            let indexOfVariant = product.variants.findIndex(v => v._id.toString() == item.variantId.toString());

            variant.index = indexOfVariant
            variant.productId = product._id
            variant.offer = product.offer
            variant.description = product.description

            products.push(variant)
        }

        console.log(products)
        res.status(200).json(products)
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false})
    }
}

const addToWishlist = async (req, res) => {
    try {
        
        const { _id, variantId } = req.query;
        const userId = req.session.user._id;

        // Basic validation for variant ID
        if (!variantId) {
            return res.status(400).json({ success: false, message: "Please select a variant." });
        }

        const inWishlist = await wishlistModel.findOne({userId})

        if (inWishlist) {
            const itemExistsInWishlist = inWishlist.items.some(item =>
                item.itemId.toString() === _id.toString() &&
                item.variantId.toString() === variantId.toString()
            );

            if(itemExistsInWishlist) return res.status(200).json({message:"Item already exist in the cart"})
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


const removeFromWishlist = async (req, res) => {
    try {
        const { _id } = req.query;
        const { variantId } = req.query; 
        const userId = req.session.user._id;


        let wishlist = await wishlistModel.findOne({ userId });

        
        const itemIndex = wishlist.items.findIndex(item =>
            item.itemId.toString() === _id.toString() &&
            item.variantId.toString() === variantId.toString()
        );
        if (itemIndex > -1) {
            wishlist.items.splice(itemIndex, 1)
        }

        await wishlist.save();
        res.status(200).json({ success: true, message: "Added to cart." });
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false, message:"Internal server error"})
    }
}


module.exports = {
    loadWishlist,
    addToWishlist,
    getDetails,
    removeFromWishlist,
}