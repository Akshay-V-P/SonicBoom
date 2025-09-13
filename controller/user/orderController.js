const paginate = require("../../helper/pagination");
const ordersModel = require("../../model/ordersModel");
const productModel = require("../../model/productModel");
const PDFDocument = require("pdfkit");
const path = require("path");

const loadOrders = async (req, res) => {
    try {
        res.render("user/orders", { layout: "userAccount" });
    } catch (error) {
        console.log(error);
        res.render("user/500Error");
    }
};

const loadDetails = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 2;
        const limit = 10;
        const search = req.query.search === "null" ? null : req.query.search;
        const userId = req.session.user._id;
        const sort = req.query.sort || null;
        const sortQuery = { createdAt: -1 };
        const filterQuery = { userId };
        if (search) {
            const searchRegex = {
                $regex: new RegExp(`^${search}`),
                $options: "i",
            };

            filterQuery.$or = [{ orderId: searchRegex }];
        }
        const result = await paginate(
            ordersModel,
            limit,
            page,
            filterQuery,
            sortQuery
        );
        const orders = result.result;
        if (!orders)
            return res.status(404).json({ message: "No orders found" });
        let orderItems = [];
        for (let order of orders) {
            order = JSON.parse(JSON.stringify(order));
            order.orderedItems = [];
            for (let item of order.orderItems) {
                const product = await productModel.findOne({
                    _id: item.itemId,
                });

                if (!product) return res.status(404).json({ success: false });

                let variant = JSON.parse(
                    JSON.stringify(
                        product.variants.find(
                            (v) => v._id.toString() == item.variantId.toString()
                        )
                    )
                );
                let indexOfVariant = product.variants.findIndex(
                    (v) => v._id.toString() == item.variantId.toString()
                );

                variant.index = indexOfVariant;
                variant.productId = product._id;
                variant.offer = product.offer;
                variant.quantity = item.quantity;
                variant.status = item.status;
                order = JSON.parse(JSON.stringify(order));
                delete order.orderItems;
                delete variant.stock;
                order.orderedItems.push(variant);
            }
            orderItems.push(order);
        }
        const totalOrders = orderItems.length;
        res.status(200).json({ orders: orderItems, totalOrders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const loadOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.query;
        const order = await ordersModel.findOne({ orderId });
        if (!order) return res.render("user/404Error", { layout: "user" });
        let orders = JSON.parse(JSON.stringify(order));
        orders.orderItems = [];

        for (let item of order.orderItems) {
            const product = await productModel.findOne({ _id: item.itemId });
            if (!product) return res.render("user/404Error");

            let variant = JSON.parse(
                JSON.stringify(
                    product.variants.find(
                        (v) => v._id.toString() == item.variantId.toString()
                    )
                )
            );
            let indexOfVariant = product.variants.findIndex(
                (v) => v._id.toString() == item.variantId.toString()
            );

            variant.index = indexOfVariant;
            variant.productId = product._id;
            variant.offer = product.offer;
            variant.quantity = item.quantity;
            variant.status = item.status;
            delete variant.stock;
            orders.orderItems.push(variant);
        }
        let date = new Date(orders.createdAt).toLocaleDateString();
        orders.createdAt = date;
        if (orders.status === "processing") {
            orders.statusPercentage = "10%";
        } else if (orders.status === "shipped") {
            orders.statusPercentage = "40%";
        } else if (orders.status === "out-for-delivery") {
            orders.statusPercentage = "65%";
        } else if (orders.status === "delivered") {
            orders.statusPercentage = "100%";
        }

        res.render("user/orderStatus", {
            layout: "userAccount",
            order: orders,
        });
    } catch (error) {
        console.log(error);
        res.render("user/500Error");
    }
};

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const reason = req.body.reason || null;
        const order = await ordersModel.findOne({ orderId });
        if (!order)
            return res
                .status(404)
                .json({ message: "Unable to find the order" });
        if (order.status === "delivered")
            return res
                .status(401)
                .json({ message: "Can't cancel, order is already deliverd" });

        order.status = "cancelled";
        order.reason = reason;

        for (let item of order.orderItems) {
            const product = await productModel.findOne({ _id: item.itemId });
            if (!product) return res.render("user/404Error");

            let indexOfVariant = product.variants.findIndex(
                (v) => v._id.toString() == item.variantId.toString()
            );

            product.variants[indexOfVariant].stock += parseInt(item.quantity);
            await product.save();
        }
        order.orderItems.forEach((orders) => {
            orders.status = "cancelled";
        });
        await order.save();
        res.status(200).json({ message: "Order cancelled" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false });
    }
};

const cancelItem = async (req, res) => {
    try {
        const { orderId, productId, variantId } = req.query;

        const order = await ordersModel.findOne({ orderId });

        if (!order)
            return res
                .status(404)
                .json({ message: "Unable to find the order" });
        if (order.status === "delivered")
            return res
                .status(401)
                .json({ message: "Can't cancel, order is already deliverd" });
        const product = await productModel.findOne({ _id: productId });
        if (!product) return res.render("user/404Error");
        let indexOfVariant = product.variants.findIndex(
            (v) => v._id.toString() == variantId.toString()
        );

        let indexOfItem = order.orderItems.findIndex(
            (v) => v.variantId.toString() == variantId.toString()
        );
        order.orderItems[indexOfItem].status = "cancelled";
        order.total = (
            order.total - product.variants[indexOfVariant].offerPrice
        ).toFixed(2);
        order.subTotal = (
            order.subTotal - product.variants[indexOfVariant].price
        ).toFixed(2);
        order.discount = (
            order.discount -
            order.discount / order.orderItems.length
        ).toFixed(2);

        product.variants[indexOfVariant].stock += parseInt(
            order.orderItems[indexOfItem].quantity
        );
        const NotAllCancelled = order.orderItems.filter(
            (item) => item.status !== "cancelled"
        );
        if (NotAllCancelled.length === 0) {
            order.status = "cancelled";
        }

        await order.save();
        await product.save();

        res.status(200).json({ message: "cancelled" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false });
    }
};

const returnItem = async (req, res) => {
    try {
        const { productId, orderId, variantId } = req.query;
        const reason = req.body.reason;

        const order = await ordersModel.findOne({ orderId });

        if (!order) {
            return res
                .status(404)
                .json({ message: "Unable to find the order" });
        }

        if (order.status === "cancelled") {
            return res
                .status(401)
                .json({ message: "Can't return, order is cancelled" });
        }

        if (order.status !== "delivered") {
            return res
                .status(401)
                .json({ message: "Can't return, order is not delivered" });
        }

        let indexOfItem = order.orderItems.findIndex(
            (v) => v.variantId.toString() === variantId.toString()
        );

        if (indexOfItem === -1) {
            return res.status(404).json({ message: "Item not found in order" });
        }

        order.orderItems[indexOfItem].status = "returned";
        order.reason = reason;

        const allItemsReturned = order.orderItems.every(
            (item) => item.status === "returned"
        );

        if (allItemsReturned) {
            order.status = "returned";
        }

        const product = await productModel.findOne({ _id: productId });
        if (!product) {
            return res.render("user/404Error");
        }

        let indexOfVariant = product.variants.findIndex(
            (v) => v._id.toString() === variantId.toString()
        );
        if (indexOfVariant === -1) {
            return res.status(404).json({ message: "Variant not found" });
        }

        product.variants[indexOfVariant].stock += parseInt(
            order.orderItems[indexOfItem].quantity
        );

        await order.save();
        await product.save();

        res.status(200).json({ message: "Return successful" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const downloadInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Fetch order from DB
        const order = await ordersModel.findOne({ orderId });
        if (!order) return res.status(404).send("Order not found");

        // Populate product details for each item
        const items = [];
        for (let item of order.orderItems) {
            const product = await productModel.findById(item.itemId);
            const variantIndex = product.variants.findIndex(
                (v) => v._id.toString() == item.variantId.toString()
            );
            items.push({
                name: product.variants[variantIndex]?.name || "Unknown Product",
                qty: item.quantity,
                price: product.variants[variantIndex]?.price || 0,
                total:
                    (product.variants[variantIndex]?.price || 0) *
                    item.quantity,
            });
        }

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${order.orderId}.pdf`
        );
        doc.pipe(res);

        // --- Header ---
        doc.fontSize(20).text("Invoice", { align: "center" });
        doc.moveDown();

        // --- Order Info ---
        doc.fontSize(12).text(`Order ID: ${order.orderId}`);
        doc.text(`Date: ${order.createdAt.toDateString()}`);
        doc.text(`Payment Method: ${order.paymentMethod}`);
        doc.text(`Status: ${order.status}`);
        doc.moveDown();

        // --- Address ---
        doc.fontSize(14).text("Billing Address", { underline: true });
        doc.fontSize(12).text(order.address.name);
        doc.text(
            `${order.address.address}, ${order.address.city}, ${order.address.district}`
        );
        doc.text(`${order.address.state} - ${order.address.pincode}`);
        doc.text(`Phone: ${order.address.mobile}`);
        doc.text(`Email: ${order.address.email}`);
        doc.moveDown();

        // --- Items Table ---
        doc.fontSize(14).text("Order Items", { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(12).text(
            "Item".padEnd(25) + "Qty".padEnd(10) + "Price".padEnd(10) + "Total"
        );
        doc.moveDown(0.5);

        items.forEach((i) => {
            doc.text(
                `${i.name.padEnd(25)} ${String(i.qty).padEnd(10)} ${String(
                    i.price
                ).padEnd(10)} ${i.total}`
            );
        });

        doc.moveDown(1);

        // --- Summary ---
        doc.fontSize(14).text("Summary", { underline: true });
        doc.fontSize(12).text(`Subtotal: ${order.subTotal}rs`);
        doc.text(`Discount: -${order.discount}`);
        doc.text(`Shipping: ${order.deliveryCharge}`);

        let yPos = doc.y;
        doc.fontSize(12).text(`Total: INR ${order.total}`, 50, yPos, {
            align: "right",
        });
        const logoPath = path.join(
            __dirname,
            "../../public/images/brand-logo.png"
        );
        doc.image(logoPath, 300, yPos - 5, { width: 80, align: "right" });
        doc.moveDown(3);

        // --- Footer ---
        doc.fontSize(10).text("Thank you for shopping with us!", {
            align: "center",
        });
        doc.fontSize(10).text("SonicBoom", { align: "center" });

        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).send("Error generating invoice");
    }
};

module.exports = {
    loadOrders,
    loadDetails,
    loadOrderStatus,
    cancelOrder,
    cancelItem,
    returnItem,
    downloadInvoice,
};
