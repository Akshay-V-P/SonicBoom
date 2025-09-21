const PDFDocument = require("pdfkit");
const calculateSalesData = require("./salesDataCalculator");
const ordersModel = require("../model/ordersModel");

const downloadSalesReport = async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate.replace(/"/g, '')) : null
    const endDate = req.query.endDate === "null" ? null : new Date(req.query.endDate.replace(/"/g, '')) 
    let findQuery = {}
    if (endDate === null) {
        findQuery.createdAt = {$gte:startDate}
    } else {
        findQuery.createdAt = { $gte:startDate, $lte:endDate}
    }

    const orders = await ordersModel.aggregate([
      { $match: findQuery },
      { $unwind: "$orderItems" }
    ]);
    const orderData = await calculateSalesData(findQuery);

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader("Content-Disposition", `attachment; filename=sales_report_${startDate.toLocaleDateString()}_${endDate? endDate.toLocaleDateString():"till"}.pdf`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // ===== HEADER =====
    doc.fontSize(10).text(new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(), 40, 30);
    doc.text("Page 1 of 1", 500, 30, { align: "right" });

    doc.text("Printed By: Admin", 40, 50);
    doc.fontSize(14).text("SonicBoom, Inc.", { align: "center" });
    doc.fontSize(12).text("Sales Order Summary Report", { align: "center" });
    doc.moveDown();



    // ===== COLUMN POSITIONS (compact) =====
    const tableTop = 120;
    const rowHeight = 18;

    const colX = {
      si: 15,
      so: 40,        // SO#
      cust: 130,      // Customer#
      comp: 200,     // Company (shortened)
      ordDate: 280,  // Ord Date
      qteDate: 330,
      status: 360,
      payCode: 430,  // Pay Code
      tax: 470,      // Sales Tax
      amt: 520       // Amount
    };

    // ===== HEADERS =====
    doc.fontSize(9).text("S.No", colX.si, tableTop);
    doc.text("Order ID", colX.so, tableTop);
    doc.text("Customer#", colX.cust, tableTop);
    doc.text("Product", colX.comp, tableTop);
    doc.text("Ord Date", colX.ordDate, tableTop);
    doc.text("Status", colX.status, tableTop);
    doc.text("Qte", colX.qteDate, tableTop);
    doc.text("Sub Total", colX.payCode, tableTop);
    doc.text("Discount", colX.tax, tableTop, { width: 50, align: "right" });
    doc.text("Amount", colX.amt, tableTop, { width: 60, align: "right" });

    let y = tableTop + rowHeight;

    // ===== ROWS =====
    orders.forEach((order, index) => {
      const item = order.orderItems;
      let total = item.offerPrice * item.quantity;
      let subTotal = item.price * item.quantity
      let discount = item.discount * item.quantity 
      if (order.couponDiscount > 0) {
        total -= (order.couponDiscount / order.totalItems) * item.quantity;
      }
      total += ((order.gstAmount / order.totalItems) || 0) * item.quantity;
      subTotal += ((order.gstAmount / order.totalItems) || 0) * item.quantity;

      doc.fontSize(8).text(index + 1, colX.si, y);
      doc.text(order.orderId, colX.so, y);
      doc.text(order.address.name, colX.cust, y);
      doc.text((item.productName || "Unknown").substring(0, 16), colX.comp, y, { width: 100 });
      doc.text(new Date(order.createdAt).toLocaleDateString(), colX.ordDate, y);
      doc.text(item.quantity, colX.qteDate, y);
      doc.text(item.status.toUpperCase(), colX.status, y);
      doc.text(subTotal, colX.payCode, y);
      doc.text(discount, colX.tax, y, { width: 50, align: "right" });
      doc.text(total.toFixed(2), colX.amt, y, { width: 60, align: "right" });

      y += rowHeight;

      if (y > 720) {
        doc.addPage();
        y = 100;
      }
    });

    // ===== TOTAL =====
    const totalAmount = orderData.totalSales.amount;
    const pageWidth = doc.page.width;
    const text = "Total for this Report : " + totalAmount.toLocaleString();

    doc.moveDown(2).fontSize(11);
    const textWidth = doc.widthOfString(text);

    doc.text(text, pageWidth - textWidth - 40, doc.y); 

    doc.text("Total value : " + orderData.totalValue, 40, doc.y); 
    doc.text("Unpaid orders : " + orderData.unpaidOrders.amount, 40, doc.y); 
    doc.text("Cancelled Orders : " + orderData.cancelledOrders.amount.toFixed(2), 40, doc.y); 
    doc.text("Refunded Amount : " + orderData.refundedOrders.amount, 40, doc.y); 
    doc.text("Total Discount : " + orderData.discountAmount, 40, doc.y); 
    doc.text("Coupon Discount : " + orderData.couponDiscounts, 40, doc.y); 


    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating report");
  }
};

module.exports = downloadSalesReport;
