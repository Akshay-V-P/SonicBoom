const attachUser = (req, res, next)=>{
    if (req.user) {
        req.session.user = req.user
    } else if (req.session.user) {
        req.user = req.session.user
    }
    next()
}

module.exports = attachUser