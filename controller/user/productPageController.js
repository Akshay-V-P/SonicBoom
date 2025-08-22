const productModel = require("../../model/productModel")

const showPage = async(req, res) => {
    try {
        const productId = req.query.productId
        const product = await productModel.findOne({ _id: productId, isActive: true, isListed: true }).populate('categoryId')
        if (!product) return res.render('user/productDetails', { layout: 'user'})
        const relatedProducts = await productModel.find({categoryId:product.categoryId, $nor:[{_id:productId}, {isListed:false}, {isActive:false}]}).limit(5)
        
        
        res.render('user/productDetails', {layout: 'user', product, relatedProducts})
    } catch (error) {
        console.log(error)
        res.render('user/500Error')
    }
}

module.exports = {
    showPage,
}