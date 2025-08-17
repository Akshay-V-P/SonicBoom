const loadBanners = (req, res) => {
    res.render('admin/banners', {layout:'admin'})
}

module.exports = {
    loadBanners,
}