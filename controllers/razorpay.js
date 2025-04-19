const sendMessage = require("../helperFunctions/sendMessage");
const sendBookingConfirmation = require("../helperFunctions/sendBookingConfirmation");
const showBookingPreview = require('../helperFunctions/showBookingPreview');
const { saveConversation, getConversation } = require("../redis/redis");

const razorpayWebhook = async (req, res) => {
    try {
        const event = req.body;

        if (event.event === "payment_link.paid") {
            const paymentEntity = event.payload.payment.entity;
            const senderId = paymentEntity.notes?.booking_id;
            const amountPaid = paymentEntity.amount / 100;

            const conversationState = await getConversation(senderId);

            // 1️⃣ Booking flow
            if (conversationState?.awaitingPaymentConfirmation) {
                console.log("✅ Booking Payment confirmed");

                conversationState.awaitingPaymentConfirmation = false;
                await saveConversation(senderId, conversationState);

                let successMessage;

                if (conversationState.paymentMethod?.toLowerCase() === "online") {
                    successMessage = `✅ Payment of ₹${amountPaid} received successfully!\nYour booking is now confirmed.`;
                } else {
                    successMessage = `✅ Payment received successfully!\nYour booking is confirmed.`;
                }

                await sendMessage(senderId, successMessage);
                await sendBookingConfirmation(senderId);
            }

            // 2️⃣ Package purchase flow
            else if (conversationState?.awaitingPaymentConfirmationPackage) {
                console.log("✅ Package Payment confirmed");

                conversationState.awaitingPaymentConfirmationPackage = false;
                await saveConversation(senderId, conversationState);

                await sendMessage(senderId, `✅ Payment of ₹${amountPaid} received successfully!\nYou have successfully purchased the package.`);

                const selectedPackage = conversationState.selectedPackage;
                await showBookingPreview(senderId, selectedPackage, "payment_online");
            }
        }

        else if (event.event === "payment.failed") {
            const senderId = event.payload.payment.entity.notes?.booking_id;
            const conversationState = await getConversation(senderId);

            if (conversationState?.awaitingPaymentConfirmation || conversationState?.awaitingPaymentConfirmationPackage) {
                await sendMessage(senderId, `⚠️ Your payment attempt failed.\nIf you still want to proceed, please try again using the payment link.`);
                await saveConversation(senderId, conversationState);
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error("❌ Error in Razorpay webhook:", error);
        res.sendStatus(500);
    }
};

module.exports = razorpayWebhook;