const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    carMakeModel: { type: String, required: true },
    carNumber: { type: String, required: true },
    serviceType: { type: String, },
    addOnServices: [{ type: String }],
    preferredDate: { type: Date, required: true },
    preferredTimeSlot: { type: String, required: true },
    price: { type: Number, required: true },
    paymentMethod: { type: String, required: true, enum: ["Online", "Pay at Center"] },
    paymentStatus: { type: String, default: "Pending", enum: ["Pending", "Paid", "Failed"] },
    bookingId: { type: String, unique: true },
    bookingStatus: { type: String, default: "Confirmed", enum: ["Confirmed", "Cancelled", "Completed"] },
    createdAt: { type: Date, default: Date.now },

});

module.exports = mongoose.model('Booking', bookingSchema);