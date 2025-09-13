const couponModel = require("../../model/couponModel")


const loadCoupons = (req, res) => {
    res.render('user/coupons', {layout:"userAccount"})
}

const fetchCoupons = async (req, res)=>{
    try {
        const userId = req.session.user._id
        const coupons = await couponModel.find({isBlocked:false}).sort({isActive:-1})
        res.status(200).json({result:coupons, userId})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}


module.exports = {
    loadCoupons,
    fetchCoupons
}