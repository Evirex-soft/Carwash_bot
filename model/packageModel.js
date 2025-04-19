const mongoose = require('mongoose');


const packageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    carNumber: { type: String, required: true },
    selectedPackage: { type: String, },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    price: { type: Number, required: true },
    paymentMethod: { type: String, required: true, enum: ["Online"] },
    paymentStatus: { type: String, default: "Paid", enum: ["Pending", "Paid", "Failed"] },
    subscriptionId: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now },

});

module.exports = mongoose.model('Package', packageSchema);