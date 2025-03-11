const dotenv = require("dotenv");
const mongoose = require("mongoose");
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
const askCarModel = require("../helperFunctions/askCarModel");
const carWashServices = require("../services/carWashServices");
const formatText = require("../services/formatText");

const conversation = {};

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

                // If user has subscription, show prices directly
                if (conversation[senderId]?.subscriptionID) {
                    conversation[senderId].awaitingService = true; // Skip service selection
                    await showAllServices(senderId);
                    return res.sendStatus(200);
                } else {
                    // If no subscription, ask for service selection first
                    conversation[senderId].awaitingService = true;
                    await showAllServices(senderId);
                    return res.sendStatus(200);
                }
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


        // Define service prices based on the selected package
        const servicePrices = {
            "SINGLE WASH": {
                hatchback: 550,
                sedan: 650,
                muv: 750,
                suv: 850,
                luxury: 950
            },
            "WASH WAX": {
                hatchback: 1100,
                sedan: 1200,
                muv: 1300,
                suv: 1500,
                luxury: 2000
            },
            "INTERIOR DETAILING": {
                hatchback: { normal: 1800, premium: 2500 },
                sedan: { normal: 2000, premium: 2800 },
                muv: { normal: 2500, premium: 3500 },
                suv: { normal: 3000, premium: 4000 },
                luxury: { normal: 4000, premium: 6000 }
            },
            "HARD WATER FRONT": {
                hatchback: 800,
                sedan: 900,
                muv: 1000,
                suv: 1100,
                luxury: 1200,
            },
            "HARD WATER FULL GLASS": {
                hatchback: 1500,
                sedan: 1700,
                muv: 2000,
                suv: 2500,
                luxury: 3500,
            },
            "HARD WATER FULL CAR": {
                hatchback: 3000,
                sedan: 3500,
                muv: 4500,
                suv: 5500,
                luxury: 7000,
            },
            "ENGINE DETAILING": {
                hatchback: 500,
                sedan: 600,
                muv: 700,
                suv: 900,
                luxury: 1500,
            }
        };

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


        // payment options
        if (conversation[senderId].awaitingPaymentMethod && listReply) {
            let selectedPaymentMethod = "Pay at Center"; // Default value

            if (listReply === "online") selectedPaymentMethod = "Online";
            else if (listReply === "pay_at_center")
                selectedPaymentMethod = "Pay at Center";

            conversation[senderId].paymentMethod = selectedPaymentMethod;

            const carModel = conversation[senderId]?.selectedModel ? conversation[senderId].selectedModel.toUpperCase() : "Not provided";
            const carNumber = conversation[senderId]?.carNumber ? conversation[senderId].carNumber.toUpperCase() : "Not provided";

            // Ask for confirmation
            const confirmationMessage = `📅 *Confirm Your Booking:*\n\n🕒 *Time Slot:* ${conversation[senderId].selectedTime}\n📅 *Date:* ${conversation[senderId].selectedDate}\n🚗 *Car Number:* ${carNumber}\n🚘 *Car Model:* ${carModel}\n💳 *Payment Method:* ${conversation[senderId].paymentMethod}\n🔧 *Selected Service:* ${formatText(conversation[senderId].selectedService)}\n💰 *Price:* ₹${conversation[senderId].servicePrice}`;
            const confirmationButtons = [
                {
                    type: "reply",
                    reply: { id: "confirm_booking", title: "✅ Confirm" },
                },
                { type: "reply", reply: { id: "cancel_booking", title: "❌ Cancel" } },
            ];

            await sendMessage(senderId, confirmationMessage, confirmationButtons);

            conversation[senderId].awaitingPaymentMethod = false;
            conversation[senderId].awaitingConfirmation = true;
            return res.sendStatus(200);
        }




        // Confirm appointment booking
        if (listReply === "confirm_booking") {
            console.log("User confirmed booking");
            console.log("Booking details:", conversation[senderId]);
            console.log("sender id:", senderId);

            const newBooking = new Booking({
                bookingId: new mongoose.Types.ObjectId(),
                paymentMethod: conversation[senderId]?.paymentMethod,
                preferredTimeSlot: conversation[senderId]?.selectedTime,
                preferredDate: conversation[senderId]?.selectedDate,
                carNumber: conversation[senderId]?.carNumber ? conversation[senderId].carNumber.toUpperCase() : "Not provided",
                carMakeModel: conversation[senderId]?.selectedModel ? conversation[senderId].selectedModel.toUpperCase() : "Not provided",
                phone: senderId || "Not provided",
                name: conversation[senderId]?.name || "Not provided",
                serviceType: formatText(conversation[senderId]?.selectedService),
                price: conversation[senderId]?.servicePrice || 0,
            });
            await newBooking.save();

            await sendMessage(
                senderId,
                `✅ *Booking Confirmed!*\n\n📅 Date: ${conversation[senderId].selectedDate}\n🕒 Time: ${conversation[senderId].selectedTime}\n🚗 Car Number: ${conversation[senderId].carNumber.toUpperCase()}\n🚘 Car Model: ${conversation[senderId].selectedModel.toUpperCase()}\n📞 Phone: ${senderId}\n👤 Name: ${conversation[senderId].name}\n💳 Payment Method: ${conversation[senderId].paymentMethod}\n🔧 Selected Service: ${formatText(conversation[senderId].selectedService)}\n💰 *Total Price:* ₹${conversation[senderId].servicePrice}`
            );
            delete conversation[senderId];
            return res.sendStatus(200);
        }

        // Cancel the booking appointment
        if (listReply === "cancel_booking") {
            console.log("User cancelled booking");
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
        return sendStatus(403);
    } catch (error) {
        console.error("Error verifying webhook:", error);
    }
};

module.exports = {
    incomingMessages,
    verifyWebHook,
};
