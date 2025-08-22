const categoryModel = require('../../model/categoryModel')
const productModel = require('../../model/productModel')

const loadLandingPage = async(req, res) => {
    try {
        const categorys = await categoryModel.find()
        const trendingGames = await productModel.find({ rating: { $gte: 4 }, isListed: true, isActive:true }).limit(5)
        const topSelling = await productModel.find({ isListed: true, isActive: true }).limit(7)
        const mostPopular = await productModel.find({ isListed: true, isActive: true }).sort({ name: -1 }).limit(7)
        res.render('user/landingPage', {layout:'user',categorys, trendingGames, topSelling, mostPopular})
    } catch (error) {
        console.log(error)
        res.render('user/500Error')
    }
}

module.exports = {
    loadLandingPage,
}