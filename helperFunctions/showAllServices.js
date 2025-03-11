const dotenv = require("dotenv");
dotenv.config();
const sendListItems = require("../helperFunctions/sendListItems");

// Show All Services
const showAllServices = async function (senderId) {
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
};

module.exports = showAllServices;