const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

// Function to confirm booking
const confirmBooking = async function (senderId) {
    try {
        const confirmationPayload = {
            messaging_product: "whatsapp",
            to: senderId,
            type: "text",
            text: { body: "✅ Booking Confirmed! Thank you for choosing Red Dot Steam Spa." },
        };

        await axios.post(process.env.WHATSAAP_API_URL, confirmationPayload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        console.log(`Booking confirmed for ${senderId}`);
    } catch (error) {
        console.error("Error confirming booking:", error.response?.data || error);
    }
};

module.exports = confirmBooking;