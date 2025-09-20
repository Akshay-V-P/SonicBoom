const addressModel = require("../../model/addressModel");
const productModel = require("../../model/productModel");
const cartModel = require("../../model/cartModel");
const ordersModel = require("../../model/ordersModel");
const userModel = require("../../model/userModel");
const couponModel = require("../../model/couponModel");
const couponOperations = require("../../helper/couponOperation");
const walletModel = require("../../model/walletModel");

const loadCheckout = async (req, res) => {
    try {
        const { _id } = req.session.user;
        const user = await userModel.findOne({ _id });
        console.log(user);
        if (!user?.mobile)
            return res.redirect(
                "/account?message='Please Update Mobile to continue checkout'"
            );
        res.render("user/checkout", { layout: "user" });
    } catch (error) {
        console.log(error);
    }
};

const loadDetails = async (req, res) => {
    try {
        const gst = 18;
        let couponCode = req.query.couponCode;
        let operation = req.query.operation;
        if (!operation || operation === "null" || operation === "undefined") {
            operation = null;
        }
        if (
            !couponCode ||
            couponCode === "null" ||
            couponCode === "undefined"
        ) {
            couponCode = null;
        }

        const userId = req.session.user._id;

        const cart = await cartModel.findOne({ userId });

        let products = [];
        let checkoutDetails = {
            subTotal: 0,
            discounts: 0,
            price: 0,
            couponDiscount: 0,
        };

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

            checkoutDetails.subTotal = (
                parseInt(checkoutDetails.subTotal) +
                variant.price * item.quantity
            ).toFixed(2);
            checkoutDetails.discounts =
                parseInt(checkoutDetails.discounts) +
                (parseInt(variant.price) - parseInt(variant.offerPrice));
            checkoutDetails.discounts = (
                parseInt(checkoutDetails.discounts) * item.quantity
            ).toFixed(2);
            checkoutDetails.price += (variant.price * item.quantity);
            products.push(variant);
        }

        const addresses = await addressModel.find({ userId });
        const user = await userModel.findOne({ _id: userId });

        checkoutDetails.gstAmount = ((parseInt(checkoutDetails.subTotal) / 100) * gst).toFixed(2);
        checkoutDetails.items = products.length;
        checkoutDetails.subTotal =
            parseInt(checkoutDetails.subTotal) +
            parseInt(checkoutDetails.gstAmount);
        checkoutDetails.total =
            parseInt(checkoutDetails.subTotal) -
            parseInt(checkoutDetails.discounts);

        if (typeof couponCode === "string" && couponCode.trim() && operation === "apply") {
            checkoutDetails = (await couponOperations.applyCoupon( checkoutDetails, couponCode, userId, res )) || checkoutDetails;
        }

        if (
            typeof couponCode === "string" &&
            couponCode.trim() &&
            operation === "remove"
        ) {
            checkoutDetails =
                (await couponOperations.removeCoupon(
                    checkoutDetails,
                    couponCode,
                    userId,
                    res
                )) || checkoutDetails;
        }

        console.log("Checkout details : ", checkoutDetails);

        res.status(200).json({ products, checkoutDetails, addresses, user });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

const placeOrder = async (req, res) => {
    try {
        const paymentStatus = req.body.paymentStatus;
        const {
            addressId,
            total,
            subTotal,
            discounts,
            paymentMethod,
            couponId,
            gstAmount,
        } = req.body;
        const userId = req.session.user._id;
        let payStatus;
        let decStock = paymentStatus;
        let status = "processing";
        let walletPaid = false;
        let couponDiscount = 0

        console.log(paymentMethod)

        if (!addressId)
            return res
                .status(404)
                .json({ message: "Please provide an Address" });

        if (paymentMethod == "UPI" || paymentMethod == "CARD") {
            if (paymentStatus) {
                payStatus = "paid";
            } else {
                payStatus = "failed";
                status = "payment failed";
            }
        } else if (paymentMethod == "WALLET") {
            console.log("ENtered dto wallet check");
            var wallet = await walletModel.findOne({ userId });

            if (!wallet)
                return res.status(404).json({ message: "Wallet not found" });

            if (parseFloat(wallet.amount) > parseFloat(total)) {
                payStatus = "paid";
                decStock = true;
                walletPaid = true;
            } else {
                return res
                    .status(401)
                    .json({ message: "Insufficiant balance" });
            }
        } else if(paymentMethod == "COD") {
            payStatus = "unpaid";
            decStock = true;
        }

        const address = await addressModel.findOne({ _id: addressId });
        const orderItems = await cartModel.findOne({ userId });

        if (decStock) {
            for (let item of orderItems.items) {
                let product = await productModel.findOne({ _id: item.itemId });
                const variantIndex = product.variants.findIndex(
                    (v) => v._id.toString() === item.variantId.toString()
                );
                product.variants[variantIndex].stock =
                    parseInt(product.variants[variantIndex].stock) -
                    parseInt(item.quantity);
                await product.save();
            }
        }

        if (couponId) {
            const coupon = await couponModel.findOne({ _id: couponId });
            console.log(coupon);
            const userIndex = coupon.usedBy.findIndex(
                (user) => user.userId.toString() === userId.toString()
            );
            coupon.usedBy[userIndex].isOrdered = true; 
            couponDiscount = (subTotal - discounts) - total
            console.log(couponDiscount)
            await coupon.save();
        }

        let totalItems = 0

        const items = await Promise.all(orderItems.items.map(async item => {

            console.log(item)
            let product = await productModel.findOne({ _id: item.itemId });
            const variantIndex = product.variants.findIndex(
                    (v) => v._id.toString() === item.variantId.toString()
            );

            totalItems += parseInt(item.quantity)

            let discountAmount = (parseFloat(product.variants[variantIndex].price) - parseFloat(product.variants[variantIndex].offerPrice)).toFixed(2)

            console.log(discountAmount)
                return {itemId: item.itemId,
                variantId: item.variantId,
                status: "processing",
                returnApproved: false,  
                quantity: item.quantity,
                categoryId: product.categoryId,
                productName:product.variants[variantIndex].name,
                productId:product.variants[variantIndex].productId,
                price: product.variants[variantIndex].price,
                offerPrice:product.variants[variantIndex].offerPrice,
                discount: Number(discountAmount)}
        }))
        
        console.log(items)

        const newOrder = new ordersModel({
            userId,
            couponId,
            paymentMethod,
            paymentStatus: payStatus,
            subTotal,
            discount: discounts,
            couponDiscount,
            total,
            gstAmount,
            status,
            totalItems,
            orderItems: items,
            address: {
                name: address.name,
                address: address.address,
                district: address.district,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                mobile: address.mobile,
                email: address.email,
                landmark: address.landmark,
                addressType: address.type,
            },
        });

        await newOrder.save();
        await cartModel.deleteOne({ userId });

        if (walletPaid) {
            wallet.amount = (
                parseFloat(wallet.amount) - parseFloat(total)
            ).toFixed(2);
            await wallet.save();
        }
        res.status(200).json({ message: "Order placed" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false });
    }
};

const loadOrderSuccess = (req, res) => {
    res.render("user/orderSuccess");
};

const fetchCoupons = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const today = new Date().toISOString();

        const coupons = await couponModel.find({
            "usedBy.userId": { $ne: userId },
            expiryDate: { $gt: today },
        });

        res.status(200).json(coupons);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    loadCheckout,
    loadDetails,
    placeOrder,
    loadOrderSuccess,
    fetchCoupons,
};
