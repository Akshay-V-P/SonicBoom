const userModel = require("../model/userModel")

const isBlocked = async (req, res, next) => {
    try {
        const user = await userModel.findOne({ _id: req.session?.user?._id })
        if (user.isBlocked) {
            req.session.destroy()
            return res.redirect("/login")
        }
        next()
    } catch (error) {
        console.log(error)
    }
}

module.exports = isBlocked