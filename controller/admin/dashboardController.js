const loadDashboard = (req, res) => {
    res.render('admin/dashboard',{layout:'admin'})
}


module.exports = {
    loadDashboard,
}