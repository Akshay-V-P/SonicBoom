const loadOrders = async (req, res) => {
    try {
        res.render('user/orders', {layout:'userAccount'})
    } catch (error) {
        console.log(error)
        res.render('user/500Error')
    }
}

module.exports = {
    loadOrders,
}