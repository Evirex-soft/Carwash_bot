const express = require('express');
const { verifyWebHook, incomingMessages } = require("../controllers/messageController");
const razorpayWebhook = require("../controllers/razorpay");

const router = express.Router();

// Create routes for webhooks
router.get("/webhook", verifyWebHook);

router.post("/webhook", incomingMessages);

// Razorpay webhook
router.post("/webhook/razorpay", razorpayWebhook);

module.exports = router;