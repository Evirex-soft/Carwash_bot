const dotenv = require("dotenv");
dotenv.config();
const sendListItems = require("../helperFunctions/sendListItems");

const conversation = {};

// handle Service Selection
const handleServiceSelection = async function (senderId, serviceId) {

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
};

module.exports = handleServiceSelection;