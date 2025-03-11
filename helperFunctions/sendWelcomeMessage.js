const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const conversation = {};



const sendWelcomeMessage = async function (senderId, userName) {
    try {
        // Store the user's name in the conversation object
        conversation[senderId] = conversation[senderId] || {};
        conversation[senderId].name = userName;

        const payload = {
            messaging_product: "WHATSAPP",
            to: senderId,
            type: "interactive",
            interactive: {
                type: "button",
                header: {
                    type: "image",
                    image: {
                        link: "https://images.unsplash.com/photo-1608506375591-b90e1f955e4b?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    },
                },
                body: {
                    text: `HI ${userName},
                    Explore our premium services and book your appointment today!`,
                },
                footer: { text: "Powered by Red Dot Steam Spa" },
                action: {
                    buttons: [
                        {
                            type: "reply",
                            reply: { id: "appointment", title: "📅 Book a Slot" },
                        },
                        {
                            type: "reply",
                            reply: { id: "view_services", title: "🛍️ View Services" },
                        },
                        {
                            type: "reply",
                            reply: { id: "visit_location", title: "🌐 Visit Our Location" },
                        },
                    ],
                },
            },
        };

        await axios.post(process.env.WHATSAAP_API_URL, payload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
        console.log(`Welcome message sent to ${userName}`);
    } catch (error) {
        console.error(
            "Error sending welcome message:",
            error.response?.data || error
        );
    }
};

module.exports = sendWelcomeMessage;