// Changing to  UpperCase
const formatText = (text) => {
    if (!text) return "";
    return text
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize each word
};

module.exports = formatText;