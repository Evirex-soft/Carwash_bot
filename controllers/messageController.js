const axios = require("axios");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();
const Booking = require("../model/bookingModel");

const conversation = {};

// Send Messages Function
async function sendMessage(senderId, text, options = []) {
    try {
        const payload = {
            messaging_product: "WHATSAPP",
            to: senderId,
            type: "text",
            text: { body: text },
        };

        // If buttons are valid
        if (options.length > 0 && options.length <= 3 && options[0].type === "reply") {
            payload.type = "interactive";
            payload.interactive = {
                type: "button",
                body: { text },
                action: { buttons: options },
            };
        }
        // Handle list type (more than 3 options)
        else if (options.length > 0) {
            payload.type = "interactive";
            payload.interactive = {
                type: "list",
                body: { text },
                action: {
                    button: "Select an option",
                    sections: [{
                        title: "Available Options",
                        rows: options.map(option => ({
                            id: option.reply.id,
                            title: option.reply.title
                        }))
                    }]
                }
            };
        }

        await axios.post(process.env.WHATSAAP_API_URL, payload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Error sending message:", error.response?.data || error);
    }
}

// Send Lists Function
async function sendListItems(senderId, headerText, bodyText, sections) {
    try {
        // shorten the titles
        sections.forEach((section) => {
            section.rows.forEach((row) => {
                if (row.title.length > 24) {
                    row.title = row.title.substring(0, 24);
                }
            });
        });

        await axios.post(
            process.env.WHATSAAP_API_URL,
            {
                messaging_product: "WHATSAPP",
                to: senderId,
                type: "interactive",
                interactive: {
                    type: "list",
                    header: { type: "text", text: headerText },
                    body: { text: bodyText },
                    action: {
                        button: "Select",
                        sections: sections,
                    },
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (error) {
        console.error(
            "Error sending list messages:",
            error.response?.data || error
        );
    }
}

// Visit Website
async function sendLocation(senderId) {
    try {
        const payload = {
            messaging_product: "WHATSAPP",
            to: senderId,
            type: "location",
            location: {
                latitude: "11.258591",
                longitude: "75.785338",
                name: "Red Dot Steam Spa",
                address: "Red Dot Steam Spa, Kozhikode, Kerala, India",
            },
        };

        await axios.post(process.env.WHATSAAP_API_URL, payload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
        console.log(`Location sent to ${senderId}`);
    } catch (error) {
        console.error("Error sending location:", error.response?.data || error);
    }
}

// View Services Function
async function sendServiceList(senderId) {
    try {
        const payload = {
            messaging_product: "whatsapp",
            to: senderId,
            type: "interactive",
            interactive: {
                type: "list",
                header: {
                    type: "text",
                    text: "🚗 Our Car Wash Services",
                },
                body: {
                    text: "🌟 Choose a service to get started! 🚘",
                },
                footer: { text: "🔹Powered by Red Dot Steam Spa" },
                action: {
                    button: "View Services",
                    sections: [
                        {
                            title: "Categories",
                            rows: [
                                { id: "single_wash", title: "🚿 Single Wash" },
                                { id: "wash_wax", title: "🛁 Wash + Wax" },
                                { id: "hard_water_front", title: "💧 Front Glass Cleaning" },
                                {
                                    id: "hard_water_full_glass",
                                    title: "🪟 Full Glass Cleaning",
                                },
                                { id: "hard_water_full_car", title: "🚘 Full Car Cleaning" },
                                { id: "engine_detailing", title: "🔧 Engine Detailing" },
                                { id: "interior_detailing", title: "🛋️ Interior Detailing" },
                                { id: "special_packages", title: "✨ Special Packages" },
                            ],
                        },
                    ],
                },
            },
        };

        await axios.post(process.env.WHATSAAP_API_URL, payload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
        console.log(`Service list sent to ${senderId}`);
    } catch (error) {
        console.error("Error sending service list:", error.response?.data || error);
    }
}

// Send Sub Services Function
async function sendSubServices(senderId, categoryId) {
    const services = {
        single_wash: [
            { id: "exterior_wash", title: "🚿 Exterior Wash" },
            { id: "interior_vacuum", title: "🧹 Vacuum Cleaning" },
            { id: "dashboard_wipe", title: "🧼 Dashboard Wiping" },
            { id: "premium_polish", title: "✨ Premium Polish" },
            { id: "tyre_polish", title: "🛞 Tyre Polish" },
            { id: "fiber_polish", title: "🖤 Fiber Polish" },
        ],
        wash_wax: { id: "wash_wax_", title: "🛁 Wash & Wax" },
        hard_water_front: { id: "hard_water_front_", title: "💧 Hard Water - Front" },
        hard_water_full_glass: { id: "hard_water_full_glass_", title: "🪟 Hard Water - Full" },
        hard_water_full_car: { id: "hard_water_full_car_", title: "🚘 Hard Water - Car" },
        engine_detailing: { id: "engine_detailing_", title: "🔧 Engine Detail" },
        interior_detailing: [
            { id: "interior_detailing_normal", title: "🛋️ Interior Normal" },
            { id: "interior_detailing_premium", title: "🛋️ Interior Premium" },
        ],
        special_packages: [
            { id: "package_10_washes", title: "🛠️ 10 Washes (3Y) - ₹3333" },
            { id: "package_unlimited_1_year", title: "♾️ 1Y Unlimited - ₹9999" },
            { id: "package_unlimited_7_months", title: "📅 7M Unlimited - ₹6999" },
        ],
    };

    let subServices = services[categoryId];

    console.log(" subservices......:", subServices);


    // Log the categoryId and subServices to debug
    console.log(`Category: ${categoryId}`, subServices);

    if (!subServices) {
        console.error(`Invalid categoryId: ${categoryId}`);
        return;
    }

    if (!Array.isArray(subServices)) {
        subServices = [subServices];
    }

    try {
        if (!Array.isArray(subServices)) {
            // ✅ Directly send a text message for single-service categories
            const directPayload = {
                messaging_product: "whatsapp",
                to: senderId,
                type: "text",
                text: { body: `🔹 ${subServices.title}\n\nFor more details, contact us.` },
            };

            await axios.post(process.env.WHATSAAP_API_URL, directPayload, {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            });

            console.log(`Single service '${subServices.title}' sent to ${senderId}`);
            return;
        }

        const payload = {
            messaging_product: "whatsapp",
            to: senderId,
            type: "interactive",
            interactive: {
                type: "list",
                header: { type: "text", text: "Select a Service" },
                body: { text: "✨ Choose a service to view details." },
                footer: { text: "Powered by Red Dot Steam Spa" },
                action: {
                    button: "Select Service",
                    sections: [
                        {
                            title: "Services",
                            rows: subServices.map((service) => ({
                                id: service.id,
                                title: service.title,
                            })),
                        },
                    ],
                },
            },
        };

        await axios.post(process.env.WHATSAAP_API_URL, payload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        console.log(`Sub services sent to ${senderId}`);
    } catch (error) {
        console.error("Error sending sub services:", error.response?.data || error);
    }
}

async function askPackagePurchase(senderId, packageId) {
    try {
        const payload = {
            messaging_product: "whatsapp",
            to: senderId,
            type: "interactive",
            interactive: {
                type: "button",
                header: { type: "text", text: "🎁 Package Purchase" },
                body: { text: "Do you want to purchase this package?" },
                footer: { text: "Powered by Red Dot Steam Spa" },
                action: {
                    buttons: [
                        { type: "reply", reply: { id: "purchase_yes", title: "✅ Yes" } },
                        { type: "reply", reply: { id: "purchase_no", title: "❌ No" } }
                    ]
                }
            }
        };

        await axios.post(process.env.WHATSAAP_API_URL, payload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        console.log(`Asked ${senderId} for package purchase confirmation`);
    } catch (error) {
        console.error("Error asking package purchase:", error.response?.data || error);
    }
}


// Function to handle payment options
async function askPaymentOption(senderId) {
    try {
        const payload = {
            messaging_product: "whatsapp",
            to: senderId,
            type: "interactive",
            interactive: {
                type: "button",
                header: { type: "text", text: "💳 Payment Option" },
                body: { text: "How would you like to pay?" },
                footer: { text: "Select a payment method" },
                action: {
                    buttons: [
                        { type: "reply", reply: { id: "payment_online", title: "🌐 Online" } },
                        { type: "reply", reply: { id: "payment_center", title: "🏢 Pay at Center" } }
                    ]
                }
            }
        };

        await axios.post(process.env.WHATSAAP_API_URL, payload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        console.log(`Asked ${senderId} for payment option`);
    } catch (error) {
        console.error("Error asking payment option:", error.response?.data || error);
    }
}

// Function to show booking preview
async function showBookingPreview(senderId, packageName, paymentMethod) {
    try {

        const formattedPackage = formatText(packageName);
        const formattedPayment = formatText(paymentMethod);

        const previewPayload = {
            messaging_product: "whatsapp",
            to: senderId,
            type: "interactive",
            interactive: {
                type: "button",
                header: { type: "text", text: "Booking Preview" },
                body: {
                    text: `📦 Package: ${formattedPackage}\n💳 Payment: ${formattedPayment}\n\nConfirm your booking.`,
                },
                footer: { text: "Powered by Red Dot Steam Spa" },
                action: {
                    buttons: [
                        { type: "reply", reply: { id: "confirm_booking1", title: "Confirm" } },
                        { type: "reply", reply: { id: "cancel_booking1", title: "Cancel" } },
                    ],
                },
            },
        };

        await axios.post(process.env.WHATSAAP_API_URL, previewPayload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        console.log(`Booking preview sent to ${senderId}`);
    } catch (error) {
        console.error("Error sending booking preview:", error.response?.data || error);
    }
}

// Function to confirm booking
async function confirmBooking(senderId) {
    try {
        const confirmationPayload = {
            messaging_product: "whatsapp",
            to: senderId,
            type: "text",
            text: { body: "✅ Booking Confirmed! Thank you for choosing Red Dot Steam Spa." },
        };

        await axios.post(process.env.WHATSAAP_API_URL, confirmationPayload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        console.log(`Booking confirmed for ${senderId}`);
    } catch (error) {
        console.error("Error confirming booking:", error.response?.data || error);
    }
}

const carWashServices = {
    exterior_wash: {
        id: "exterior_wash",
        title: "🚿 Exterior Wash",
        price: {
            HATCHBACK: "₹550",
            SEDAN: "₹650",
            MUV: "₹650",
            SUV: "₹750",
            LUXURY: "₹750",
        },
        description: "Thorough exterior cleaning to remove dust, dirt, and grime, leaving your car spotless and shining.",
    },
    interior_vacuum: {
        id: "interior_vacuum",
        title: "🧹 Vacuum Cleaning",
        price: {
            HATCHBACK: "₹550",
            SEDAN: "₹650",
            MUV: "₹650",
            SUV: "₹750",
            LUXURY: "₹750",
        },
        description: "Deep vacuuming of seats, carpets, and corners to eliminate dust, crumbs, and debris for a fresh interior.",
    },
    dashboard_wipe: {
        id: "dashboard_wipe",
        title: "🧼 Dashboard Wipe",
        price: {
            HATCHBACK: "₹550",
            SEDAN: "₹650",
            MUV: "₹650",
            SUV: "₹750",
            LUXURY: "₹750",
        },
        description: "Gentle cleaning of the dashboard to remove dust and stains while maintaining a polished look.",
    },
    premium_polish: {
        id: "premium_polish",
        title: "✨ Polish",
        price: {
            HATCHBACK: "₹550",
            SEDAN: "₹650",
            MUV: "₹650",
            SUV: "₹750",
            LUXURY: "₹750",
        },
        description: "High-quality polish applied to restore shine and protect the vehicle’s paint from minor scratches and oxidation.",
    },
    tyre_polish: {
        id: "tyre_polish",
        title: "🛞 Tyre Polish",
        price: {
            HATCHBACK: "₹550",
            SEDAN: "₹650",
            MUV: "₹650",
            SUV: "₹750",
            LUXURY: "₹750",
        },
        description: "Professional tyre cleaning and polishing to enhance appearance and maintain durability.",
    },
    fiber_polish: {
        id: "fiber_polish",
        title: "🖤 Fiber Polish",
        price: {
            HATCHBACK: "₹550",
            SEDAN: "₹650",
            MUV: "₹650",
            SUV: "₹750",
            LUXURY: "₹750",
        },
        description: "Special care for fiber parts with polishing to retain their shine and prevent fading over time.",
    },
    wash_wax_: {
        id: "wash_wax",
        title: "🛁 Basic Wash & Wax",
        price: {
            HATCHBACK: "₹1100",
            SEDAN: "₹1200",
            MUV: "₹1300",
            SUV: "₹1500",
            LUXURY: "₹2000",
        },
        description: "A basic wash with waxing to maintain a protective layer and give your car a smooth finish.",
    },
    hard_water_front_: {
        id: "hard_water_front",
        title: "💧 Hard Water Removal - Front Glass",
        price: {
            HATCHBACK: "₹800",
            SEDAN: "₹900",
            MUV: "₹1000",
            SUV: "₹1100",
            LUXURY: "₹1200",
        },
        description: "Basic cleaning treatment to remove hard water stains and enhance visibility.",
    },
    hard_water_full_glass_: {
        id: "hard_water_full_glass",
        title: "🪟 Hard Water Removal - Full Glass",
        price: {
            HATCHBACK: "₹1500",
            SEDAN: "₹1700",
            MUV: "₹2000",
            SUV: "₹2500",
            LUXURY: "₹3500",
        },
        description: "Basic cleaning of all car windows to remove stains and enhance clarity.",
    },
    hard_water_full_car_: {
        id: "hard_water_full_car",
        title: "🚘 Hard Water Removal - Full Car",
        price: {
            HATCHBACK: "₹3000",
            SEDAN: "₹3500",
            MUV: "₹4500",
            SUV: "₹5500",
            LUXURY: "₹7000",
        },
        description: "Basic hard water stain removal treatment for the entire vehicle surface.",
    },
    engine_detailing_: {
        id: "engine_detailing",
        title: "🔧 Engine Detailing",
        price: {
            HATCHBACK: "₹500",
            SEDAN: "₹600",
            MUV: "₹700",
            SUV: "₹900",
            LUXURY: "₹1500",
        },
        description: "Deep cleaning of the engine bay to remove grease, oil, and dirt for better performance and longevity.",
    },
    interior_detailing_normal: {
        id: "interior_detailing_normal",
        title: "🛋️ Interior Detailing - Normal",
        price: {
            HATCHBACK: "₹1800",
            SEDAN: "₹2000",
            MUV: "₹2500",
            SUV: "₹3000",
            LUXURY: "₹4000",
        },
        description: "Comprehensive interior cleaning including vacuuming, dashboard wipe, and seat cleaning.",
    },
    interior_detailing_premium: {
        id: "interior_detailing_premium",
        title: "🛋️ Interior Detailing - Premium",
        price: {
            HATCHBACK: "₹2500",
            SEDAN: "₹2800",
            MUV: "₹3500",
            SUV: "₹4000",
            LUXURY: "₹6000",
        },
        description: "Includes deep cleaning, shampooing, leather conditioning, and antibacterial treatment for a premium finish.",
    },
    package_10_washes: {
        id: "package_10_washes",
        title: "🛠️ 10 Washes - 1095 Days Validity",
        price: "₹3333",
        description: "Get 10 professional car washes valid for 1095 days (3 years)."
    },
    package_unlimited_1_year: {
        id: "package_unlimited_1_year",
        title: "♾️ Unlimited Car Wash - 1 Year Validity",
        price: "₹9999",
        description: "Enjoy unlimited car washes for a full year."
    },
    package_unlimited_7_months: {
        id: "package_unlimited_7_months",
        title: "📅 Unlimited Car Wash - 7 Months Validity",
        price: "₹6999",
        description: "Unlimited car washes for 7 months."
    }



};

// Send Service Details Function
async function sendServiceDetails(senderId, serviceId) {
    const details = carWashServices[serviceId];
    console.log("details:", details);


    if (!details) {
        console.error(`Service details not found for serviceId: ${serviceId}`);
        return;
    }

    // Check if price is an object (multiple models) or a single value
    let priceText;
    if (typeof details.price === "object") {
        // Multiple prices (for different car models)
        priceText = Object.entries(details.price)
            .map(([type, price]) => `• ${type}: ${price}`)
            .join("\n");
    } else {
        // Single price
        priceText = details.price;
    }

    try {
        const payload = {
            messaging_product: "WHATSAPP",
            to: senderId,
            type: "text",
            text: {
                body: `✨ *${details.title}*\n💵 Price: ${priceText}\n📝 Description: ${details.description}`,
            },
        };

        await axios.post(process.env.WHATSAAP_API_URL, payload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
        console.log(`Service details sent to ${senderId}`);
    } catch (error) {
        console.error(
            "Error sending service details:",
            error.response?.data || error
        );
    }
}

// Welcome Message Function
async function sendWelcomeMessage(senderId, userName) {
    try {
        // Store the user's name in the conversation object
        conversation[senderId] = conversation[senderId] || {};
        conversation[senderId].name = userName;

        const payload = {
            messaging_product: "WHATSAPP",
            to: senderId,
            type: "interactive",
            interactive: {
                type: "button",
                header: {
                    type: "image",
                    image: {
                        link: "https://images.unsplash.com/photo-1608506375591-b90e1f955e4b?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    },
                },
                body: {
                    text: `HI ${userName},
                    Explore our premium services and book your appointment today!`,
                },
                footer: { text: "Powered by Red Dot Steam Spa" },
                action: {
                    buttons: [
                        {
                            type: "reply",
                            reply: { id: "appointment", title: "📅 Book a Slot" },
                        },
                        {
                            type: "reply",
                            reply: { id: "view_services", title: "🛍️ View Services" },
                        },
                        {
                            type: "reply",
                            reply: { id: "visit_location", title: "🌐 Visit Our Location" },
                        },
                    ],
                },
            },
        };

        await axios.post(process.env.WHATSAAP_API_URL, payload, {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
        console.log(`Welcome message sent to ${userName}`);
    } catch (error) {
        console.error(
            "Error sending welcome message:",
            error.response?.data || error
        );
    }
}

// Show All Services
async function showAllServices(senderId) {
    const headerText = "✨Our Premium Services ✨";
    const bodyText = "🌟 Tap on a category to explore services!";
    const sections = [
        {
            title: "Categories",
            rows: [
                { id: "single_wash", title: "🚿 SINGLE WASH" },
                { id: "wash_wax", title: "🛁✨ WASH + WAX" },
                { id: "hard_water_front", title: "💧🚘 HARD WATER - FRONT GLASS" },
                { id: "hard_water_full_glass", title: "💦🪟 HARD WATER - FULL GLASS" },
                { id: "hard_water_full_car", title: "🚘💠 HARD WATER - FULL CAR" },
                { id: "engine_detailing", title: "🔧🔥 ENGINE DETAILING" },
                { id: "interior_detailing", title: "🛋️🌿 INTERIOR DETAILING" },
                // { id: "special_packages", title: "🎁✨ SPECIAL PACKAGES" },
            ],
        },
    ];
    await sendListItems(senderId, headerText, bodyText, sections);
}

// handle Service Selection
async function handleServiceSelection(senderId, serviceId) {

    const serviceData = {
        single_wash: [
            { id: "exterior_wash", title: "🚿 Exterior Wash" },
            { id: "interior_vacuum", title: "🧹 Interior Vacuum" },
            {
                id: "dashboard_door_wiping",
                title: "🧼 Dashboard & Door Panel Wiping",
            },
            { id: "premium_polishing", title: "✨ Premium Polishing" },
            { id: "tyre_polishing", title: "🛞 Tyre Polishing" },
            { id: "fiber_parts_polishing", title: "🖤 Fiber Parts Polishing" },
        ],
    };

    // If passed serviceId is a main category, show its services in a list
    if (serviceData[serviceId]) {
        const rows = serviceData[serviceId].map((s) => ({
            id: s.id,
            title: s.title,
            description: s.price,
        }));
        conversation[senderId].selectedCategory = serviceId;
        const headerText =
            "🌟 Select from our premium range of services designed just for you!";
        const sections = [{ title: "Services", rows }];
        await sendListItems(senderId, headerText, bodyText, sections);
    } else {
        Object.keys(serviceData).forEach((category) => {
            serviceData[category].forEach((s) => {
                if (s.id === serviceId) {
                    conversation[senderId].selectedService = s;
                }
            });
        });
        conversation[senderId].awaitingDate = true;
        await showDateOptions(senderId);
    }
}

// Show Date & Time
async function showDateOptions(senderId) {
    const nextSevenDays = getNextSevenDays();
    const rows = nextSevenDays.map((date) => ({
        id: `date_${date}`,
        title: date,
    }));

    await sendListItems(
        senderId,
        "Select a Date",
        "Please select a date for your appointments:",
        [{ title: "Available Dates", rows }]
    );
}

// Get Booked Slots for a Date
async function getBookedTimeSlots(date) {
    const bookings = await Booking.find({ preferredDate: new Date(date) });

    console.log("Bookings found for date:", date, bookings);

    return bookings.map((b) => b.preferredTimeSlot);
}

// Generate for next 7 days
function getNextSevenDays() {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date.toISOString().split("T")[0];
    });
}

// Generate Time Slots with booked status
async function getTimeOptions(date) {
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
}

// Changing to  UpperCase
const formatText = (text) => {
    if (!text) return "";
    return text
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
};

// Car modal
async function askCarModel(senderId) {
    await sendMessage(
        senderId,
        "🚗 Please select your car model:",
        [
            { type: "reply", reply: { id: "hatchback", title: "🚙 Hatchback" } },
            { type: "reply", reply: { id: "sedan", title: "🚗 Sedan" } },
            { type: "reply", reply: { id: "muv", title: "🚐 MUV" } },
            { type: "reply", reply: { id: "suv", title: "🚜 SUV" } },
            { type: "reply", reply: { id: "luxury", title: "🏎️ Luxury" } }
        ]
    );
}


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




        // Service category selection
        // if (
        //     conversation[senderId].awaitingCategory &&
        //     listReply &&
        //     listReply !== "back_main"
        // ) {
        //     console.log("User selected a category:", listReply);
        //     conversation[senderId].selectedService = listReply;
        //     await handleServiceSelection(senderId, listReply);
        //     conversation[senderId].awaitingCategory = false;
        //     conversation[senderId].awaitingService = true;
        //     return res.sendStatus(200);
        // }


        // await sendMessage(
        //     senderId,
        //     "💼 Would you like a *Premium* or *Normal* package?",
        //     [
        //         { type: "reply", reply: { id: "premium", title: "🌟 Premium" } },
        //         { type: "reply", reply: { id: "normal", title: "🔹 Normal" } },
        //     ]
        // );


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

            // Corrected block
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
