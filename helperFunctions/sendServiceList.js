const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

// View Services Function
const sendServiceList = async function (senderId) {
    try {
        const payload = {
            messaging_product: "whatsapp",
            to: senderId,
            type: "interactive",
            interactive: {
                type: "list",
                header: {
                    type: "text",
                    text: "🚗 Our Car Wash Services",
                },
                body: {
                    text: "🌟 Choose a service to get started! 🚘",
                },
                footer: { text: "🔹Powered by Red Dot Steam Spa" },
                action: {
                    button: "View Services",
                    sections: [
                        {
                            title: "Categories",
                            rows: [
                                { id: "single_wash", title: "🚿 Single Wash" },
                                { id: "wash_wax", title: "🛁 Wash + Wax" },
                                { id: "hard_water_front", title: "💧 Front Glass Cleaning" },
                                {
                                    id: "hard_water_full_glass",
                                    title: "🪟 Full Glass Cleaning",
                                },
                                { id: "hard_water_full_car", title: "🚘 Full Car Cleaning" },
                                { id: "engine_detailing", title: "🔧 Engine Detailing" },
                                { id: "interior_detailing", title: "🛋️ Interior Detailing" },
                                { id: "special_packages", title: "✨ Special Packages" },
                            ],
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
        console.log(`Service list sent to ${senderId}`);
    } catch (error) {
        console.error("Error sending service list:", error.response?.data || error);
    }
};

module.exports = sendServiceList;