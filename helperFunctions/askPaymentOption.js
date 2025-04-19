const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();


// Function to handle payment options
const askPaymentOption = async function (senderId) {
    try {
        const payload = {
            messaging_product: "whatsapp",
            to: senderId,
            type: "interactive",
            interactive: {
                type: "button",
                header: { type: "text", text: "💳 Pay Now" },
                body: { text: "Please click below to proceed securely." },
                footer: { text: "Tap the button to continue." },
                action: {
                    buttons: [
                        { type: "reply", reply: { id: "payment_online", title: "🌐 Online" } },
                    ]
                }
            }
        };

        await axios.post(process.env.WHATSAAP_API_URL, payload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        console.log(`Asked ${senderId} for payment option`);
    } catch (error) {
        console.error("Error asking payment option:", error.response?.data || error);
    }
};

module.exports = askPaymentOption;