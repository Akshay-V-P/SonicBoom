const orderModel = require("../model/ordersModel")
const walletModel = require("../model/walletModel")
const userModel = require("../model/userModel")
const refundMailer = require("../utils/refundMail")

async function refundCalculator(variantId, orderId) {


        const order = await orderModel.findOne({ orderId })
        if (!order) throw { status: 404, message: "Order not found" }
    
        if(order.paymentStatus == "unpaid") return
        
        const itemIndex = order.orderItems.findIndex(item => item.variantId.toString() == variantId.toString())
        order.orderItems[itemIndex].returnApproved = false

        let refundAmount 
        let gstAmount = parseFloat(order.gstAmount) / order.totalItems

        let itemPrice = ((parseFloat(order.orderItems[itemIndex].offerPrice) + gstAmount)  * parseFloat(order.orderItems[itemIndex].quantity))

        if (order.couponDiscount > 0) {
            refundAmount =  itemPrice - (parseFloat(order.couponDiscount) - parseFloat(order.totalItems))
        } else {
            refundAmount = itemPrice
        }

        const wallet = await walletModel.findOne({ userId: order.userId })
        if (!wallet) throw {status : 404, message : "Can't find wallet"}
        
        wallet.amount +=  refundAmount
                
        const transaction = {
            transactionType : "credit",
            amount : refundAmount,
            status:"success",
            transactionDate:new Date().toISOString()
        }

        const user = await userModel.findOne({_id:order.userId})

        const mailData = {
            name: user.name,
            refundAmount,
            date: new Date().toLocaleDateString(),
            orderId
        }

        

        wallet.transactions.unshift(transaction)
        await wallet.save()

        await order.save()

        await refundMailer(user.email, mailData)


}


module.exports = refundCalculator