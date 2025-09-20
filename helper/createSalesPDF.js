const PDFDocument = require("pdfkit");
const calculateSalesData = require("./salesDataCalculator");
const ordersModel = require("../model/ordersModel")

const downloadSalesReport = async (req, res, data) => {
  try {
    // Replace this with your DB query result
      const orders = await ordersModel.aggregate([{ $match: {} }, {$unwind:"$orderItems"}])
      

console.log(orders)
    // Create PDF document
    const doc = new PDFDocument({ margin: 30, size: "A4" });

    // Set headers for download
    res.setHeader("Content-Disposition", "attachment; filename=sales_report.pdf");
    res.setHeader("Content-Type", "application/pdf");

    // Pipe to response
    doc.pipe(res);

    // Title
    doc.fontSize(16).text("Sales Report", { align: "center" });
    doc.moveDown();

    // Table headers
    const tableTop = 100;
    const rowHeight = 20;

    doc.fontSize(10).text("Order ID", 40, tableTop);
    doc.text("Date", 140, tableTop);
    doc.text("Product", 220, tableTop);
    doc.text("Qty", 380, tableTop, { width: 40, align: "center" });
    doc.text("Price", 430, tableTop, { width: 60, align: "right" });
    doc.text("Total", 500, tableTop, { width: 60, align: "right" });

    let y = tableTop + rowHeight;

    // Table rows
      orders.forEach((order) => {
        
          const item = order.orderItems;
          console.log(item)
      doc.fontSize(9).text(order.orderId, 40, y);
      doc.text(new Date(order.createdAt).toLocaleDateString(), 140, y);
      doc.text(item.productName, 220, y, { width: 150 });
      doc.text(item.quantity.toString(), 380, y, { width: 40, align: "center" });
      doc.text(item.offerPrice.toLocaleString() + " rs", 430, y, { width: 60, align: "right" });
      doc.text(order.total.toLocaleString() + " rs", 500, y, { width: 60, align: "right" });
      y += rowHeight;
    });

    // Summary
    const totalAmount = orders.reduce((acc, o) => acc + o.total, 0);
    doc.moveDown().fontSize(12).text("Grand Total: INR " + totalAmount.toLocaleString(), { align: "right" });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating report");
  }
};

module.exports = downloadSalesReport ;
