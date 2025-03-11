const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const askPackagePurchase = async function (senderId, packageId) {
    try {
        const payload = {
            messaging_product: "whatsapp",
            to: senderId,
            type: "interactive",
            interactive: {
                type: "button",
                header: { type: "text", text: "🎁 Package Purchase" },
                body: { text: "Do you want to purchase this package?" },
                footer: { text: "Powered by Red Dot Steam Spa" },
                action: {
                    buttons: [
                        { type: "reply", reply: { id: "purchase_yes", title: "✅ Yes" } },
                        { type: "reply", reply: { id: "purchase_no", title: "❌ No" } }
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

        console.log(`Asked ${senderId} for package purchase confirmation`);
    } catch (error) {
        console.error("Error asking package purchase:", error.response?.data || error);
    }
};

module.exports = askPackagePurchase;