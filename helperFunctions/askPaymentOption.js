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
                header: { type: "text", text: "💳 Payment Option" },
                body: { text: "How would you like to pay?" },
                footer: { text: "Select a payment method" },
                action: {
                    buttons: [
                        { type: "reply", reply: { id: "payment_online", title: "🌐 Online" } },
                        { type: "reply", reply: { id: "payment_center", title: "🏢 Pay at Center" } }
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