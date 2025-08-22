const paginate = require("../../helper/pagination")
const categoryModel = require("../../model/categoryModel")
const productModel = require("../../model/productModel")


const showShop = async (req, res) => {
    try {
        const categorys = await categoryModel.find({isListed:true})
        res.render('user/shop', { layout: 'user', categorys})
    } catch (error) {
        console.log(error)
        req.render('user/500Error')
    }
}

const loadShopContents = async (req, res) => {
    try {
        const filter = {}
        filter.isActive = true
        filter.isListed = true
        const sortQuery = {}

        const search = req.query.search
        const currentPage = req.query.currentPage || 1
        const limit = req.query.limit || 9
        const sort = req.query.sort || null
        const min = req.query.min ? parseInt(req.query.min) : null
        const max = req.query.max ? parseInt(req.query.max) : null
        console.log("min", min, "max", max)
        const categoryId = req.query.categoryId ? JSON.parse(req.query.categoryId) : null
    
        if (sort) {
            const splitedQuery = sort.split(":")
            sortQuery[splitedQuery[0]] = parseInt(splitedQuery[1])
        }
        if (search) {
            const searchRegex = { $regex: new RegExp(`^${search}`,), $options: 'i' }
            filter.$or = [
                { name: searchRegex }
            ]
        }
        if (categoryId) {
            filter.categoryId = {$in:categoryId}
        }

        if (min !== null && max !== null) {
            if (max === 0) {
                filter.offerPrice = {$gt:min}
            } else if (min === 0) {
                filter.offerPrice = {$lt:max}
            } else {
                filter.offerPrice = {$gt:min, $lt:max}
            } 
        }
        
        const products = await paginate(productModel, limit, currentPage, filter, sortQuery)
        if (!products.result) return res.status(404).json({ message: "Not found" })
        res.status(200).json(products)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

module.exports = {
    showShop,
    loadShopContents,
}