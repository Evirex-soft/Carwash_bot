const dotenv = require("dotenv");
dotenv.config();
const Booking = require("../model/bookingModel");

// Get Booked Slots for a Date
const getBookedTimeSlots = async function (date) {
    const bookings = await Booking.find({ preferredDate: new Date(date) });

    console.log("Bookings found for date:", date, bookings);

    return bookings.map((b) => b.preferredTimeSlot);
}


// Generate Time Slots with booked status
const getTimeOptions = async function (date) {
    const bookedSlots = await getBookedTimeSlots(date);
    const startTime = 10 * 60; // 10:00 AM
    const endTime = 20 * 60; // 8:00 PM
    const interval = 45;

    const timeSlots = [];
    for (let time = startTime; time < endTime; time += interval) {
        const hours = Math.floor(time / 60);
        const minutes = time % 60;
        const formattedTime = `${hours}:${minutes === 0 ? "00" : minutes}`;

        timeSlots.push({
            id: `slot_${formattedTime}`,
            title: bookedSlots.includes(formattedTime) ? `❌ ${formattedTime} (Booked)` : formattedTime,
        });

    }
    // Limit slots to a maximum of 10 items
    return timeSlots.slice(0, 10);
};

module.exports = {
    getTimeOptions,
    getBookedTimeSlots,
}
