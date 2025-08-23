const userModel = require("../../model/userModel")

const showPage = async (req, res) => {
    try {
        const {email}  = req.session.user
        const user = await userModel.findOne({ email })
        if(!user) return res.redirect('/user/login')
        res.render('user/account', {layout:'userAccount', user})
    } catch (error) {
        console.log(error)
    }
}

const showEditPage = async (req, res) => {
    try {
        res.render('user/editAccount', {layout:'userAccount'})
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    showPage,
    showEditPage,
}