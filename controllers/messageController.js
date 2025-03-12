const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
dotenv.config();
const Booking = require("../model/bookingModel");
const sendMessage = require("../helperFunctions/sendMessage");
const sendListItems = require("../helperFunctions/sendListItems");
const sendLocation = require("../helperFunctions/sendLocation");
const sendServiceList = require("../helperFunctions/sendServiceList");
const sendSubServices = require("../helperFunctions/sendSubServices");
const askPackagePurchase = require("../helperFunctions/askPackagePurchase");
const askPaymentOption = require("../helperFunctions/askPaymentOption");
const showBookingPreview = require("../helperFunctions/showBookingPreview");
const confirmBooking = require("../helperFunctions/confirmBooking");
const sendWelcomeMessage = require("../helperFunctions/sendWelcomeMessage");
const showAllServices = require("../helperFunctions/showAllServices");
const handleServiceSelection = require("../helperFunctions/handleServiceSelection");
const showDateOptions = require("../helperFunctions/showDateOptions");
const { getTimeOptions, getBookedTimeSlots } = require("../helperFunctions/getTimeOptions");
const sendServiceDetails = require("../helperFunctions/sendServiceDetails");
const sendBookingConfirmation = require("../helperFunctions/sendBookingConfirmation");
const { saveConversation, getConversation } = require("../redis/redis");
const askCarModel = require("../helperFunctions/askCarModel");
const carWashServices = require("../services/carWashServices");
const formatText = require("../services/formatText");
const servicePrices = require("../services/servicePrices");

const conversation = {};

// Intialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

// Function for Incoming Messages
const incomingMessages = async (req, res) => {
    try {
        const message = req.body.entry?.[0].changes?.[0].value.messages?.[0];
        if (!message) return res.sendStatus(200);

        const senderId = message.from;
        const userName =
            req.body.entry?.[0].changes?.[0].value.contacts?.[0]?.profile?.name ||
            "User";

        conversation[senderId] = conversation[senderId] || {};

        // Handle both list reply and button reply
        const buttonId = message.interactive?.button_reply?.id;
        const listReply =
            message.interactive?.list_reply?.id ||
            message.interactive?.button_reply?.id;
        const messageText = message.text?.body.toLowerCase();

        // Handle button clicks
        if (buttonId === "visit_location") {
            await sendLocation(senderId);
            return res.sendStatus(200);
        }

        // Greetings and Welcome message
        if (messageText === "hi") {
            conversation[senderId].greeted = true;
            await sendWelcomeMessage(senderId, userName);
            return res.sendStatus(200);
        }


        // Appointment
        if (listReply === "appointment") {
            console.log("User clicked book a slot");

            await sendMessage(
                senderId,
                "📜 Do you have a subscription?",
                [
                    { type: "reply", reply: { id: "yes_subscription", title: "✅ Yes" } },
                    { type: "reply", reply: { id: "no_subscription", title: "❌ No" } }
                ]
            );
            conversation[senderId].awaitingSubscriptionResponse = true;
            return res.sendStatus(200);
        }

        // Handle Subscription Response
        if (conversation[senderId]?.awaitingSubscriptionResponse && listReply) {
            conversation[senderId].awaitingSubscriptionResponse = false;

            if (listReply === "yes_subscription") {
                conversation[senderId].awaitingSubscriptionID = true;
                await sendMessage(senderId, "🔢 Please enter your Subscription ID:");
            } else {
                // // Directly show services if no subscription
                await showAllServices(senderId);
                conversation[senderId].awaitingService = true;
            }
            return res.sendStatus(200);
        }


        const userInput = listReply || messageText || null;


        if (!userInput) return res.sendStatus(200);

        // Handle Subscription ID Input
        if (conversation[senderId]?.awaitingSubscriptionID && userInput) {
            conversation[senderId].subscriptionID = userInput;
            conversation[senderId].awaitingSubscriptionID = false;

            await askCarModel(senderId);
            conversation[senderId].awaitingModelSelection = true;
            return res.sendStatus(200);
        }


        // Handle Model Selection (For both cases: with or without subscription)
        if (conversation[senderId]?.awaitingModelSelection && listReply) {
            if (["hatchback", "sedan", "muv", "suv", "luxury"].includes(listReply)) {
                conversation[senderId].selectedModel = listReply;
                conversation[senderId].awaitingModelSelection = false;

                if (conversation[senderId]?.subscriptionID) {
                    // If user has a subscription, proceed to service selection
                    conversation[senderId].awaitingService = true;
                    await showAllServices(senderId);
                } else {
                    // If no subscription, directly show the price and date options
                    const selectedModel = conversation[senderId].selectedModel;
                    console.log("select modal in else case:", selectedModel);

                    const selectedService = conversation[senderId].selectedService;
                    console.log("selected service in else case:", selectedService);


                    if (selectedService && servicePrices[selectedService]) {
                        const priceDetails = servicePrices[selectedService][selectedModel];

                        if (selectedService === "INTERIOR DETAILING" && typeof priceDetails === "object") {
                            // If service has both normal and premium, ask for selection
                            conversation[senderId].awaitingPremiumSelection = true;
                            await sendMessage(
                                senderId,
                                "💼 Would you like a *Premium* or *Normal* package?",
                                [
                                    { type: "reply", reply: { id: "premium", title: "🌟 Premium" } },
                                    { type: "reply", reply: { id: "normal", title: "🔹 Normal" } },
                                ]
                            );
                        } else {
                            conversation[senderId].servicePrice = priceDetails;
                            await sendMessage(senderId, `✅ The price for ${selectedService} on a ${selectedModel} is ₹${priceDetails}.`);
                            conversation[senderId].awaitingDate = true;
                            await sendMessage(senderId, "📅 Please select a date for your service.");
                            await showDateOptions(senderId);
                        }
                    } else {
                        await sendMessage(senderId, "⚠️ No default service found. Please contact support.");
                    }
                }

                return res.sendStatus(200);
            } else {
                await askCarModel(senderId);
                return res.sendStatus(200);
            }
        }



        // Handle Service Selection (Only for users WITHOUT Subscription ID)
        if (!conversation[senderId]?.subscriptionID && conversation[senderId]?.awaitingService && listReply) {
            conversation[senderId].selectedService = listReply.trim().replace(/_/g, " ").toUpperCase();
            conversation[senderId].awaitingService = false;

            // Ask for car model next
            await askCarModel(senderId);
            conversation[senderId].awaitingModelSelection = true;
            return res.sendStatus(200);
        }


        // After car model selection, ask for service and show price
        if (conversation[senderId]?.awaitingService && listReply) {
            const selectedModel = conversation[senderId]?.selectedModel;
            const selectedService = listReply.trim().replace(/_/g, " ").toUpperCase();
            console.log("Received listReply:", listReply);
            console.log("Formatted selectedService:", selectedService);
            console.log("Available Services:", Object.keys(servicePrices));


            if (servicePrices[selectedService]) {
                const priceDetails = servicePrices[selectedService][selectedModel];

                if (selectedService === "INTERIOR DETAILING" && typeof priceDetails === "object") {
                    // If service has both normal and premium, ask for selection
                    conversation[senderId].awaitingPremiumSelection = true;
                    conversation[senderId].selectedService = selectedService;
                    await sendMessage(
                        senderId,
                        "💼 Would you like a *Premium* or *Normal* package?",
                        [
                            { type: "reply", reply: { id: "premium", title: "🌟 Premium" } },
                            { type: "reply", reply: { id: "normal", title: "🔹 Normal" } },
                        ]
                    );
                } else {
                    conversation[senderId].servicePrice = priceDetails;
                    // If only one price exists, show it directly
                    await sendMessage(senderId, `✅ The price for ${selectedService} on a ${selectedModel} is ₹${priceDetails}.`);
                    conversation[senderId].awaitingDate = true;
                    conversation[senderId].selectedService = selectedService;
                    await sendMessage(senderId, "📅 Please select a date for your service.");
                    await showDateOptions(senderId);
                }

                conversation[senderId].awaitingService = false;
                return res.sendStatus(200);
            } else {
                await sendMessage(senderId, "⚠️ Invalid service selection. Please select a valid service.");
                return res.sendStatus(200);
            }
        }

        // Handle premium/normal selection
        if (conversation[senderId]?.awaitingPremiumSelection && listReply) {
            const selectedModel = conversation[senderId]?.selectedModel;
            const selectedService = conversation[senderId]?.selectedService;
            const priceDetails = servicePrices[selectedService][selectedModel];

            if (listReply.toLowerCase() === "normal" || listReply.toLowerCase() === "premium") {
                const price = priceDetails[listReply.toLowerCase()];

                conversation[senderId].servicePrice = price;

                await sendMessage(senderId, `✅ The price for ${selectedService} (${listReply}) on a ${selectedModel} is ₹${price}.`);
                conversation[senderId].awaitingPremiumSelection = false;
                conversation[senderId].awaitingDate = true;
                await sendMessage(senderId, "📅 Please select a date for your service.");
                await showDateOptions(senderId);
            } else {
                conversation[senderId].awaitingPremiumSelection = false;
                conversation[senderId].awaitingDate = true;
            }

            return res.sendStatus(200);
        }

        // Going back to main menu
        if (listReply === "back_main") {
            console.log("user clicked back to main menu");
            await sendWelcomeMessage(senderId);
            delete conversation[senderId];
            return res.sendStatus(200);
        }

        // Booking Flow - date and time selection after service
        if (
            conversation[senderId]?.awaitingDate &&
            listReply?.startsWith('date_')
        ) {
            const selectedDate = listReply.replace("date_", "");
            conversation[senderId].selectedDate = selectedDate;


            // Fetch available slots for the selected date
            const slots = await getTimeOptions(selectedDate);
            await sendListItems(
                senderId,
                `Select a Time Slot`,
                `You selected ${selectedDate}. Choose a time:`,
                [{ title: "Available Slots", rows: slots }]
            );
            conversation[senderId].awaitingDate = false;
            conversation[senderId].awaitingTime = true;

            return res.sendStatus(200);
        }

        // Booking Flow - time selection
        if (
            conversation[senderId]?.awaitingTime &&
            listReply?.startsWith("slot_")
        ) {
            const selectedTime = listReply.replace("slot_", "");
            console.log("User selected a time:", selectedTime);
            conversation[senderId].selectedTime = selectedTime;

            // Check if the selected slot is already booked
            const bookedSlots = await getBookedTimeSlots(
                conversation[senderId].selectedDate
            );
            if (bookedSlots.includes(selectedTime)) {
                await sendMessage(
                    senderId,
                    "❌ This time slot is already booked. Please choose another one."
                );
                const availableSlots = await getTimeOptions(
                    conversation[senderId].selectedDate
                );
                await sendListItems(
                    senderId,
                    `Select a Time Slot`,
                    `You selected ${conversation[senderId].selectedDate}. Choose a time:`,
                    [{ title: "Available slots:", rows: availableSlots }]
                );
                return res.sendStatus(200);
            }

            // Ask for vehicle number
            await sendMessage(senderId, "🚗 Please enter your car number (e.g., KL07AB1234):");
            conversation[senderId].awaitingTime = false;
            conversation[senderId].awaitingCarNumber = true;
            return res.sendStatus(200);
        };

        // Vehicle Number Entry
        if (conversation[senderId].awaitingCarNumber && messageText) {
            conversation[senderId].carNumber = messageText;

            // Ask for payment method
            const paymentOptions = [
                { type: "reply", reply: { id: "online", title: "💳 Online Payment" } },
                { type: "reply", reply: { id: "pay_at_center", title: "🏢 Pay at Center" } },
            ];
            await sendMessage(senderId, "💰 How would you like to pay?", paymentOptions);

            conversation[senderId].awaitingCarNumber = false;
            conversation[senderId].awaitingPaymentMethod = true;
            return res.sendStatus(200);
        }



        if (conversation[senderId].awaitingPaymentMethod && listReply) {
            let selectedPaymentMethod;

            if (listReply === "online") {
                selectedPaymentMethod = "Online";
            } else if (listReply === "pay_at_center") {
                selectedPaymentMethod = "Pay at Center";
            }

            conversation[senderId].paymentMethod = selectedPaymentMethod;
            console.log("payment method:", selectedPaymentMethod);

            // Mark awaitingPaymentMethod as false before saving to Redis
            conversation[senderId].awaitingPaymentMethod = false;

            if (selectedPaymentMethod === "Pay at Center") {
                // Create a payment link
                const paymentLinkData = {
                    amount: 100, // amount in paise
                    currency: "INR",
                    description: "Advance Payment for Service Booking",
                    customer: {
                        name: conversation[senderId].name || "Customer",
                        contact: senderId,
                    },
                    notify: { sms: false, email: false },
                    reminder_enable: true,
                    expire_by: Math.floor(Date.now() / 1000) + 3600, // expires in 1 hour
                    notes: { booking_id: senderId },
                };

                try {
                    const paymentLink = await razorpay.paymentLink.create(paymentLinkData);
                    const paymentUrl = paymentLink.short_url;

                    // Send payment link to user
                    const paymentMessage = `💳 *Advance Payment Required*\n\nPlease pay ₹1 in advance to confirm your booking.\n\n🔗 [Click here to Pay](${paymentUrl})`;
                    await sendMessage(senderId, paymentMessage);

                    conversation[senderId].awaitingPaymentConfirmation = true;
                } catch (error) {
                    console.error("Error creating payment link:", error);
                    await sendMessage(senderId, "⚠️ Payment link generation failed. Please try again.");
                }

                await saveConversation(senderId, conversation[senderId]);
                return res.sendStatus(200);
            }

            // If "Online" is selected, proceed to booking confirmation
            await saveConversation(senderId, conversation[senderId]);
            await sendBookingConfirmation(senderId);
            res.sendStatus(200);
        }




        const conversationState = await getConversation(senderId);

        if (conversationState.paymentMethod && conversationState.paymentMethod.trim().toLowerCase() === "pay at center") {
            advancePaid = 1; // 1 rs
            remainingAmount = conversationState.servicePrice - advancePaid;
        } else {
            advancePaid = 0;
            remainingAmount = conversationState.servicePrice;

        }

        console.log("Received listReply:", listReply);
        console.log("Current Conversation awaiting  State:", conversationState.awaitingConfirmation);

        // Confirm appointment booking
        if (listReply === "confirm_booking" && conversationState?.awaitingConfirmation) {
            console.log("User confirmed booking");

            // Reset awaiting confirmation so it doesn't loop
            conversationState.awaitingConfirmation = false;
            await saveConversation(senderId, conversationState);

            const newBooking = new Booking({
                bookingId: new mongoose.Types.ObjectId(),
                paymentMethod: conversationState?.paymentMethod,
                preferredTimeSlot: conversationState?.selectedTime,
                preferredDate: conversationState?.selectedDate,
                carNumber: conversationState?.carNumber ? conversationState.carNumber.toUpperCase() : "Not provided",
                carMakeModel: conversationState?.selectedModel ? conversationState.selectedModel.toUpperCase() : "Not provided",
                phone: senderId || "Not provided",
                name: conversationState?.name || "Not provided",
                serviceType: formatText(conversationState?.selectedService),
                price: conversationState.paymentMethod.trim().toLowerCase() === "pay at center"
                    ? remainingAmount
                    : conversationState.servicePrice,
            });
            await newBooking.save();

            await sendMessage(
                senderId,
                `✅ *Booking Confirmed!*\n\n` +
                `👤 *Name:* ${userName}\n` +
                `📞 *Phone:* ${senderId}\n` +
                `📅 *Date:* ${conversationState.selectedDate}\n` +
                `🕒 *Time:* ${conversationState.selectedTime}\n` +
                `🔧 *Selected Service:* ${formatText(conversationState.selectedService)}\n` +
                `🚗 *Car Number:* ${conversationState.carNumber.toUpperCase()}\n` +
                `🚘 *Car Model:* ${conversationState.selectedModel.toUpperCase()}\n` +
                `💳 *Payment Method:* ${conversationState.paymentMethod}\n` +
                `💰 *Total Price:* ₹${conversationState.servicePrice}\n` +
                (conversationState.paymentMethod.trim().toLowerCase() === "pay at center"
                    ? `💵 *Advance Paid:* ₹${advancePaid}\n🧾 *Amount Due:* ₹${remainingAmount}\n`
                    : "")
            );
            // Also delete from Redis if not needed anymore
            await saveConversation(senderId, {});

            return res.sendStatus(200);
        }

        // Cancel the booking appointment
        if (listReply === "cancel_booking") {
            console.log("User cancelled booking");
            // Ensure awaitingConfirmation is reset
            conversationState.awaitingConfirmation = false;

            // Save the updated conversation
            await saveConversation(senderId, {});

            await sendMessage(
                senderId,
                "Appointment cancelled. Type 'hi' to start over."
            );
            delete conversation[senderId];
            return res.sendStatus(200);
        }

        // view services
        if (message.interactive) {
            const buttonId = message.interactive?.button_reply?.id;
            const listId = message.interactive?.list_reply?.id;

            console.log("list id:", listId);


            if (buttonId === "view_services") {
                await sendServiceList(senderId);
            } else if (listId) {
                console.log("Processing listId:", listId);

                const subServiceList = [
                    "single_wash",
                    "wash_wax",
                    "hard_water_front",
                    "hard_water_full_glass",
                    "hard_water_full_car",
                    "engine_detailing",
                    "interior_detailing",
                    "special_packages"
                ];

                const packageList = [
                    "package_10_washes",
                    "package_unlimited_1_year",
                    "package_unlimited_7_months"
                ];

                if (subServiceList.includes(listId)) {
                    console.log("Fetching sub-services for:", listId);
                    await sendSubServices(senderId, listId);
                } else if (packageList.includes(listId)) {
                    console.log("User selected a package, initiating purchase flow...");
                    selectedPackage = listId;
                    await sendServiceDetails(senderId, listId);
                    await askPackagePurchase(senderId, listId);
                } else {
                    console.log("Checking if listId exists in carWashServices:", listId, carWashServices[listId]);

                    if (carWashServices[listId]) {
                        console.log("Fetching service details for:", listId);
                        await sendServiceDetails(senderId, listId);
                    } else {
                        console.log("No service details found for:", listId);
                    }
                }
            }

            if (buttonId === "purchase_yes") {
                await askPaymentOption(senderId);
            } else if (buttonId === "purchase_no") {
                await sendMessage(senderId, "No problem! Let us know if you need anything else. 😊");
            } else if (buttonId === "payment_online" || buttonId === "payment_center") {
                console.log("Selected Payment Method:", buttonId);
                console.log("Selected Package:", selectedPackage);

                if (!selectedPackage) {
                    console.error("Error: No package selected before payment.");
                    await sendMessage(senderId, "Please select a package first before choosing a payment method.");
                    return;
                }

                await showBookingPreview(senderId, selectedPackage, buttonId);
            } else if (buttonId === "confirm_booking1") {
                await confirmBooking(senderId);
            } else if (buttonId === "cancel_booking1") {
                await sendMessage(senderId, "Booking has been cancelled. Let us know if you need assistance!");
            }

        }
        res.sendStatus(200);
    } catch (error) {
        console.error("Error in incoming message function:", error);
    }
};

// Verify webhook function
const verifyWebHook = async (req, res) => {
    try {
        const verifyToken = process.env.VERIFY_TOKEN;
        if (
            req.query["hub.mode"] === "subscribe" &&
            req.query["hub.verify_token"] === verifyToken
        ) {
            return res.status(200).send(req.query["hub.challenge"]);
        }
        console.log("Webhook verified");
        return sendStatus(303);
    } catch (error) {
        console.error("Error verifying webhook:", error);
    }
};

module.exports = {
    incomingMessages,
    verifyWebHook,
};
