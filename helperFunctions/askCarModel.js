const dotenv = require("dotenv");
dotenv.config();
const sendMessage = require("../helperFunctions/sendMessage");

// Car modal
const askCarModel = async function (senderId) {
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
};

module.exports = askCarModel;