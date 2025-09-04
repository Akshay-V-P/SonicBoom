const addressModel = require("../../model/addressModel")
const userModel = require("../../model/userModel")

const loadAddress = async(req, res) => {
    try {
        const _id = req.session.user._id
        const addresses = await addressModel.find({userId:_id, isActive:true})
        res.render('user/manageAddress', {layout:'userAccount', addresses})
    } catch (error) {
        console.log(error)
        res.render('user/500Error')
    }
}

const loadAddAddress = async (req, res) => {
    res.render('user/addAddress', {layout:'userAccount'})
}

const loadEditAddress = async (req, res) => {
    try {
        const _id = req.query._id
        const address = await addressModel.findOne({_id})
        res.render('user/editAddress', {layout:'userAccount', address})
    } catch (error) {
        console.log(error)
        res.render('user/500Error')
    }
}

const addAddress = async (req, res) => {
    try {
        const _id = req.session.user._id
        const address = req.body
        const user = await userModel.findOne({ _id })
        if (!user) return res.status(404).json({ success: false })
        if (user.isBlocked) return res.status(401).json({ success: false })
        
        address.userId = _id
        const defaultAddress = await addressModel.findOne({ default: true })
        if (!defaultAddress) {
            address.default = true;
        }
        if (address.default && defaultAddress) {
            defaultAddress.default = false;
            await defaultAddress.save();
        }

        const newAddress = new addressModel(address)
        await newAddress.save()
        const addresses = await addressModel.find({userId:_id})
        res.status(200).json({success:true, addresses})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false})
    }
}

const updateAddress = async (req, res) => {
    try {
        const address = req.body
        const _id = address._id
        const getAddress = await addressModel({ _id: _id })
        if (!getAddress) return res.status(404).json({ success: false })
        delete address._id
        await addressModel.updateOne({_id}, {$set:address})
        res.status(200).json({success:true})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false})
    }
}

const deleteAddress = async (req, res) => {
    try {
        const { _id } = req.query
        const address = await addressModel.findOne({ _id })
        if (address.default) {
            const newDefault = await addressModel.find({ userId: req.session.user._id, isActive: true, _id:{$ne:_id} }).sort({ createdAt: -1 }).limit(1)
            if (newDefault.length >0) {
                const saveDefault = newDefault[0]
                saveDefault.default = true
                await saveDefault.save()
            }
        }
        await addressModel.deleteOne({_id})
        res.status(200).json({success:true})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:true})
    }
}

const setDefault = async (req, res) => {
    try {
        const { _id } = req.query
        const address = await addressModel.findOne({ _id })
        if (!address) res.status(404).json({success:false})
        const defaultAddress = await addressModel.findOne({ default: true })
        if (defaultAddress) {
            defaultAddress.default = false
            await defaultAddress.save()
        }
        address.default = true
        await address.save()
        res.status(200).json({success:true})
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false})
    }
}

module.exports = {
    loadAddress,
    loadAddAddress, 
    loadEditAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefault,
}