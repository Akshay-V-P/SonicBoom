const ExcelJS = require("exceljs");
const calculateSalesData = require("./salesDataCalculator");
const ordersModel = require("../model/ordersModel");

const downloadSalesReportExcel = async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate.replace(/"/g, '')) : null;
    const endDate = req.query.endDate === "null" ? null : new Date(req.query.endDate.replace(/"/g, '')); 

    let findQuery = {};
    if (endDate === null) {
      findQuery.createdAt = { $gte: startDate };
    } else {
      findQuery.createdAt = { $gte: startDate, $lte: endDate };
    }

    const orders = await ordersModel.aggregate([
      { $match: findQuery },
      { $unwind: "$orderItems" }
    ]);

    const orderData = await calculateSalesData(findQuery);

    // ===== Create Workbook =====
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    // ===== Title =====
    worksheet.mergeCells("A1", "I1");
    worksheet.getCell("A1").value = "SonicBoom, Inc. - Sales Order Summary Report";
    worksheet.getCell("A1").font = { size: 14, bold: true };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    worksheet.addRow([]);
    worksheet.addRow(["Report Generated:", new Date().toLocaleString()]);

    // ===== Headers =====
    worksheet.addRow([]);
    const headerRow = worksheet.addRow([
      "S.No",
      "Order ID",
      "Customer",
      "Product",
      "Ord Date",
      "Qty",
      "Status",
      "Sub Total",
      "Discount",
      "Amount"
    ]);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFCC" }
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });

    // ===== Rows =====
    orders.forEach((order, index) => {
      const item = order.orderItems;
      let total = item.offerPrice * item.quantity;
      let subTotal = item.price * item.quantity;
      let discount = item.discount * item.quantity;

      if (order.couponDiscount > 0) {
        total -= (order.couponDiscount / order.totalItems) * item.quantity;
      }
      total += ((order.gstAmount / order.totalItems) || 0) * item.quantity;
      subTotal += ((order.gstAmount / order.totalItems) || 0) * item.quantity;

      worksheet.addRow([
        index + 1,
        order.orderId,
        order.address.name,
        item.productName || "Unknown",
        new Date(order.createdAt).toLocaleDateString(),
        item.quantity,
        item.status.toUpperCase(),
        subTotal,
        discount,
        total.toFixed(2)
      ]);
    });

    // ===== Totals =====
    worksheet.addRow([]);
    worksheet.addRow([`Total for this Report: ${orderData.totalSales.amount}`]);
    worksheet.addRow([`Total value: ${orderData.totalValue}`]);
    worksheet.addRow([`Unpaid orders: ${orderData.unpaidOrders.amount}`]);
    worksheet.addRow([`Cancelled Orders: ${orderData.cancelledOrders.amount.toFixed(2)}`]);
    worksheet.addRow([`Refunded Amount: ${orderData.refundedOrders.amount}`]);
    worksheet.addRow([`Total Discount: ${orderData.discountAmount}`]);
    worksheet.addRow([`Coupon Discount: ${orderData.couponDiscounts}`]);

    // ===== Response Headers =====
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=sales_report_${startDate.toLocaleDateString()}_${endDate ? endDate.toLocaleDateString() : "till"}.xlsx`
    );
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating Excel report");
  }
};

module.exports = downloadSalesReportExcel;
