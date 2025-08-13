const userModel = require('../model/userModel')
const productModel = require('../model/productModel')
const orderModel = require('../model/ordersModel')
const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const paginate = require('../helper/pagination')

// Page loading functions
const loadLogin = (req, res) => {
    res.render('admin/login')
}

const loadDashboard = (req, res) => {
    res.render('admin/dashboard',{layout:'admin'})
}

const loadUsers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10
        const currentPage = parseInt(req.query.currentPage) || 1
        const users = await paginate(userModel, limit, currentPage, JSON.stringify({ role: "user" }))
    
        res.render('admin/users', {layout:'admin', users:users.result, currentPage, totalPages:users.totalPages})
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}

const loadProducts = async(req, res) => {
    try {
        const page = parseInt(req.query.currentPage) || 1
        const limit = parseInt(req.query.limit) || 9
        const result = await paginate(productModel, limit, page, null, JSON.stringify({ createdAt: -1 }))
        const products = result.result
        if (products.length == 0) return res.render('admin/products', { layout: 'admin' })
        console.log(result.currentPage, result.totalPages)
        res.render('admin/products', {layout:'admin', products, currentPage:result.currentPage, totalPages:result.totalPages})
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}

const loadOrders = (req, res) => {
    res.render('admin/orders', {layout:'admin'})
}

const loadBanners = (req, res) => {
    res.render('admin/banners', {layout:'admin'})
}

const loadCoupons = (req, res) => {
    res.render('admin/coupons', {layout:'admin'})
}

const loadSales = (req, res) => {
    res.render('admin/sales', {layout:'admin'})
}

const loadCategory = (req, res) => {
    res.render('admin/category', {layout:'admin'})
}

const loadSettings = (req, res) => {
    res.render('admin/settings', {layout:'admin'})
}

const loadUserEdit = async (req, res) => {
    try {
        const { id } = req.params
        const user = await userModel.findOne({ _id: id })
        if(!user) return redirect('/admin/users')
        res.render('admin/editUser', {layout:'admin', user})
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}

const loadProductsAdd = (req, res) => {
    res.render('admin/addProduct', {layout:'admin'})
}

const loginAdmin = async (req, res) => {
    try {
        const errors = validationResult(req);
         if (!errors.isEmpty()) {
           return res.render("admin/login", {
             message: "invalid credentials",
             icon: "error",
           });
        }
        
        const { email, password } = req.body
        
        const admin = await userModel.findOne({ email })
        if (admin.role !== "admin") return res.render('admin/login', { message: "Invalid admin Email", icon: "error" })
        
        const checkPass = await bcrypt.compare(password, admin.password)
        if (!checkPass) return res.render('admin/login', { message: "Invalid Password", icon: "error" })
        
        req.session.user = email
        res.redirect('/admin/dashboard')
        
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}

const changeUserStatus = async (req, res) => {
    try {
        const { id } = req.params
        const body = req.body
        const user = await userModel.updateOne({ _id: id }, body)
        req.session.user = null
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}

const editUser = async (req, res) => {
    try {
        const body = req.body
        const user = await userModel.findOne({ email:body.email })
        if (!user) return res.status(404).json({ message: "User not found" })
        await userModel.updateOne({ email: body.email }, body)
        const updatedUser = await userModel.findOne({email:body.email})
        res.status(200).json(updatedUser)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

const searchUser = async (req, res) => {
    try {
        const query = req.query.query
        const currentPage = parseInt(req.query.currentPage)
        const limit = parseInt(req.query.limit)
        const searchValue = {role:"user"}
        if (query) {
            searchValue.email = query
        }
        const data = await paginate(userModel, limit, currentPage, JSON.stringify(searchValue))
        if (!data.result) return res.status(404).json({ message: "User not found" })
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

const addProduct = async (req, res) => {
    try {
        const { name, developer, category, description, price, offerPrice, stock } = req.body
        const findProduct = await productModel.findOne({ name, description, price, offerPrice })
        if(findProduct) return res.redirect('/admin/products/add')
        const newProduct = new productModel({
            name,
            developer,
            categoryId: "Add Category Model",
            description,
            price,
            offerPrice,
            stock,
            coverImage: req.files.coverImage?.[0]?.path || null,
            thumbnail: req.files.thumbnail?.[0]?.path || null
        })
        await newProduct.save()
        const products = await productModel.find({}).sort({ createdAt: 1 })
        console.log(products)
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error)
    }
}

const editProduct = async(req, res) => {
    try {
        const {_id} = req.params
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}


const logout = (req, res) => {
    req.session.destroy()
    res.redirect('/admin/login')
}


module.exports = {
    loadLogin,
    loginAdmin,
    loadDashboard,
    logout,
    loadUsers,
    loadProducts,
    loadOrders,
    loadBanners,
    loadCoupons,
    loadSales,
    loadCategory,
    loadSettings,
    loadUserEdit,
    loadProductsAdd,
    changeUserStatus,
    editUser,
    searchUser,
    addProduct,
    editProduct,
}






