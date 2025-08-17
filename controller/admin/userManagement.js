const userModel = require('../../model/userModel')
const paginate = require('../../helper/pagination')

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

module.exports = {
    loadUsers,
    loadUserEdit,
    changeUserStatus,
    editUser,
    searchUser,
}