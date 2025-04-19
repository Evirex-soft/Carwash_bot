const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();


// Define Enhanced Location Details
const LOCATION_DETAILS = {
    latitude: "11.258591",
    longitude: "75.785338",
    name: "🚗 RedDot Steam Spa ",
    address: "📍 RedDot Steam Spa, Car Detailing Shop, Basement Focus Mall, Rajaji Road, New Bus Stand, Opposite Focus Mall, Calicut\n\n✨ Experience the ultimate car spa & steam wash!",
};

// Additional Information
const MESSAGE_TEXT = `
🌟 *Welcome to Red Dot Steam Spa!* 🌟

✨ We Owe You The Cleanest Car! 

📍 *Find Us Here:* ${LOCATION_DETAILS.name}
📌 Address: ${LOCATION_DETAILS.address}

🕒 *Business Hours:*  
🗓️ Monday - Sunday  
⏰ 11:00 AM - 11:00 PM  

📞 *Contact Us:* +91 9746246141

🔹 *Book Your Service Now!*
`;

// Visit Website
const sendLocation = async function (senderId) {
    try {
        const locationPayload = {
            messaging_product: "WHATSAPP",
            to: senderId,
            type: "location",
            location: LOCATION_DETAILS,
        };

        await axios.post(process.env.WHATSAAP_API_URL, locationPayload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
        console.log(`Location sent to ${senderId}`);

        // Send WhatsApp Text Message
        const textPayload = {
            messaging_product: "WHATSAPP",
            to: senderId,
            type: "text",
            text: { body: MESSAGE_TEXT },
        };

        await axios.post(process.env.WHATSAAP_API_URL, textPayload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

    } catch (error) {
        console.error("Error sending location:", error.response?.data || error);
    }
};

module.exports = sendLocation;