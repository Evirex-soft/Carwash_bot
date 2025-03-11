// Car wash services
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

module.exports = carWashServices;