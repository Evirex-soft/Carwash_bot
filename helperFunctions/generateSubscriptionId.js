const Booking = require('../model/bookingModel');

// Function to generate new Subscription ID ( RD001 )
const generateSubscriptionId = async () => {
    const latestBooking = await Booking.findOne().sort({ createdAt: -1 });

    if (!latestBooking || !latestBooking.subscriptionId) {
        return "RD001"
    }

    const lastId = latestBooking.subscriptionId;
    const numbericPart = parseInt(lastId.replace("RD", ""));
    const nextNumber = numbericPart + 1;
    const newId = "RD" + String(nextNumber).padStart(3, "0");

    return newId;
};

module.exports = generateSubscriptionId;