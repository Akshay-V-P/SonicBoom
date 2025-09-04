const paginate = require("../../helper/pagination")
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
        const page = parseInt(req.query.page) || 2
        const limit =  10
        const search = req.query.search === "null"? null : req.query.search
        const userId = req.session.user._id
        const sort = req.query.sort || null
        const sortQuery = {createdAt:-1}
        const filterQuery = { userId }
        if (search) {
            const searchRegex = {
                $regex: new RegExp(`^${search}`),
                $options: "i",
            };
            
          filterQuery.$or = [{ orderId: searchRegex }];
        }
        const result = await paginate(ordersModel, limit, page, filterQuery, sortQuery)
        const orders = result.result
        if (!orders) return res.status(404).json({ message: "No orders found" })
        let orderItems = []
        for (let order of orders) {
            order = JSON.parse(JSON.stringify(order))
            order.orderedItems = []
            for (let item of order.orderItems) {
                const product = await productModel.findOne({ _id: item.itemId });
            
                if (!product) return res.status(404).json({ success: false })
                        
                let variant = JSON.parse(JSON.stringify(product.variants.find(v => v._id.toString() == item.variantId.toString())));
                let indexOfVariant = product.variants.findIndex(v => v._id.toString() == item.variantId.toString());
            
                variant.index = indexOfVariant
                variant.productId = product._id
                variant.offer = product.offer
                variant.quantity = item.quantity
                order = JSON.parse(JSON.stringify(order))
                delete order.orderItems
                delete variant.stock
                order.orderedItems.push(variant)
            }
            orderItems.push(order)
        }
        const totalOrders = orderItems.length
        res.status(200).json({ orders: orderItems, totalOrders })
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}


const loadOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.query
        const order = await ordersModel.findOne({ orderId })
        if (!order) return res.render('user/404Error', { layout: "user" })
        let orders = JSON.parse(JSON.stringify(order));
        orders.orderItems = []
        
        for (let item of order.orderItems) {
            const product = await productModel.findOne({ _id: item.itemId });
            if (!product) return res.render('user/404Error')

            let variant = JSON.parse(JSON.stringify(product.variants.find((v) => v._id.toString() == item.variantId.toString())));
            let indexOfVariant = product.variants.findIndex((v) => v._id.toString() == item.variantId.toString());

            variant.index = indexOfVariant;
            variant.productId = product._id;
            variant.offer = product.offer;
            variant.quantity = item.quantity;
            delete variant.stock;
            orders.orderItems.push(variant);
        }
        let date = new Date(orders.createdAt).toLocaleDateString()
        orders.createdAt = date
        if (orders.status === "pending") {
            orders.statusPercentage = '10%'
        } else if(orders.status === "processing") {
            orders.statusPercentage = '40%'
        } else if (orders.status === "deliverd") {
            orders.statusPercentage = '100%'
        }

        console.log(orders)

        res.render("user/orderStatus", { layout: "userAccount", order:orders });
    } catch (error) {
        console.log(error)
        res.render("user/500Error")
    }
}

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.orderId
        const reason = req.body.reason || null
        const order = await ordersModel.findOne({ orderId })
        if (!order) return res.status(404).json({ message: "Unable to find the order" })
        if (order.status === "deliverd") return res.status(401).json({ message: "Can't cancel, order is already deliverd" })
        
        order.status = 'cancelled'
        order.reason = reason
        
        for (let item of order.orderItems) {
            const product = await productModel.findOne({ _id: item.itemId });
            if (!product) return res.render("user/404Error");

            let indexOfVariant = product.variants.findIndex((v) => v._id.toString() == item.variantId.toString());

            product.variants[indexOfVariant].stock += parseInt(item.quantity)
            await product.save()

        }
        await order.save()
        res.status(200).json({message:"Order cancelled"})
    } catch (error) {
        console.log(error)
        res.status(500).json({ success:false})
    }
}

const cancelItem = async (req, res) => {
    try {
        const { orderId, productId, variantId } = req.query

        const order = await ordersModel.findOne({orderId})

        if (!order) return res.status(404).json({ message: "Unable to find the order" });
        if (order.status === "deliverd") return res.status(401).json({ message: "Can't cancel, order is already deliverd" });

        let indexOfItem = order.orderItems.findIndex((v) => v.variantId.toString() == variantId.toString());
        order.orderItems[indexOfItem].status = "cancelled"

        const product = await productModel.findOne({ _id: productId });
        if (!product) return res.render("user/404Error");

        let indexOfVariant = product.variants.findIndex((v) => v._id.toString() == variantId.toString());

        product.variants[indexOfVariant].stock += parseInt(order.orderItems[indexOfItem].quantity)

        await order.save()
        await product.save();
        
        res.status(200).json({message:"cancelled"})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false})
    }
}

module.exports = {
    loadOrders,
    loadDetails,
    loadOrderStatus,
    cancelOrder,
    cancelItem
}