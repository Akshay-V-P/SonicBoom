const express = require('express')
const router = express.Router()
const paymentController = require('../controller/transaction/paymentController')


router.post("/create-order", paymentController.createOrder);
router.post("/verify-payment", paymentController.verifyOrder);

router.get("/failed", paymentController.paymentFailed)

module.exports = router;
