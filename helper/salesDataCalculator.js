const orderModel = require('../model/ordersModel')

async function calculateSalesData(findQuery) {

    let data = await orderModel.aggregate([{ $match: findQuery }, { $unwind: "$orderItems" }])
    console.log("Date length : ",data)
    let totalSales = {amount: 0, count: 0}
    let unpaidOrders = {amount: 0, count: 0}
    let paidOrders = {amount: 0, count: 0}
    let refundedOrders = {amount: 0, count: 0}
    let cancelledOrders = { amount: 0, count: 0}
    let discountAmount = 0
    let couponDiscounts = 0

    data.forEach(order => {
        let orderTotalAmount = ((order.gstAmount / order.totalItems) * order?.orderItems?.quantity) + (order?.orderItems?.offerPrice * order?.orderItems?.quantity);
        let orderQuantity = order?.orderItems?.quantity
        let orderDiscountAmount = order?.orderItems?.discount * order?.orderItems?.quantity
        let orderCouponDiscount = order.couponDiscount ? (order.couponDiscount / order.totalItems) * order?.orderItems?.quantity : 0;
        let orderPaymentStatus = order.paymentStatus
        let orderStatus = order.status

        // Total sales amount
        totalSales.amount += orderTotalAmount
        totalSales.count += orderQuantity

        // Total discount paid
        discountAmount += orderDiscountAmount

        // Total coupon discount
        couponDiscounts += orderCouponDiscount


        // unPaid orders
        if (order.paymentStatus === "unpaid") {
            unpaidOrders.amount += orderTotalAmount
            unpaidOrders.count += orderQuantity
        }

        // paid orders
        if (order.paymentStatus === "paid" && order?.orderItems?.returnApproved === false) {
            paidOrders.amount += orderTotalAmount
            paidOrders.count += orderQuantity
        }

        // refundedOrders
        if (order?.orderItems?.returnApproved) {
            refundedOrders.amount += orderTotalAmount
            refundedOrders.count += orderQuantity
        }

        // cancelled orders
        if (order?.orderItems?.status === "cancelled") {
            cancelledOrders.amount += orderTotalAmount
            cancelledOrders.count += orderQuantity
        }



    })

    return {totalSales, unpaidOrders, paidOrders, refundedOrders, cancelledOrders, discountAmount, couponDiscounts}
}


module.exports = calculateSalesData