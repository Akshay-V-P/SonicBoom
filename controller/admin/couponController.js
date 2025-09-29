const couponModel = require("../../model/couponModel")
const paginate = require("../../helper/pagination")
const { default: mongoose } = require("mongoose")

// Render Coupon Management Page
const loadCoupons = (req, res) => {
    res.render('admin/coupons', {layout:'admin'})
}

// Adds new coupon
const addCoupon = async (req, res) => {
    try {
        const couponData = req.body

        let today = new Date().toISOString()
        if (couponData.expiryDate < today) return res.status(400).json({ message: "Expiry Date should be future date" })
        
        for (let item in couponData) {
            if(!item) return res.status(400).json({message:"Please Provide all data"})
        }
        
        const CodeExist = await couponModel.findOne({ code:couponData.code })
        if(CodeExist) return res.status(401).json({message:"Coupon Code Already Exists, Provide a new one"})
        
        const newCoupon = new couponModel({
            code:couponData.code,
            description:couponData.description,
            discount:couponData.discount,
            discountType:couponData.discountType,
            maxDiscount:couponData.maxDiscount,
            minPurchase:couponData.minPurchase,
            expiryDate:couponData.expiryDate
        })

        await newCoupon.save()
        res.status(200).json({message:"Coupon added successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

// Fetch coupon data
const getCoupons = async (req, res) => {
    try {
        const page = parseInt(req.query.currentPage) || 1
        const limit = parseInt(req.query.limit) || 9
        const search = req.query.search
        const sort = req.query.sort || null
        const order = req.query.order? parseInt(req.query.order) : -1
        const filter = req.query.filter || null

        const today = new Date().toISOString()

        const findQuery = {}
        const sortQuery = {}
        
        if (search) {
            const searchRegex = { $regex: search, $options: 'i' }
            findQuery.code = searchRegex
        }

        if (filter) {
            if (filter === "active") {
                findQuery.isActive = true
            }else if (filter === "unlisted") {
                findQuery.$and = [{isActive:false}, {expiryDate:{$gt:today}}]
            } else if (filter === "expired") {
                findQuery.expiryDate = {$lt:today}
            } else {
                findQuery.discountType = filter
            }
        }

        if (sort) {
            sortQuery[sort] = order
        }


        const expiredCoupon = await couponModel.find({ expiryDate: { $lt: today }, isActive: true })
        if (expiredCoupon.length > 0) {
            for (let coupon of expiredCoupon) {
                await couponModel.updateOne({_id:coupon._id}, {$set:{isActive:false}})
            }
        }

        const coupons = await paginate(couponModel, limit, page, findQuery, sortQuery)
        res.status(200).json(coupons)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

// change coupon status (To block and Unblock)
const changeCouponStatus = async (req, res) => {
    try {
        const { _id } = req.params
        const body = req.body
        const coupon = await couponModel.updateOne({ _id }, body)
        res.status(200).json(coupon)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

// Load coupon edit page
const loadCouponEdit = async (req, res) => {
    try {
        const couponId = req.query.couponId
        const coupon = await couponModel.findOne({ _id: couponId })
        if (!coupon) return res.render("admin/404Error")
        res.render("admin/editCoupons", {layout:"admin", coupon})
    } catch (error) {
        console.log(error)
        res.render("admin/500Error")
    }
}

// coupon edit control
const editCoupon = async (req, res) => {
    try {
        const bodyData = req.body
        const couponId = req.query.couponId
        const coupon = await couponModel.findOne({ code: bodyData.code, _id: { $ne: couponId } })
        console.log(coupon)
        if (coupon) return res.status(400).json({ message: "Coupon code already exists" })

        await couponModel.updateOne({_id:couponId}, {$set:bodyData})

        res.status(200).json({message:"Coupon updated"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

module.exports = {
    loadCoupons,
    addCoupon,
    getCoupons,
    changeCouponStatus,
    loadCouponEdit,
    editCoupon
}