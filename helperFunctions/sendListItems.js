const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

// Send Lists Function
const sendListItems = async function (senderId, headerText, bodyText, sections) {
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
};

module.exports = sendListItems;