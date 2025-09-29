const calculateSalesData = require("../../helper/salesDataCalculator")
const getSalesData = require("../../helper/salesDataFetcher")

const loadSales = (req, res) => {
    res.render('admin/sales', {layout:'admin'})
}


const getData = async (req, res) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate.replace(/"/g, '')) : null
        const endDate = req.query.endDate === "null" ? null : new Date(req.query.endDate.replace(/"/g, ''))
        const filter = req.query.filter 
        const currentPage = req.query.currentPage ? parseInt(req.query.currentPage) : 1
        const limit = req.query.limit ? parseInt(req.query.limit) : 10
        let findQuery = {}
        if (endDate === null) {
            findQuery.createdAt = {$gte:startDate}
        } else {
            findQuery.createdAt = { $gte:startDate, $lte:endDate}
        }

        if (filter) {
            findQuery.status = filter
        }

        findQuery.status = "delivered"

        let result = await getSalesData(limit, currentPage, findQuery, null)
        
        let calculatedData = await calculateSalesData(findQuery)
        result = Object.assign(result, calculatedData)

        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}


module.exports = {
    loadSales,
    getData,
}