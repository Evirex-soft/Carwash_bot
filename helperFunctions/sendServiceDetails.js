const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const carWashServices = require("../services/carWashServices");

// Send Service Details Function
const sendServiceDetails = async function (senderId, serviceId) {
    const details = carWashServices[serviceId];
    console.log("details:", details);


    if (!details) {
        console.error(`Service details not found for serviceId: ${serviceId}`);
        return;
    }

    // Check if price is an object (multiple models) or a single value
    let priceText;
    if (typeof details.price === "object") {
        // Multiple prices (for different car models)
        priceText = Object.entries(details.price)
            .map(([type, price]) => `• ${type}: ${price}`)
            .join("\n");
    } else {
        // Single price
        priceText = details.price;
    }

    try {
        const payload = {
            messaging_product: "WHATSAPP",
            to: senderId,
            type: "text",
            text: {
                body: `✨ *${details.title}*\n💵 Price: ${priceText}\n📝 Description: ${details.description}`,
            },
        };

        await axios.post(process.env.WHATSAAP_API_URL, payload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
        console.log(`Service details sent to ${senderId}`);
    } catch (error) {
        console.error(
            "Error sending service details:",
            error.response?.data || error
        );
    }
};

module.exports = sendServiceDetails;