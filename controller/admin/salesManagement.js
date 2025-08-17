const loadSales = (req, res) => {
    res.render('admin/sales', {layout:'admin'})
}


module.exports = {
    loadSales
}