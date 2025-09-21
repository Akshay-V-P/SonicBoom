const categoryModel = require('../model/categoryModel')
const orderModel = require('../model/ordersModel')

async function getSalesData(limit, currentPage, findQuery, sort, populate) { 
    let skip = (limit * currentPage) - limit
    let docCount 

    let pipeline = [
        { $match: findQuery || {} },
        { $unwind: "$orderItems" },
        {
            $lookup: {
                from: "categories",
                localField: "orderItems.categoryId",
                foreignField: "_id",
                as:"category"
        }},
        {
            $facet: {
                docData: [{ $count: "docCount" }],
                data:[...(sort?[{$sort:sort}] : []), {$skip:skip}, {$limit:limit}]
        }}
    ]

    let result = await orderModel.aggregate(pipeline)

    
    docCount = result[0]?.docData[0]?.docCount
    let report = result[0]?.data
    let totalPages = Math.ceil(docCount / limit)
    
    
    return {report, docCount, totalPages, currentPage}
}


module.exports = getSalesData