const userModel = require('../../model/userModel')
const categoryModel = require('../../model/categoryModel')
const paginate = require('../../helper/pagination')
const productModel = require('../../model/productModel')
const calculateOffer = require('../../helper/offerCalculator')

const loadCategory = (req, res) => {
    res.render('admin/category', {layout:'admin'})
}


const showCategorys = async (req, res) => {
    try {
        const currentPage = parseInt(req.query.currentPage) || 1
        const limit = parseInt(req.query.limit) || 10
        let filters = {}
        let sort = {}
        if (req.query.search) filters.transactionId = req.query.search
        if (req.query.filterPayment) filters.paymentMethod = req.query.filterPayment
        if (req.query.filterStatus) filters.paymentStatus = req.query.filterStatus
        if (req.query.filterAmount) sort.total = parseInt(req.query.filterAmount)

        const result = await paginate(categoryModel, limit, currentPage, filters, sort)
        if (result.result == []) return res.status(404).json({ message: "Categorys not found" })
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

const showDetails = async(req, res) => {
    try {
        const { id } = req.params
        const category = await categoryModel.findOne({ _id: id })
        if (!category) return res.render('admin/category', { layout: 'admin' })
        res.render('admin/editCategory', { layout: 'admin', category})
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}

const addCategory = async (req, res) => {
    try {
        const body = req.body
        const category = await categoryModel.findOne({ name:body.name })
        if (category) return res.render('admin/category', { layout: 'admin', message: "Category already exists" })
        const searchRegex = { $regex: body.name, $options: 'i' }
        const nameExists = await categoryModel.findOne({ name: searchRegex })
        if(nameExists) return res.render('admin/category', {layout:'admin', message:"Category name already exists", icon:"error"})
        const newCategory = new categoryModel(body)
        await newCategory.save()
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}

const editCategory = async (req, res) => {
    try {
        const { _id } = req.query
        const body = req.body
        let offerChanged = false
        console.log(body)

        const category = await categoryModel.findOne({ _id })
        if (!category) return res.status(404).json({ message: "Can't find Category" })
        
        const searchRegex = { $regex: body.name, $options: 'i' }
        const nameExists = await categoryModel.findOne({ name: searchRegex, _id:{$ne:_id} })
        if (nameExists) return res.status(406).json({ message: "Category Name already exists" })
        
        if (parseInt(category.offer) !== parseInt(body.offer)) {
            offerChanged = true
        }
        
        await categoryModel.updateOne({ _id }, body)
        const updated = await categoryModel.findOne({ _id })
        
        if (offerChanged) {
            const products = await productModel.find({ categoryId:_id })

            for (const product of products) {
                product.variants = product.variants.map( v => ({...v.toObject(), offerPrice: calculateOffer(v.price, product.offer, updated.offer)}))
                await product.save()
            }
        }

        res.status(200).json(updated)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

const changeCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params
        const body = req.body
        const category = await categoryModel.updateOne({ _id: id }, body)
        await productModel.updateMany({ categoryId: id }, {$set:{isListed:body.isListed}});
        res.status(200).json(category)
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}

module.exports = {
    loadCategory,
    showCategorys,
    showDetails,
    editCategory,
    changeCategoryStatus,
    addCategory,
}