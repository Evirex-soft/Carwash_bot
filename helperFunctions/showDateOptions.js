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
const showDateOptions = async function (senderId) {
    const nextSevenDays = getNextSevenDays();
    const rows = nextSevenDays.map((date) => ({
        id: `date_${date}`,
        title: date,
    }));

    await sendListItems(
        senderId,
        "Select a Date",
        "Please select a date for your appointments:",
        [{ title: "Available Dates", rows }]
    );
};

module.exports = showDateOptions;
