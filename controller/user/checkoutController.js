const loadCheckout = async(req, res) => {
    try {
        res.render('user/checkout', {layout:"user"})
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    loadCheckout,
}