const sendMessage = require("../helperFunctions/sendMessage");
const sendBookingConfirmation = require("../helperFunctions/sendBookingConfirmation");
const { saveConversation, getConversation } = require("../redis/redis");


const razorpayWebhook = async (req, res) => {
    try {
        const event = req.body;

        if (event.event === "payment_link.paid") {
            const paymentEntity = event.payload.payment.entity;
            const senderId = event.payload.payment.entity.notes?.booking_id;
            const amountPaid = paymentEntity.amount / 100;

            // Retrieve conversation state from Redis
            const conversationState = await getConversation(senderId);
            // Check if the user is waiting for payment confirmation
            if (conversationState?.awaitingPaymentConfirmation) {
                console.log("✅ Entering the if condition - Payment confirmed!");

                // Mark payment as done
                conversationState.awaitingPaymentConfirmation = false;

                // Save updated conversation state to Redis
                await saveConversation(senderId, conversationState);

                let successMessage;

                // Notify user on WhatsApp
                if (conversationState.paymentMethod?.toLowerCase() === "online") {
                    successMessage = `✅ Payment of ₹${amountPaid} received successfully!\nYour booking is now confirmed.`;
                } else if (conversationState.paymentMethod?.toLowerCase() === "pay at center") {
                    successMessage = `✅ Advance payment of ₹${amountPaid} received successfully!\nYour booking is now confirmed.\n\n📍 Please pay the remaining amount at the center.`;
                } else {
                    successMessage = `✅ Payment received successfully!\nYour booking is confirmed.`;
                }

                await sendMessage(senderId, successMessage);

                // Proceed with booking confirmation
                await sendBookingConfirmation(senderId);
            }
        } else if (event.event === "payment.failed") {
            const senderId = event.payload.payment.entity.notes?.booking_id;

            const conversationState = await getConversation(senderId);

            if (conversationState?.awaitingPaymentConfirmation) {
                // Notify user
                const cancelMessage = `⚠️ Your payment attempt failed.\nIf you still want to proceed with the booking, please try again using the payment link.`;
                await sendMessage(senderId, cancelMessage);

                // Keep awaiting payment confirmation
                conversationState.awaitingPaymentConfirmation = true;

                // Save updated conversation state to Redis
                await saveConversation(senderId, conversationState);
            }
        };

        res.sendStatus(200);
    } catch (error) {
        console.error("Error in Razorpay webhook:", error);
        res.sendStatus(500);
    }
};

module.exports = razorpayWebhook;