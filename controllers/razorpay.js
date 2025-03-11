const sendMessage = require("../helperFunctions/sendMessage");
const sendBookingConfirmation = require("../helperFunctions/sendBookingConfirmation");
const { saveConversation, getConversation } = require("../redis/redis");


const razorpayWebhook = async (req, res) => {
    try {
        const event = req.body;

        if (event.event === "payment_link.paid") {
            const paymentId = event.payload.payment.entity.id;
            const senderId = event.payload.payment.entity.notes?.booking_id;

            // Retrieve conversation state from Redis
            const conversationState = await getConversation(senderId);
            console.log("Conversation state from razorpay:", conversationState);


            // Check if the user is waiting for payment confirmation
            if (conversationState?.awaitingPaymentConfirmation) {
                console.log("✅ Entering the if condition - Payment confirmed!");

                // Mark payment as done
                conversationState.awaitingPaymentConfirmation = false;

                // Save updated conversation state to Redis
                await saveConversation(senderId, conversationState);

                // Notify user on WhatsApp
                const successMessage = `✅ Payment of ₹300 received successfully!\nYour booking is now confirmed.`;
                await sendMessage(senderId, successMessage);

                // Proceed with booking confirmation
                await sendBookingConfirmation(senderId);
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error("Error in Razorpay webhook:", error);
        res.sendStatus(500);
    }
};

module.exports = razorpayWebhook;