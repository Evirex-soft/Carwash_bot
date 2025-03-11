const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const formatText = require("../services/formatText");

// Function to show booking preview
const showBookingPreview = async function (senderId, packageName, paymentMethod) {
    try {

        const formattedPackage = formatText(packageName);
        const formattedPayment = formatText(paymentMethod);

        const previewPayload = {
            messaging_product: "whatsapp",
            to: senderId,
            type: "interactive",
            interactive: {
                type: "button",
                header: { type: "text", text: "Booking Preview" },
                body: {
                    text: `📦 Package: ${formattedPackage}\n💳 Payment: ${formattedPayment}\n\nConfirm your booking.`,
                },
                footer: { text: "Powered by Red Dot Steam Spa" },
                action: {
                    buttons: [
                        { type: "reply", reply: { id: "confirm_booking1", title: "Confirm" } },
                        { type: "reply", reply: { id: "cancel_booking1", title: "Cancel" } },
                    ],
                },
            },
        };

        await axios.post(process.env.WHATSAAP_API_URL, previewPayload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        console.log(`Booking preview sent to ${senderId}`);
    } catch (error) {
        console.error("Error sending booking preview:", error.response?.data || error);
    }
};

module.exports = showBookingPreview;