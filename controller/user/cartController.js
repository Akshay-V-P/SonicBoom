const cartModel = require("../../model/cartModel");
const productModel = require("../../model/productModel");
const wishlistModel = require("../../model/wishlistModel");

const loadCart = async (req, res) => {
    try {
        res.render("user/cart", { layout: "user" });
    } catch (error) {
        console.log(error);
    }
};

const cartDetails = async (req, res) => {
    try {
        const gst = 18;
        const userId = req.session.user._id;

        const cart = await cartModel.findOne({ userId });
        if (!cart) return res.status(200).json({ products: [] });

        let products = [];
        let checkoutDetails = { subTotal: 0, discounts: 0, price: 0 };

        for (let item of cart.items) {
            const product = await productModel.findOne({ _id: item.itemId });

            if (!product) return res.status(404).json({ success: false });

            let variant = JSON.parse(
                JSON.stringify(
                    product.variants.find(
                        (v) => v._id.toString() == item.variantId.toString()
                    )
                )
            );
            let indexOfVariant = product.variants.findIndex(
                (v) => v._id.toString() == item.variantId.toString()
            );

            variant.index = indexOfVariant;
            variant.productId = product._id;
            variant.offer = product.offer;
            variant.quantity = item.quantity;
            variant.description = product.description;

            if (variant.stock < item.quantity) {
                variant.hasStock = false;
            } else {
                variant.hasStock = true;
            }

            checkoutDetails.subTotal =
                parseInt(checkoutDetails.subTotal) +
                variant.price * item.quantity;
            checkoutDetails.discounts +=
                (parseInt(variant.price) - parseInt(variant.offerPrice)) *
                item.quantity;
            // checkoutDetails.discounts = (parseInt(checkoutDetails.discounts) * item.quantity)
            checkoutDetails.price += variant.price * item.quantity;

            products.push(variant);
        }

        checkoutDetails.gstAmount = (
            (parseInt(checkoutDetails.subTotal) / 100) *
            gst
        ).toFixed(2);
        checkoutDetails.items = products.length;
        checkoutDetails.subTotal =
            parseInt(checkoutDetails.subTotal) +
            parseInt(checkoutDetails.gstAmount);
        checkoutDetails.total =
            parseInt(checkoutDetails.subTotal) -
            parseInt(checkoutDetails.discounts);
        console.log(checkoutDetails.discounts);

        res.status(200).json({ products, checkoutDetails });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false });
    }
};

const addToCart = async (req, res) => {
    try {
        const { _id } = req.query;
        const { variantId } = req.query;
        const userId = req.session.user._id;

        if (!variantId) {
            return res
                .status(400)
                .json({ success: false, message: "Please select a variant." });
        }

        const product = await productModel.findOne({ _id });
        if (!product)
            return res
                .status(404)
                .json({ success: false, message: "Product not found." });
        if (!product.isListed || !product.isActive)
            return res
                .status(401)
                .json({ success: false, message: "Product not available." });

        const variant = product.variants.find(
            (v) => v._id.toString() === variantId.toString()
        );
        if (!variant)
            return res
                .status(404)
                .json({ success: false, message: "Variant not found." });
        if (variant.stock < 1)
            return res
                .status(401)
                .json({ success: false, message: "Out of stock." });

        let cart = await cartModel.findOne({ userId });

        if (!cart) {
            cart = new cartModel({
                userId,
                items: [
                    {
                        itemId: _id,
                        variantId: variantId,
                        quantity: 1,
                    },
                ],
            });
        } else {
            const itemIndex = cart.items.findIndex(
                (item) =>
                    item.itemId.toString() === _id.toString() &&
                    item.variantId.toString() === variantId.toString()
            );

            if (itemIndex > -1) {
                if (cart.items[itemIndex].quantity > 4)
                    return res.status(401).json({
                        success: false,
                        message: "Max quantity reached",
                    });
                cart.items[itemIndex].quantity += 1;
            } else {
                cart.items.push({
                    itemId: _id,
                    variantId: variantId,
                    quantity: 1,
                });
            }
        }

        // const variantInProduct = product.variants.find(v => v._id.toString() === variantId.toString());
        // if (variantInProduct) {
        //     variantInProduct.stock -= 1;
        // }

        // Optional: Remove from wishlist
        await wishlistModel.updateOne(
            { userId },
            { $pull: { items: { variantId: variantId } } }
        );

        await product.save();
        await cart.save();
        res.status(200).json({ success: true, message: "Added to cart." });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

const decrementQuantity = async (req, res) => {
    try {
        const { _id } = req.query;
        const { variantId } = req.query;
        const userId = req.session.user._id;

        if (!variantId) {
            return res
                .status(400)
                .json({ success: false, message: "Please select a variant." });
        }

        const product = await productModel.findOne({ _id });
        if (!product)
            return res
                .status(404)
                .json({ success: false, message: "Product not found." });
        if (!product.isListed || !product.isActive)
            return res
                .status(401)
                .json({ success: false, message: "Product not available." });

        const variant = product.variants.find(
            (v) => v._id.toString() === variantId.toString()
        );
        if (!variant)
            return res
                .status(404)
                .json({ success: false, message: "Variant not found." });

        let cart = await cartModel.findOne({ userId });

        const itemIndex = cart.items.findIndex(
            (item) =>
                item.itemId.toString() === _id.toString() &&
                item.variantId.toString() === variantId.toString()
        );

        if (itemIndex > -1 && cart.items[itemIndex].quantity > 1) {
            cart.items[itemIndex].quantity -= 1;
        }

        // const variantInProduct = product.variants.find(v => v._id.toString() === variantId.toString());
        // if (variantInProduct && cart.items[itemIndex].quantity>1) {
        //     variantInProduct.stock += 1;
        // }

        // Optional: Remove from wishlist
        // await wishlistModel.updateOne({ userId }, { $pull: { items: { variantId: variantId } } });

        await product.save();
        await cart.save();
        res.status(200).json({ success: true, message: "Added to cart." });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { _id } = req.query;
        const { variantId } = req.query;
        const userId = req.session.user._id;

        if (!variantId) {
            return res
                .status(400)
                .json({ success: false, message: "Please select a variant." });
        }

        const product = await productModel.findOne({ _id });
        if (!product)
            return res
                .status(404)
                .json({ success: false, message: "Product not found." });
        if (!product.isListed || !product.isActive)
            return res
                .status(401)
                .json({ success: false, message: "Product not available." });

        const variant = product.variants.find(
            (v) => v._id.toString() === variantId.toString()
        );
        if (!variant)
            return res
                .status(404)
                .json({ success: false, message: "Variant not found." });

        let cart = await cartModel.findOne({ userId });

        const itemIndex = cart.items.findIndex(
            (item) =>
                item.itemId.toString() === _id.toString() &&
                item.variantId.toString() === variantId.toString()
        );
        let quantity = cart.items[itemIndex].quantity;
        if (itemIndex > -1) {
            cart.items.splice(itemIndex, 1);
        }
        // const variantInProduct = product.variants.find(v => v._id.toString() === variantId.toString());
        // if (variantInProduct) {
        //     variantInProduct.stock += quantity;
        // }

        await product.save();
        await cart.save();
        res.status(200).json({ success: true, message: "Added to cart." });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    loadCart,
    addToCart,
    cartDetails,
    removeFromCart,
    decrementQuantity,
};
