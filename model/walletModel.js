const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid')

function generateOrderId() {
    const uniquePart = uuidv4().replace(/-/g, "").slice(0, 12);
    const uuid = `TRN${uniquePart.toUpperCase()}`
  return uuid;
}

const walletSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required:true
    },
    amount: {
        type: mongoose.Schema.Types.Double,
        default: 0.00,
        set: v => Math.round(v * 100) / 100 
    },
    transactions: {
        type: [{
            transactionType:{type:String, emum:["credit", "debit"], required:true},
            amount:{type:Number, required:true},
            status:{type:String,enum:["pending", "success", "failed"], required:true},
            transactionId: { type: String, default: generateOrderId, required: true },
            transactionDate:{type:Date, required:true}
        }],
        default:[]
    }
}, {
    timestamps:true
})


module.exports = mongoose.model("wallet", walletSchema)