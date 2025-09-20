const productModel = require("../../model/productModel")

const showPage = async(req, res) => {
    try {
        const productId = req.query.productId
        const product = await productModel.findOne({ _id: productId, isActive: true, isListed: true }).populate('categoryId')
        if (!product) return res.render('user/productDetails', { layout: 'user'})
        const relatedProducts = await productModel.find({ categoryId: product.categoryId, $nor: [{ _id: productId }, { isListed: false }, { isActive: false }] }).limit(5)
        console.log(relatedProducts)
        
        
        res.render('user/productDetails', {layout: 'user', product, relatedProducts})
    } catch (error) {
        console.log(error)
        res.render('user/500Error')
    }
}

const getInfo = async (req, res)=>{
    try {
        const { index, productId } = req.query
        const product = await productModel.findOne({ _id: productId })
        if (!product) return res.status(404).json({ success: false })
        const data = JSON.parse(JSON.stringify(product.variants[index]))
        data.developer = product.developer
        console.log(data)
        res.status(200).json(data)
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false})
    }
}

module.exports = {
    showPage,
    getInfo
}