const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

// Send Messages Function
const sendMessage = async function (senderId, text, options = []) {
    try {
        const payload = {
            messaging_product: "WHATSAPP",
            to: senderId,
            type: "text",
            text: { body: text },
        };

        // If buttons are valid
        if (options.length > 0 && options.length <= 3 && options[0].type === "reply") {
            payload.type = "interactive";
            payload.interactive = {
                type: "button",
                body: { text },
                action: { buttons: options },
            };
        }
        // Handle list type (more than 3 options)
        else if (options.length > 0) {
            payload.type = "interactive";
            payload.interactive = {
                type: "list",
                body: { text },
                action: {
                    button: "Select an option",
                    sections: [{
                        title: "Available Options",
                        rows: options.map(option => ({
                            id: option.reply.id,
                            title: option.reply.title
                        }))
                    }]
                }
            };
        }

        await axios.post(process.env.WHATSAAP_API_URL, payload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Error sending message:", error.response?.data || error);
    }
};

module.exports = sendMessage;