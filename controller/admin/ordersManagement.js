const orderModel = require('../../model/ordersModel')
const paginate = require('../../helper/pagination')

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
        console.log(order)
        let items = []
        order.orderItems.forEach(item => {
            items.push(item.name)
        })
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
        
        const order = await orderModel.findOne({ orderId })
        if (!order) return res.status(404).json({ messsage: "can't find order" })
        order.status = status
        order.orderItems.forEach(item => {
            item.status = status
        })

        await order.save()
        res.status(200).json({message:"Status updated successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

module.exports = {
    loadOrders,
    showOrders,
    showOrderDetails,
    updateStatus,
}