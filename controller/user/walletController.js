
const userModel = require("../../model/userModel")
const walletModel = require("../../model/walletModel")



const loadWallet = async (req, res) => {
    res.render('user/wallet', {layout:"userAccount"})
}

const fetchWallet = async (req, res) => {
    try {
        const userId = req.session.user._id
        const wallet = await walletModel.findOne({ userId })
        if (!wallet) return res.status(404).json({ message: "Can't find wallet" })
        const user = await userModel.findOne({ _id: userId })
        const userData = {
            name: user.name,
            email: user.email,
            mobile:user.mobile
        }
        res.status(200).json({ wallet, userData })
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

const addToWallet = async (req, res) => {
    try {
        const { amount, transactionType, paymentStatus } = req.body
        const userId = req.session.user._id

        const wallet = await walletModel.findOne({ userId })
        if (!wallet) return res.status(404).json({ message: "Can't find wallet" })
        
        const transaction = {
            transactionType,
            amount,
            transactionDate:new Date().toISOString()
        }
        
        if (paymentStatus) {
            wallet.amount = (parseFloat(wallet.amount) + parseFloat(amount)).toFixed(2)
            transaction.status = "success"
        } else {
            transaction.status = "failed"
        }

        console.log(wallet)
        wallet.transactions.push(transaction)
        await wallet.save()
        res.status(200).json({message:"Transaction successfull"})

    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

module.exports = {
    loadWallet,
    fetchWallet,
    addToWallet
}