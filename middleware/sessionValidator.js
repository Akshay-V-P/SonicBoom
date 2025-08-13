const isLogin = (req, res, next) => {
    if (!req.session.user || !req.user) {
        return res.redirect('/user/login')
    } else {
        next()
    }
}

// admin session
const isAdminLogin = (req, res, next) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login')
    } else {
        next()
    }
}

module.exports = {
    isLogin,
    isAdminLogin,
}