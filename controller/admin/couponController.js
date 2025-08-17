const loadCoupons = (req, res) => {
    res.render('admin/coupons', {layout:'admin'})
}


module.exports = {
    loadCoupons
}