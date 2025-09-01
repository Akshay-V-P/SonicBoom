const ordersModel = require("../../model/ordersModel")
const productModel = require("../../model/productModel")

const loadOrders = async (req, res) => {
    try {
        res.render('user/orders', {layout:'userAccount'})
    } catch (error) {
        console.log(error)
        res.render('user/500Error')
    }
}

const loadDetails = async (req, res) => {
    try {
        const userId = req.session.user._id
        const orders = await ordersModel.find({ userId })
        if (!orders) return res.status(404).json({ message: "No orders found" })
        let orderItems = []
        for (let order of orders) {
            for (let item of order.orderItems) {
                const product = await productModel.findOne({ _id: item.itemId });
            
                if (!product) return res.status(404).json({ success: false })
                        
                let variant = JSON.parse(JSON.stringify(product.variants.find(v => v._id.toString() == item.variantId.toString())));
                let indexOfVariant = product.variants.findIndex(v => v._id.toString() == item.variantId.toString());
            
                variant.index = indexOfVariant
                variant.productId = product._id
                variant.offer = product.offer
                variant.quantity = item.quantity
                variant.description = product.description
                order = JSON.parse(JSON.stringify(order))
                delete order.orderItems
                variant = Object.assign(variant, order)
            
                orderItems.push(variant)
            }
        }
            
        res.status(200).json(orderItems)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

module.exports = {
    loadOrders,
    loadDetails,
}