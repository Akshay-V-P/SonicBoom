const productModel = require('../../model/productModel')
const categoryModel = require('../../model/categoryModel')
const paginate = require('../../helper/pagination')

const loadProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.currentPage) || 1
        const limit = parseInt(req.query.limit) || 9
        const result = await paginate(productModel, limit, page, null, JSON.stringify({ createdAt: -1 }), "categoryId")
        const products = result.result
        console.log(products)
        if (products.length == 0) return res.render('admin/products', { layout: 'admin' })
        console.log(result.currentPage, result.totalPages)
        res.render('admin/products', {layout:'admin', products, currentPage:result.currentPage, totalPages:result.totalPages})
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}

const loadProductsAdd = async(req, res) => {
    try {
        const categorys = await categoryModel.find()
        res.render('admin/addProduct', {layout:'admin', categorys})
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}

const addProduct = async (req, res) => {
    try {
        console.log("ENtered")
        const { name, developer, category, description, price, offerPrice, stock } = req.body
        const findProduct = await productModel.findOne({ name, description, price, offerPrice })
        if (findProduct) return res.redirect('/admin/products/add')
        const newProduct = new productModel({
            name,
            developer,
            categoryId:category,
            description,
            price,
            offerPrice,
            stock,
            coverImage: req.files.coverImage ? req.files.coverImage.map(file => file.path) : [],
            thumbnail: req.files.thumbnail?.[0]?.path || null
        })
        await newProduct.save()
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}

const editProduct = async(req, res) => {
    try {
        const { _id } = req.params
        const product = await productModel.findOne({ _id })
        if (!product) return res.redirect('/admin/products')
        const categorys = await categoryModel.find()
        res.render('admin/editProducts', {layout:'admin', product, categorys})
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}

module.exports = {
    loadProducts,
    loadProductsAdd,
    addProduct,
    editProduct
}