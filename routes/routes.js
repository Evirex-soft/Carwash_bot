const express = require('express');
const { verifyWebHook, incomingMessages } = require("../controllers/messageController");

const router = express.Router();

// Create routes for webhooks
router.get("/webhook", verifyWebHook);

router.post("/webhook", incomingMessages);

module.exports = router;