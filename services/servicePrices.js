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

module.exports = servicePrices;