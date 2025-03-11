const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();


// Send Sub Services Function
const sendSubServices = async function (senderId, categoryId) {
    const services = {
        single_wash: [
            { id: "exterior_wash", title: "🚿 Exterior Wash" },
            { id: "interior_vacuum", title: "🧹 Vacuum Cleaning" },
            { id: "dashboard_wipe", title: "🧼 Dashboard Wiping" },
            { id: "premium_polish", title: "✨ Premium Polish" },
            { id: "tyre_polish", title: "🛞 Tyre Polish" },
            { id: "fiber_polish", title: "🖤 Fiber Polish" },
        ],
        wash_wax: { id: "wash_wax_", title: "🛁 Wash & Wax" },
        hard_water_front: { id: "hard_water_front_", title: "💧 Hard Water - Front" },
        hard_water_full_glass: { id: "hard_water_full_glass_", title: "🪟 Hard Water - Full" },
        hard_water_full_car: { id: "hard_water_full_car_", title: "🚘 Hard Water - Car" },
        engine_detailing: { id: "engine_detailing_", title: "🔧 Engine Detail" },
        interior_detailing: [
            { id: "interior_detailing_normal", title: "🛋️ Interior Normal" },
            { id: "interior_detailing_premium", title: "🛋️ Interior Premium" },
        ],
        special_packages: [
            { id: "package_10_washes", title: "🛠️ 10 Washes (3Y) - ₹3333" },
            { id: "package_unlimited_1_year", title: "♾️ 1Y Unlimited - ₹9999" },
            { id: "package_unlimited_7_months", title: "📅 7M Unlimited - ₹6999" },
        ],
    };

    let subServices = services[categoryId];

    console.log(" subservices......:", subServices);


    // Log the categoryId and subServices to debug
    console.log(`Category: ${categoryId}`, subServices);

    if (!subServices) {
        console.error(`Invalid categoryId: ${categoryId}`);
        return;
    }

    if (!Array.isArray(subServices)) {
        subServices = [subServices];
    }

    try {
        if (!Array.isArray(subServices)) {
            // ✅ Directly send a text message for single-service categories
            const directPayload = {
                messaging_product: "whatsapp",
                to: senderId,
                type: "text",
                text: { body: `🔹 ${subServices.title}\n\nFor more details, contact us.` },
            };

            await axios.post(process.env.WHATSAAP_API_URL, directPayload, {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            });

            console.log(`Single service '${subServices.title}' sent to ${senderId}`);
            return;
        }

        const payload = {
            messaging_product: "whatsapp",
            to: senderId,
            type: "interactive",
            interactive: {
                type: "list",
                header: { type: "text", text: "Select a Service" },
                body: { text: "✨ Choose a service to view details." },
                footer: { text: "Powered by Red Dot Steam Spa" },
                action: {
                    button: "Select Service",
                    sections: [
                        {
                            title: "Services",
                            rows: subServices.map((service) => ({
                                id: service.id,
                                title: service.title,
                            })),
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

        console.log(`Sub services sent to ${senderId}`);
    } catch (error) {
        console.error("Error sending sub services:", error.response?.data || error);
    }
};

module.exports = sendSubServices;
