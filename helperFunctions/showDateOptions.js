const dotenv = require("dotenv");
dotenv.config();
const sendListItems = require("../helperFunctions/sendListItems");

// Generate for next 7 days
function getNextSevenDays() {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date.toISOString().split("T")[0];
    });
}

// Show Date & Time
const showDateOptions = async function (senderId, selectedService, selectedModel, priceDetails, listReply) {
    const nextSevenDays = getNextSevenDays();
    const rows = nextSevenDays.map((date) => ({
        id: `date_${date}`,
        title: date,
    }));

    const title = "📅 Select a Date";

    let bodyText = `✅ The price for *${selectedService}* on a *${selectedModel}* is ₹${priceDetails}.`;

    // 📝 Add the plan type if listReply is provided (like Normal/Premium)
    if (listReply) {
        bodyText = `✅ The price for *${selectedService}* (${listReply}) on a *${selectedModel}* is ₹${priceDetails}.`;
    }

    bodyText += `\n\nPlease select a date for your appointment:`;

    await sendListItems(
        senderId,
        title,
        bodyText,
        [{ title: "Available Dates", rows }]
    );
};

module.exports = showDateOptions;
