const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const formatText = require("../services/formatText");
const { getConversation } = require("../redis/redis");
const Package = require("../model/packageModel");

// Function to show booking preview
const showBookingPreview = async function (senderId, packageName, paymentMethod) {
    try {
        const conversationState = await getConversation(senderId);
        const userName = conversationState?.name || "Guest";
        const phoneNumber = conversationState?.phone || senderId;

        const regNumber = conversationState?.carRegistration || "Not Provided";

        const formattedPackage = formatText(packageName);
        const formattedPayment = formatText(paymentMethod);
        const packageId = packageName;

        // 🆔 Generate Subscription ID
        const packagePrefixes = {
            "package_10_washes": "RD10W",
            "package_unlimited_1_year": "RDU1Y",
            "package_unlimited_7_months": "RDU7M",
        };

        const prefix = packagePrefixes[packageId] || "RDGEN";

        // Count how many subscriptions exist already for this package
        const count = await Package.countDocuments({ selectedPackage: packageName });

        // Pad it and build ID (start from 1, so add +1)
        const paddedCount = String(count + 1).padStart(3, "0");
        const subscriptionId = `${prefix}${paddedCount}`;

        // 🗓️ Start date
        const startDate = new Date();
        const formattedStart = startDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

        // ⏳ Expiry calculation
        const packageDurations = {
            "package_10_washes": 1095,
            "package_unlimited_1_year": 365,
            "package_unlimited_7_months": 213,
        };

        const daysValid = packageDurations[packageId] || 30;
        const expiryDate = new Date(startDate.getTime() + daysValid * 24 * 60 * 60 * 1000);

        const formattedExpiry = expiryDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

        const previewText =
            `👤 Name: ${userName}
📞 Phone: ${phoneNumber}
🚗 Car Number: ${regNumber}
📦 Package: ${formattedPackage}
💳 Payment: ${formattedPayment}
📅 Start Date: ${formattedStart}
⌛ Expires On: ${formattedExpiry}
🆔 Subscription ID: ${subscriptionId}

Confirm your booking.`;

        const previewPayload = {
            messaging_product: "whatsapp",
            to: senderId,
            type: "interactive",
            interactive: {
                type: "button",
                header: { type: "text", text: "Booking Preview" },
                body: { text: previewText },
                footer: { text: "Powered by RedDot Steam Spa" },
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
