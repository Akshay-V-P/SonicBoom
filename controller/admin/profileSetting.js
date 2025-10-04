
const userModel = require("../../model/userModel")

const loadSettings = async (req, res) => {
    try {
        const adminEmail = req.session.admin
        const admin = await userModel.findOne({ email: adminEmail })
        if(!admin) return res.render("admin/settings", {layout:'admin', message:"Cant find admin"})
        res.render('admin/settings', {layout:'admin', admin})
    } catch (error) {
        console.log(error)
        res.render("admin/500Error")
    }
    
}

module.exports = {
    loadSettings
}