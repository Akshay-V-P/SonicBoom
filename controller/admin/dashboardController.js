const calculateSalesData = require('../../helper/salesDataCalculator');
const orderModel = require('../../model/ordersModel')

const loadDashboard = (req, res) => {
    res.render('admin/dashboard',{layout:'admin'})
}

function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();

    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    let startOfDay = new Date(d.setDate(diff))
    startOfDay.setHours(0, 0, 0, 0)


    return startOfDay;
}


const getChartData = async (req, res) => {
    try {
        
        const { filter, from, to } = req.query;
    
        let groupId = null
        let matchStage = {
            status: { $eq: "delivered" },
            paymentStatus: "paid"
        };

        if (filter === "daily") {

            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));

            matchStage.createdAt = { $gte: startOfDay, $lte: endOfDay };

            groupId = { hour: { $hour: "$createdAt" } };

        } else if (filter === "weekly") {
            const today = new Date();

            const startOfWeek = getStartOfWeek(today)
            

            const endOfWeek = new Date(today);
            endOfWeek.setHours(23, 59, 59, 999);

            matchStage.createdAt = { $gte: startOfWeek, $lte: endOfWeek };

            groupId = { 
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" }
            };
        } else if (filter === "monthly") {
            
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

            matchStage.createdAt = { $gte: startOfMonth, $lte: endOfMonth };

            groupId = {
                year: { $year: "$createdAt" },
                week: { $isoWeek: "$createdAt" }
            };

        } else if (filter === "yearly") {
            
            const today = new Date();
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

            matchStage.createdAt = { $gte: startOfYear, $lte: endOfYear };

            groupId = {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
            };

        } else if (filter === "custom" && from && to) {
            matchStage.createdAt = {
                $gte: new Date(from),
                $lte: new Date(to),
            };

            groupId = {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" }
            };
        } else {
            return res.status(400).json({ message: "Invalid filter" });
        }

        const salesData = await orderModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: groupId,
                    totalRevenue: { $sum: "$total" },
                    totalOrders: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1, "_id.day": 1, "_id.hour": 1 } },
        ]);

        const salesDashboardData = await calculateSalesData(matchStage)

        const topSellingProduct = await orderModel.aggregate([
            {
                $match:matchStage
            },
            {
                $unwind:"$orderItems"
            },
            {
                $group: {
                    _id: "$orderItems.itemId",
                    productName: { $first:"$orderItems.productName"},
                    totalQuantity: { $sum: "$orderItems.quantity" },
                    totalRevenue:{$sum:"$orderItems.offerPrice"}
                }
            },
            { $sort: { totalQuantity: -1 } },
            {$limit:10}
        ])

        const topSellingCategory = await orderModel.aggregate([
            {
                $match:matchStage
            },
            {
                $unwind:"$orderItems"
            },
            {
                $group: {
                    _id: "$orderItems.categoryId",
                    totalRevenue:{$sum:"$orderItems.offerPrice"}
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as:"category"
                }
            },
            {
                $unwind:"$category"
            },
            {
                $project: {
                    _id: 0,
                    categoryName: "$category.name",
                    totalRevenue:1
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit:10 }
        ])

        
        res.status(200).json({ salesData, salesDashboardData, topSellingProduct, topSellingCategory })

    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}


module.exports = {
    loadDashboard,
    getChartData,
}