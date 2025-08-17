const loadSettings = (req, res) => {
    res.render('admin/settings', {layout:'admin'})
}

module.exports = {
    loadSettings
}