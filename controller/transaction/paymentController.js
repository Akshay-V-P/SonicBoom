const razorpay = require('../../config/razorPay')
const crypto = require("crypto");


const createOrder = async (req, res) => {
    try {
        const options = {
          amount: req.body.amount * 100, 
          currency: "INR",
          receipt: "receipt_" + Date.now(),
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating order");
    }
}

const verifyOrder = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

    if (razorpay_signature === expectedSign) {
        res.json({ success: true, message: "Payment verified successfully", success:true });
    } else {
        res.json({ success: false, message: "Payment verification failed", success:false });
    }
}

const paymentFailed = (req, res) => {
    res.render("user/paymentFailed", {layout:"user"})
}


module.exports = {
    createOrder,
    verifyOrder,
    paymentFailed
}