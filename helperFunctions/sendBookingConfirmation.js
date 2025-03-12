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

    let priceDetails = `💰 *Total Price:* ₹${conversationState.servicePrice}`;


    if (conversationState.paymentMethod && conversationState.paymentMethod.trim().toLowerCase() === "pay at center") {
        const advancePaid = 1; // 1 rs
        const remainingAmount = conversationState.servicePrice - advancePaid;
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

    // Save updated state back to Redis
    await saveConversation(senderId, conversationState);
};

module.exports = sendBookingConfirmation;
