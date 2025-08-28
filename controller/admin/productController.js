const productModel = require('../../model/productModel')
const categoryModel = require('../../model/categoryModel')
const paginate = require('../../helper/pagination')
const calculateOffer = require('../../helper/offerCalculator')


const loadProducts = async (req, res) => {
    try {
        const categorys = await categoryModel.find()
        console.log('Hello')
        res.render('admin/products', {layout:'admin', categorys})
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}

const loadProductsShow = async (req, res) => {
    try {
        const page = parseInt(req.query.currentPage) || 1
        const limit = parseInt(req.query.limit) || 9
        const search = req.query.search
        const sort = req.query.sort || null
        const filter = req.query.filter || null

        const findQuery = {}
        const sortQuery = {}

        if (search) {
            const searchRegex = { $regex: search, $options: 'i' }
            findQuery.$or = [
                { name: searchRegex },
                { description: searchRegex }
            ]
        }

        if (filter) {
            findQuery.categoryId = filter
        }

        if (sort) {
            const parts = sort.split(":")
            sortQuery[parts[0]] = parseInt(parts[1])
        }


        const result = await paginate(productModel, limit, page, findQuery, sortQuery, "categoryId")
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}

const loadProductsAdd = async(req, res) => {
    try {
        const categorys = await categoryModel.find()
        res.render('admin/addProduct', { layout: 'admin', categorys })
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}

const addProduct = async (req, res) => {
    try {
        const { name, developer, category, description, price, offer, stock } = req.body
        const findProduct = await productModel.findOne({ name, description, price, offer })
        if (findProduct) return res.redirect('/admin/products/add')
        const thumbnailFile = req.files.find(file => file.fieldname === 'thumbnail');
        console.log(thumbnailFile)
        const coverImagePaths = req.files
            .filter(file => file.fieldname === 'coverImage')
            .map(file => file.path);
        const newProduct = new productModel({
            name,
            developer,
            categoryId:category,
            description,
            offer,
            coverImage: coverImagePaths,
            variants: [{
                name: name,
                price: price,
                offerPrice: calculateOffer(price, offer),
                stock:stock,
                thumbnail: thumbnailFile ? thumbnailFile.path : null,
            }]
        })
        await newProduct.save()
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}

const editProduct = async(req, res) => {
    try {
        const { _id } = req.params
        const product = await productModel.findOne({ _id })
        if (!product) return res.redirect('/admin/products')
        const categorys = await categoryModel.find()
        res.render('admin/editProducts', {layout:'admin', product, categorys})
    } catch (error) {
        console.log(error)
        res.render('admin/500Error')
    }
}

const updateProduct = async (req, res) => {
    try {
        const { _id } = req.params
        const data = { ...req.body }
        delete data.productId
        const fileMap = new Map()
        req.files.forEach(file => fileMap.set(file.fieldname, file.path))

        const product = await productModel.findOne({ _id })

        if (data) {
            const keys = Object.keys(data)
            keys.forEach(key => {
                if (key !== "variants" && key !== "price" && key !== "stock") {
                    product[key] = data[key]
                } else if(key == "variants"){
                    data.variants.forEach((variant, index) => {
                        variant.thumbnail = fileMap.get(`variants[${index}][thumbnail]`)
                        variant.offerPrice = calculateOffer(parseInt(variant.price), parseInt(data.offer))
                        product.variants.push(variant)
                    })
                } else {
                    product.variants[0].price = data.price
                    product.variants[0].stock = data.stock
                    product.variants[0].offerPrice = calculateOffer(parseInt(data.price), parseInt(data.offer))
                    if (fileMap.has('thumbnailImage')) product.variants[0].thumbnail = fileMap.get('thumbnailImage')  
                }
            })
        }

        await product.save()
        
        const updateQuery = {} ;
        req.files.forEach(file => {
            const match = file.fieldname.match(/^coverImage\[(\d+)\]$/);
            if (match) {
                const index = match[1]; 
                updateQuery.$set[`coverImage.${index}`] = file.path;
            }
        });

        await productModel.updateOne({_id}, updateQuery)
        res.status(200).json({message: "Updated"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "cant find"})
    }
}

const changeProductStatus = async (req, res) => {
    try {
        const { id } = req.params
        const body = req.body
        const product = await productModel.updateOne({ _id: id }, body)
        res.status(200).json(product)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}




module.exports = {
    loadProducts,
    loadProductsAdd,
    addProduct,
    editProduct,
    updateProduct,
    loadProductsShow,
    changeProductStatus,
}



