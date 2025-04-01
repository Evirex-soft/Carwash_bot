const sendMessage = require("../helperFunctions/sendMessage");
const { getConversation, saveConversation } = require("../redis/redis");

// Booking confirmation function
const sendBookingConfirmation = async function (senderId) {
    // Retrieve conversation state from Redis
    const conversationState = await getConversation(senderId);

    if (!conversationState) {
        console.error(`❌ No conversation data found for senderId: ${senderId}`);
        return;
    }

    const carModel = conversationState.selectedModel ? conversationState.selectedModel.toUpperCase() : "Not provided";
    const carNumber = conversationState.carNumber ? conversationState.carNumber.toUpperCase() : "Not provided";

    let totalPrice = conversationState.servicePrice;
    let discountApplied = 0;

    // Apply 10% discount for new customer
    if (conversationState.isNewCustomer) {
        discountApplied = Math.round(totalPrice * 0.10);
        totalPrice -= discountApplied;
    }

    let priceDetails = `💰 *Total Price:* ₹${totalPrice}`;

    if (discountApplied > 0) {
        priceDetails += `\n🎉 *New Customer Discount (10%):* -₹${discountApplied}`;
    }


    if (conversationState.paymentMethod && conversationState.paymentMethod.trim().toLowerCase() === "pay at center") {
        const advancePaid = 1; // 1 rs
        const remainingAmount = totalPrice - advancePaid - discountApplied;
        priceDetails += `\n💵 *Advance Paid:* ₹${advancePaid}\n🧾 *Amount Due:* ₹${remainingAmount}`;
    };


    const confirmationMessage = `📅 *Confirm Your Booking:*\n\n` +
        `🕒 *Time Slot:* ${conversationState.selectedTime}\n` +
        `📅 *Date:* ${conversationState.selectedDate}\n` +
        `🚗 *Car Number:* ${carNumber}\n` +
        `🚘 *Car Model:* ${carModel}\n` +
        `💳 *Payment Method:* ${conversationState.paymentMethod}\n` +
        `🔧 *Selected Service:* ${conversationState.selectedService}\n` +
        priceDetails;

    const confirmationButtons = [
        {
            type: "reply",
            reply: { id: "confirm_booking", title: "✅ Confirm" },
        },
        {
            type: "reply",
            reply: { id: "cancel_booking", title: "❌ Cancel" },
        },
    ];

    await sendMessage(senderId, confirmationMessage, confirmationButtons);

    conversationState.awaitingConfirmation = true;
    conversationState.discountApplied = discountApplied;
    conversationState.finalPrice = totalPrice;

    // Save updated state back to Redis
    await saveConversation(senderId, conversationState);
};

module.exports = sendBookingConfirmation;
