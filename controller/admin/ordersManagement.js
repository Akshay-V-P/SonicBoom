const orderModel = require('../../model/ordersModel')
const paginate = require('../../helper/pagination')
const productModel = require('../../model/productModel')
const walletModel = require('../../model/walletModel')
const refundMailer = require('../../utils/refundMail')
const userModel = require('../../model/userModel')
const refundCalculator = require('../../helper/refundOperator')

const loadOrders = (req, res) => {
    res.render('admin/orders', {layout:'admin'})
}

const showOrders = async (req, res) => {
    try {
        const currentPage = parseInt(req.query.currentPage) || 1
        const limit = parseInt(req.query.limit) || 10
        let filters = {}
        let sort = {}
        if(!req.query.filterAmount) sort.createdAt = -1
        if (req.query.search) {
            const searchRegex = { $regex: new RegExp(`^${req.query.search}`,), $options: 'i' }
            filters.$or = [
                { orderId: searchRegex }
            ]
        }
        if (req.query.filterPayment) filters.paymentMethod = req.query.filterPayment
        if (req.query.filterStatus) filters.paymentStatus = req.query.filterStatus
        if (req.query.filterAmount) sort.total = parseInt(req.query.filterAmount)
        if (req.query.filterOrderStatus) filters.status = req.query.filterOrderStatus;

        const result = await paginate(orderModel, limit, currentPage, filters, sort)
        if (result.result == []) return res.status(404).json({ message: "Orders not found" })
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

const showOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.query

        const order = await orderModel.findOne({ orderId })
        if (!order) return res.render('admin/orderDetails', { layout: 'admin' })
        let items = []

        for (let item of order.orderItems) {
            console.log("item is this : -------",item)
            const product = await productModel.findOne({ _id: item.itemId });
            if (!product) return res.render("user/404Error");

            let indexOfVariant = product.variants.findIndex((v) => v._id.toString() == item.variantId.toString());
            let itemDetails = {
                name:product.variants[indexOfVariant].name,
                status:item.status,
                offerPrice:product.variants[indexOfVariant].offerPrice,
                quantity: item.quantity,
                returnApproved: item.returnApproved,
                itemId: item.itemId,
                variantId:item.variantId
            }
            
            items.push(itemDetails)

        }

        let orderDetails = {
            orderId,
            name: order.address.name,
            mobile: order.address.mobile,
            shippingAddress: `${order.address.address}, ${order.address.city}, ${order.address.district}, ${order.address.state}, ${order.address.pincode}`,
            deliveryCharge: order.deliveryCharge,
            discount: order.discount,
            total: order.total,
            paymentMethod: order.paymentMethod,
            orderDate: new Date(order.createdAt).toLocaleDateString(),
            items,
            status:order.status
        }
        res.render('admin/orderDetails', {layout:'admin', orderDetails})
    } catch (error) {
        console.log(error)
    }
}

const updateStatus = async (req, res) => {
    try {
        const { orderId } = req.query
        const status = req.body.status
        console.log(status)
        
        const order = await orderModel.findOne({ orderId })
        if (!order) return res.status(404).json({ messsage: "can't find order" })
        if (order.status != "cancelled") {
            order.status = status
        }

        if (status == "delivered") {
            order.paymentStatus == "paid"
        }
        
        order.orderItems.forEach(item => {
            if (item.status != "cancelled") {
                item.status = status
            }
        })

        await order.save()
        res.status(200).json({message:"Status updated successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

const approveReturn = async (req, res) => {
    try {
        const { itemId, variantId, orderId } = req.body
        refundCalculator(variantId, orderId)
        res.status(200).json({message:"Return approved"})
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({message:error.message || "Internal server error"})
    }
}

module.exports = {
    loadOrders,
    showOrders,
    showOrderDetails,
    updateStatus,
    approveReturn,
}