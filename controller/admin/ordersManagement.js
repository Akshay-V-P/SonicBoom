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
        if (req.query.search) filters.transactionId = req.query.search
        if (req.query.filterPayment) filters.paymentMethod = req.query.filterPayment
        if (req.query.filterStatus) filters.paymentStatus = req.query.filterStatus
        if (req.query.filterAmount) sort.total = parseInt(req.query.filterAmount)

        const result = await paginate(orderModel, limit, currentPage, JSON.stringify(filters), JSON.stringify(sort))
        if (result.result == []) return res.status(404).json({ message: "Orders not found" })
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

module.exports = {
    loadOrders,
    showOrders,
}