const Package = require("../model/packageModel");

const checkIfPackageExists = async (regNumber, selectedPackage) => {
    try {
        const result = await Package.findOne({
            carNumber: regNumber,
            selectedPackage: selectedPackage
        });
        return !!result;
    } catch (error) {
        console.error("Error checking package existence:", error);
        return false;
    }
};

module.exports = checkIfPackageExists;