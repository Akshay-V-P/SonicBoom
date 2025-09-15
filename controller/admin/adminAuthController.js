const { validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const userModel = require('../../model/userModel')


const loadLogin = (req, res) => {
    res.render('admin/login')
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
        
        req.session.admin = email
        res.redirect('/admin/dashboard');
        
        
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}


const logout = (req, res) => {
    req.session.admin = null
    res.redirect('/admin/login')
}


module.exports = {
    loadLogin,
    loginAdmin,
    logout,
}






