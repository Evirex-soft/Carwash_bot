const axios = require("axios");
const dotenv = require("dotenv");
const mongoose = require('mongoose');
const Banner = require('../model/bannerModel');
dotenv.config();

const conversation = {};


const sendWelcomeMessage = async function (senderId, userName, isNewCustomer) {
    try {
        // Store the user's name in the conversation object
        conversation[senderId] = conversation[senderId] || {};
        conversation[senderId].name = userName;

        // fetch the banner
        const banner = await Banner.findOne();
        const imageUrl = banner ? banner.imageUrl : "https://images.pexels.com/photos/3354647/pexels-photo-3354647.jpeg?cs=srgb&dl=pexels-koprivakart-3354647.jpg&fm=jpg";


        const messageBody = isNewCustomer
            ? `Hi ${userName}, \n\nWelcome to Red Dot Steam Spa! 🎉 As a new customer, you get a *10% discount* on your first car wash! 🚗✨`
            : `Hi ${userName}, \n\nWelcome back! Explore our premium services and book your appointment today!`;

        const payload = {
            messaging_product: "WHATSAPP",
            to: senderId,
            type: "interactive",
            interactive: {
                type: "button",
                header: {
                    type: "image",
                    image: { link: imageUrl },
                },
                body: { text: messageBody },
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