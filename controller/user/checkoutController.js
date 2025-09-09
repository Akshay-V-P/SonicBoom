const addressModel = require("../../model/addressModel");
const productModel = require("../../model/productModel")
const cartModel = require("../../model/cartModel");
const ordersModel = require("../../model/ordersModel");
const userModel = require("../../model/userModel");

const loadCheckout = async(req, res) => {
  try {
    const { _id } = req.session.user
    const user = await userModel.findOne({ _id })
    console.log(user)
    if(!user?.mobile) return res.redirect("/user/account?message='Please Update Mobile to continue checkout'")
        res.render('user/checkout', {layout:"user"})
    } catch (error) {
        console.log(error)
    }
}

const loadDetails = async (req, res) => {
    try {
      const gst = 18;
      const userId = req.session.user._id;

      const cart = await cartModel.findOne({ userId });

      let products = [];
      let checkoutDetails = { subTotal: 0, discounts: 0, price:0 };

      for (let item of cart.items) {
        const product = await productModel.findOne({ _id: item.itemId });

        if (!product) return res.status(404).json({ success: false });

        let variant = JSON.parse(JSON.stringify(product.variants.find((v) => v._id.toString() == item.variantId.toString())));
        let indexOfVariant = product.variants.findIndex((v) => v._id.toString() == item.variantId.toString());

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

        checkoutDetails.subTotal = (parseInt(checkoutDetails.subTotal) + variant.price * item.quantity).toFixed(2);
        checkoutDetails.discounts = parseInt(checkoutDetails.discounts) + (parseInt(variant.price) - parseInt(variant.offerPrice))
        checkoutDetails.discounts = (parseInt(checkoutDetails.discounts) * item.quantity).toFixed(2)
        checkoutDetails.price += variant.price
        products.push(variant);
        }
        
      const addresses = await addressModel.find({ userId })
      const user = await userModel.findOne({ _id:userId })
        

      checkoutDetails.gstAmount = ((parseInt(checkoutDetails.subTotal) / 100) * gst).toFixed(2);
      checkoutDetails.items = products.length;
        checkoutDetails.subTotal = parseInt(checkoutDetails.subTotal) + parseInt(checkoutDetails.gstAmount)
    checkoutDetails.total = parseInt(checkoutDetails.subTotal) - parseInt(checkoutDetails.discounts)

      res.status(200).json({ products, checkoutDetails, addresses , user});
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false });
    }
}


const placeOrder = async (req, res) => {
  try {
    const paymentStatus = req.body.paymentStatus
    const { addressId, total, subTotal, discounts, paymentMethod } = req.body
    const userId = req.session.user._id
    let payStatus
    let decStock = paymentStatus
    let status = "processing"

    if(!addressId) return res.status(404).json({message:"Please provide an Address"})

    if (paymentMethod !== "COD") {
      if (paymentStatus) {
        payStatus = "paid"
      } else{
        payStatus = "failed"
        status = "payment failed"
      }
    } else {
      payStatus = "unpaid"
      decStock = true
    }
    
    const address = await addressModel.findOne({ _id: addressId })
    const orderItems = await cartModel.findOne({ userId })

    if (decStock) {
      for (let item of orderItems.items) {
        let product = await productModel.findOne({ _id: item.itemId })
        const variantIndex = product.variants.findIndex(v => v._id.toString() === item.variantId.toString())
        product.variants[variantIndex].stock = parseInt(product.variants[variantIndex].stock) - parseInt(item.quantity)
        await product.save()
      }
    }
    
    
    const newOrder = new ordersModel({
      userId,
      paymentMethod,
      paymentStatus: payStatus,
      subTotal,
      discount:discounts,
      total,
      status,
      orderItems: orderItems.items,
      address: {
        name: address.name,
        address:address.address,
        district: address.district,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        mobile: address.mobile,
        email:address.email,
        landmark: address.landmark,
        addressType:address.type
      }
    })

    await newOrder.save()
    await cartModel.deleteOne({userId})
    res.status(200).json({message:"Order placed"})
    
  } catch (error) {
    console.log(error)
    res.status(500).json({success:false})
  }
}

const loadOrderSuccess = (req, res) => {
  res.render('user/orderSuccess')
}


module.exports = {
    loadCheckout,
  loadDetails,
  placeOrder,
    loadOrderSuccess
}