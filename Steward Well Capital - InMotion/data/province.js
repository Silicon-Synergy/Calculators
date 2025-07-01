// Tax and deduction rates for 2025. May require annual updates.
const TAX_CONFIG = {
    canada: {
        country: "Canada",
        federal: {
            name: "Federal Tax",
            brackets: [
                {min: 0, max: 57375, rate: 0.15},
                {min: 57375, max: 114750, rate: 0.205},
                {min: 114750, max: 177882, rate: 0.26},
                {min: 177882, max: 253414, rate: 0.29},
                {min: 253414, max: Infinity, rate: 0.33},
            ],
        },
        cpp: {
            name: "CPP",
            maxEarnings: 71300,
            basicExemption: 3500,
            rate: 0.0595,
            maxContribution: 4034.1,
        },
        ei: {
            name: "Employment Insurance",
            rate: 0.0164,
            maxEarnings: 65700,
            maxContribution: 1077.48,
        },
        provinces: {
            NL: {
                name: "Newfoundland and Labrador",
                brackets: [
                    {min: 0, max: 44192, rate: 0.087},
                    {min: 44192, max: 88382, rate: 0.145},
                    {min: 88382, max: 157792, rate: 0.158},
                    {min: 157792, max: 220910, rate: 0.178},
                    {min: 220910, max: 282214, rate: 0.198},
                    {min: 282214, max: 564429, rate: 0.208},
                    {min: 564429, max: 1128858, rate: 0.213},
                    {min: 1128858, max: Infinity, rate: 0.218},
                ],
            },
            PE: {
                name: "Prince Edward Island",
                brackets: [
                    {min: 0, max: 33328, rate: 0.095},
                    {min: 33328, max: 64656, rate: 0.1347},
                    {min: 64656, max: 105000, rate: 0.166},
                    {min: 105000, max: 140000, rate: 0.1762},
                    {min: 140000, max: Infinity, rate: 0.19},
                ],
            },
            NS: {
                name: "Nova Scotia",
                brackets: [
                    {min: 0, max: 30507, rate: 0.0879},
                    {min: 30507, max: 61015, rate: 0.1495},
                    {min: 61015, max: 95883, rate: 0.1667},
                    {min: 95883, max: 154650, rate: 0.175},
                    {min: 154650, max: Infinity, rate: 0.21},
                ],
            },
            NB: {
                name: "New Brunswick",
                brackets: [
                    {min: 0, max: 51306, rate: 0.094},
                    {min: 51306, max: 102614, rate: 0.14},
                    {min: 102614, max: 190060, rate: 0.16},
                    {min: 190060, max: Infinity, rate: 0.195},
                ],
            },
            QC: {
                name: "Quebec",
                brackets: [
                    {min: 0, max: 53255, rate: 0.14},
                    {min: 53255, max: 106495, rate: 0.19},
                    {min: 106495, max: 129590, rate: 0.24},
                    {min: 129590, max: Infinity, rate: 0.2575},
                ],
            },
            ON: {
                name: "Ontario",
                brackets: [
                    {min: 0, max: 52886, rate: 0.0505},
                    {min: 52886, max: 105775, rate: 0.0915},
                    {min: 105775, max: 150000, rate: 0.1116},
                    {min: 150000, max: 220000, rate: 0.1216},
                    {min: 220000, max: Infinity, rate: 0.1316},
                ],
            },
            MB: {
                name: "Manitoba",
                brackets: [
                    {min: 0, max: 47564, rate: 0.108},
                    {min: 47564, max: 101200, rate: 0.1275},
                    {min: 101200, max: Infinity, rate: 0.174},
                ],
            },
            SK: {
                name: "Saskatchewan",
                brackets: [
                    {min: 0, max: 53463, rate: 0.105},
                    {min: 53463, max: 152750, rate: 0.125},
                    {min: 152750, max: Infinity, rate: 0.145},
                ],
            },
            AB: {
                name: "Alberta",
                brackets: [
                    {min: 0, max: 60000, rate: 0.08}, // New bracket for 2025
                    {min: 60000, max: 151234, rate: 0.1},
                    {min: 151234, max: 181481, rate: 0.12},
                    {min: 181481, max: 241974, rate: 0.13},
                    {min: 241974, max: 362961, rate: 0.14},
                    {min: 362961, max: Infinity, rate: 0.15},
                ],
            },
            BC: {
                name: "British Columbia",
                brackets: [
                    {min: 0, max: 49279, rate: 0.0506},
                    {min: 49279, max: 98560, rate: 0.077},
                    {min: 98560, max: 113158, rate: 0.105},
                    {min: 113158, max: 137407, rate: 0.1229},
                    {min: 137407, max: 186306, rate: 0.147},
                    {min: 186306, max: 259829, rate: 0.168},
                    {min: 259829, max: Infinity, rate: 0.205},
                ],
            },
            YT: {
                name: "Yukon",
                brackets: [
                    {min: 0, max: 57375, rate: 0.064},
                    {min: 57375, max: 114750, rate: 0.09},
                    {min: 114750, max: 177882, rate: 0.109},
                    {min: 177882, max: 500000, rate: 0.128},
                    {min: 500000, max: Infinity, rate: 0.15},
                ],
            },
            NT: {
                name: "Northwest Territories",
                brackets: [
                    {min: 0, max: 51964, rate: 0.059},
                    {min: 51964, max: 103930, rate: 0.086},
                    {min: 103930, max: 168967, rate: 0.122},
                    {min: 168967, max: Infinity, rate: 0.1405},
                ],
            },
            NU: {
                name: "Nunavut",
                brackets: [
                    {min: 0, max: 54707, rate: 0.04},
                    {min: 54707, max: 109413, rate: 0.07},
                    {min: 109413, max: 177881, rate: 0.09},
                    {min: 177881, max: Infinity, rate: 0.115},
                ],
            },
        },
    },
};

// Export the configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
    // For Node.js/CommonJS
    module.exports = { TAX_CONFIG };
} else {
    // For browser global scope
    window.TAX_CONFIG = TAX_CONFIG;
}