// ===================================================================================
// TAX CONFIGURATION DATA
// This object holds all the static data for tax brackets, CPP, and EI rates.
// All calculations are based on the values in this configuration.
// NOTE: This data is for a specific tax year and may need to be updated annually. The current year is 2025
// ===================================================================================
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

// ===================================================================================
// APPLICATION STATE
// These variables hold the dynamic state of the calculator as the user interacts.
// ===================================================================================

// A central object to hold the results of calculations to be used across different functions.
const calculatorState = {
    annualIncome: 0,
    province: "",
    retirementPercentage: 0,
    monthlyDisposableIncome: 0,
    livingExpenses: {},
    totalMonthlyExpensesEntered: 0,
    annualDisposable: 0,
    isSavingsCustom: false, // Flag to check if user has manually edited savings
    isInvestmentsCustom: false, // Flag to check if user has manually edited investments
};

// ===================================================================================
// CORE CALCULATION FUNCTIONS
// These are pure functions responsible for the main tax and deduction calculations.
// ===================================================================================

/**
 * Calculates tax based on a progressive (marginal) tax bracket system.
 * @param {number} income - The taxable income amount.
 * @param {Array<object>} brackets - An array of tax bracket objects {min, max, rate}.
 * @returns {number} The total calculated tax.
 */

function calculateProgressiveTax(income, brackets) {
    let totalTax = 0;
    let remainingIncome = income;

    for (const bracket of brackets) {
        if (remainingIncome <= 0) break;

        const taxableInThisBracket = Math.min(
            remainingIncome,
            bracket.max - bracket.min
        );
        // This logic was flawed. It should calculate tax based on income within each bracket, not remaining income.
        if (income > bracket.min) {
            const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
            totalTax += taxableInBracket * bracket.rate;
        }
    }
    return totalTax;
}


/**
 * Calculates the Canada Pension Plan (CPP) contribution.
 * @param {number} income - The gross annual income.
 * @param {object} cppConfig - The CPP configuration object from TAX_CONFIG.
 * @returns {number} The calculated annual CPP contribution.
 */
function calculateCPP(income, cppConfig) {
    if (income <= cppConfig.basicExemption) {
        return 0;
    }
    const contributoryEarnings = Math.min(income, cppConfig.maxEarnings) - cppConfig.basicExemption;
    const contribution = contributoryEarnings * cppConfig.rate;
    return Math.min(contribution, cppConfig.maxContribution);
}

/**
 * Calculates the Employment Insurance (EI) contribution.
 * @param {number} income - The gross annual income.
 * @param {object} eiConfig - The EI configuration object from TAX_CONFIG.
 * @returns {number} The calculated annual EI contribution.
 */
function calculateEI(income, eiConfig) {
    const contribution = Math.min(income, eiConfig.maxEarnings) * eiConfig.rate;
    return Math.min(contribution, eiConfig.maxContribution);
}

/**
 * Calculates all federal and provincial taxes, CPP, and EI deductions.
 * @param {number} grossIncome - The user's gross annual income.
 * @param {string} province - The two-letter province code (e.g., "NL").
 * @param {number} [retirementPercentage=0] - The percentage of income contributed to retirement.
 * @returns {{deductions: object, totalDeductions: number}} An object containing a detailed breakdown of deductions and the total amount.
 */
function calculateTaxes(grossIncome, province, retirementPercentage = 0) {
    const config = TAX_CONFIG.canada;
    const retirementContribution = grossIncome * (retirementPercentage / 100);
    const taxableIncome = grossIncome - retirementContribution;
    const deductions = {};

    // Federal Tax
    const federalTax = calculateProgressiveTax(
        taxableIncome,
        config.federal.brackets
    );
    deductions.federal_tax = {
        amount: federalTax,
        percentage: (federalTax / grossIncome) * 100,
        name: "Federal Tax",
    };

    // Provincial Tax
    if (province && config.provinces[province]) {
        const provincialTax = calculateProgressiveTax(
            taxableIncome,
            config.provinces[province].brackets
        );
        deductions.provincial_tax = {
            amount: provincialTax,
            percentage: (provincialTax / grossIncome) * 100,
            name: `${config.provinces[province].name} Tax`,
        };
    }

    // CPP (on gross income)
    const cppContribution = calculateCPP(grossIncome, config.cpp);
    deductions.cpp = {
        amount: cppContribution,
        percentage: (cppContribution / grossIncome) * 100,
        name: "CPP",
    };

    // EI (on gross income)
    const eiContribution = calculateEI(grossIncome, config.ei);
    deductions.ei = {
        amount: eiContribution,
        percentage: (eiContribution / grossIncome) * 100,
        name: "Employment Insurance",
    };

    // Retirement Contribution
    if (retirementPercentage > 0) {
        deductions.retirement = {
            amount: retirementContribution,
            percentage: retirementPercentage,
            name: "Retirement Contribution",
        };
    }

    const totalDeductions = Object.values(deductions).reduce(
        (sum, deduction) => sum + deduction.amount,
        0
    );

    return {deductions, totalDeductions};
}

/**
 * Calculates all budget allocations based on the user's input and financial situation.
 * @param {number} annualIncome - The user's gross annual income.
 * @param {string} province - The two-letter province code (e.g., "NL").
 * @param {object} livingExpenses - An object containing the user's monthly living expenses.
 * @param {number} retirementPercentage - The percentage of income contributed to retirement.
 * @param {number|null} userSavingsPct - The user-defined savings percentage (of disposable income).
 * @param {number|null} userInvestmentsPct - The user-defined investments percentage (of disposable income).
 * @returns {object} A comprehensive budget object with all calculated details.
 */
function calculateBudget(annualIncome, province, livingExpenses, retirementPercentage, userSavingsPct = 0, userInvestmentsPct = 0) {
    // Calculate taxes and deductions
    const {deductions, totalDeductions} = calculateTaxes(
        annualIncome,
        province,
        retirementPercentage
    );

    // Calculate disposable income
    const annualDisposableIncome = annualIncome - totalDeductions;
    const monthlyDisposableIncome = annualDisposableIncome / 12;

    // Calculate total monthly expenses
    const totalMonthlyExpenses = Object.values(livingExpenses).reduce(
        (sum, expense) => sum + (parseFloat(expense) || 0),
        0
    );

    // Calculate expenses as a percentage of disposable income
    const expensesPercentage = monthlyDisposableIncome > 0
        ? (totalMonthlyExpenses / monthlyDisposableIncome) * 100
        : 0;

    // ===================================================================================
    // START: DYNAMIC RECOMMENDATION LOGIC
    // ===================================================================================

    let recommendedSavingsPct = 0;
    let recommendedInvestmentsPct = 0;
    let recommendedCashflowPct = 0;
    const MIN_CASHFLOW_PCT = 10; // Minimum recommended cashflow percentage

    // Total percentage of disposable income available for Savings + Investments + Cashflow
    const remainingDisposableAfterExpenses = 100 - expensesPercentage;

    if (expensesPercentage >= 81) {
        // Rule: Expenses are 81% or more. Neither savings nor investments are recommended.
        recommendedSavingsPct = 0;
        recommendedInvestmentsPct = 0;
        // All remaining income goes to cashflow, even if it's less than MIN_CASHFLOW_PCT
        recommendedCashflowPct = remainingDisposableAfterExpenses;

    } else if (expensesPercentage >= 71) { // i.e., between 71% and 80.99%
        // Rule: Expenses are between 71% and 80.99%. Only savings are recommended (no investments).
        recommendedInvestmentsPct = 0; // Investments explicitly 0%

        // Allocate minimum cashflow first, capped by what's actually available
        recommendedCashflowPct = Math.min(remainingDisposableAfterExpenses, MIN_CASHFLOW_PCT);

        // Calculate remaining percentage for savings after accounting for minimum cashflow
        let availableForSavings = remainingDisposableAfterExpenses - recommendedCashflowPct;

        if (availableForSavings > 0) {
            // Allocate savings: up to 15% of disposable income, but not more than available space
            // Ensure it's at least 10% if there is enough available space for it.
            recommendedSavingsPct = Math.max(0, Math.min(15, availableForSavings));
        }

        // Recalculate cashflow based on actual savings allocation
        recommendedCashflowPct = remainingDisposableAfterExpenses - recommendedSavingsPct - recommendedInvestmentsPct;

    } else { // expensesPercentage < 71% (Green Zone: 0% to 70.99%)
        // Rule: Expenses are below 71%. Recommend both savings and investments.
        // Priority: Cashflow (at least 10%) -> Savings (10-15%) -> Investments (10-20%)

        const MIN_SAVE_PCT = 10;
        const MAX_SAVE_PCT = 15;
        const MIN_INVEST_PCT = 10;
        const MAX_INVEST_PCT = 20;

        // 1. Ensure initial minimum cashflow
        recommendedCashflowPct = MIN_CASHFLOW_PCT;

        // Remaining percentage available for Savings and Investments after minimum cashflow
        let availableForSAndI = remainingDisposableAfterExpenses - recommendedCashflowPct;

        if (availableForSAndI <= 0) {
            // If no room for S&I (e.g., remainingDisposableAfterExpenses is exactly MIN_CASHFLOW_PCT)
            recommendedSavingsPct = 0;
            recommendedInvestmentsPct = 0;
            recommendedCashflowPct = remainingDisposableAfterExpenses; // All goes to cashflow
        } else {
            const totalMinTargetSI = MIN_SAVE_PCT + MIN_INVEST_PCT; // 20
            const totalMaxTargetSI = MAX_SAVE_PCT + MAX_INVEST_PCT; // 35

            if (availableForSAndI <= totalMinTargetSI) {
                // If available is less than or equal to the combined minimum target (20%)
                // Distribute proportionally based on min targets (10:10 ratio)
                const ratioSum = MIN_SAVE_PCT + MIN_INVEST_PCT;
                if (ratioSum > 0) { // Avoid division by zero
                    recommendedSavingsPct = availableForSAndI * (MIN_SAVE_PCT / ratioSum);
                    recommendedInvestmentsPct = availableForSAndI * (MIN_INVEST_PCT / ratioSum);
                } else {
                    recommendedSavingsPct = 0;
                    recommendedInvestmentsPct = 0;
                }
            } else {
                // If available is more than combined minimum target, but potentially less than max target (20% to 35%)
                // Start with minimums, then proportionally distribute the excess towards maximums
                recommendedSavingsPct = MIN_SAVE_PCT;
                recommendedInvestmentsPct = MIN_INVEST_PCT;
                let excessAvailable = availableForSAndI - totalMinTargetSI;

                const savingsRoom = MAX_SAVE_PCT - MIN_SAVE_PCT; // 5
                const investmentsRoom = MAX_INVEST_PCT - MIN_INVEST_PCT; // 10
                const totalRoom = savingsRoom + investmentsRoom; // 15

                if (totalRoom > 0) {
                    let savingsShare = (savingsRoom / totalRoom) * excessAvailable;
                    let investmentsShare = (investmentsRoom / totalRoom) * excessAvailable;

                    recommendedSavingsPct += Math.min(savingsShare, savingsRoom);
                    recommendedInvestmentsPct += Math.min(investmentsShare, investmentsRoom);
                }
            }

            // Ensure the individual caps are respected (important for floating point / small remainders)
            recommendedSavingsPct = Math.min(recommendedSavingsPct, MAX_SAVE_PCT);
            recommendedInvestmentsPct = Math.min(recommendedInvestmentsPct, MAX_INVEST_PCT);

            // If combined S&I exceeds availableForSAndI (e.g., due to rounding or very tight fit), scale down proportionally
            const currentCombinedSI = recommendedSavingsPct + recommendedInvestmentsPct;
            if (currentCombinedSI > availableForSAndI) {
                if (currentCombinedSI > 0) { // Avoid division by zero
                    const scaleFactor = availableForSAndI / currentCombinedSI;
                    recommendedSavingsPct *= scaleFactor;
                    recommendedInvestmentsPct *= scaleFactor;
                } else {
                    recommendedSavingsPct = 0;
                    recommendedInvestmentsPct = 0;
                }
            }

            // Any leftover from S&I allocation (if availableForSAndI was greater than totalMaxTargetSI)
            // goes back to cashflow, boosting it beyond MIN_CASHFLOW_PCT.
            recommendedCashflowPct = remainingDisposableAfterExpenses - recommendedSavingsPct - recommendedInvestmentsPct;
        }
    }

    // FINAL SANITY CHECKS and ensure no negative percentages due to floating point inaccuracies or edge cases
    recommendedSavingsPct = Math.max(0, recommendedSavingsPct);
    recommendedInvestmentsPct = Math.max(0, recommendedInvestmentsPct);
    recommendedCashflowPct = Math.max(0, recommendedCashflowPct);

    // Re-normalize to ensure total sum is exactly remainingDisposableAfterExpenses,
    // primarily by adjusting cashflow if there's a slight discrepancy.
    const totalRecommendedSum = recommendedSavingsPct + recommendedInvestmentsPct + recommendedCashflowPct;
    const difference = remainingDisposableAfterExpenses - totalRecommendedSum;

    // Distribute any remaining tiny difference to cashflow, as it's the 'catch-all'
    recommendedCashflowPct += difference;
    recommendedCashflowPct = Math.max(0, recommendedCashflowPct); // Final check to ensure no negative cashflow


    // Calculate recommended amounts based on the new percentages of disposable income
    const recommendedAllocations = {
        monthly_savings: (recommendedSavingsPct / 100) * monthlyDisposableIncome,
        monthly_investments: (recommendedInvestmentsPct / 100) * monthlyDisposableIncome,
        monthly_cashflow: (recommendedCashflowPct / 100) * monthlyDisposableIncome,
    };

    // ===================================================================================
    // END: DYNAMIC RECOMMENDATION LOGIC
    // ===================================================================================

    // Calculate custom allocations if percentages are provided
    let customAllocations = null;
    let finalUserSavingsPct = parseFloat(userSavingsPct) || 0;
    let finalUserInvestmentsPct = parseFloat(userInvestmentsPct) || 0;

    // Check if user has entered any valid custom savings or investment percentage
    const hasUserCustomInput = (!isNaN(userSavingsPct) && String(userSavingsPct) !== '') ||
        (!isNaN(userInvestmentsPct) && String(userInvestmentsPct) !== '');

    if (hasUserCustomInput) {
        // As per the previous request, no restrictions on custom allocations.
        // User's input is taken directly.

        const customMonthlySavings = (finalUserSavingsPct / 100) * monthlyDisposableIncome;
        const customMonthlyInvestments = (finalUserInvestmentsPct / 100) * monthlyDisposableIncome;

        // Calculate custom monthly cashflow based on user's custom S&I and existing expenses
        const customMonthlyCashflow = monthlyDisposableIncome - totalMonthlyExpenses - customMonthlySavings - customMonthlyInvestments;

        customAllocations = {
            monthly_savings: customMonthlySavings,
            monthly_investments: customMonthlyInvestments,
            monthly_cashflow: customMonthlyCashflow,
        };
    }

    // Determine budget zone and options (this still uses the original logic for status messages and UI toggles)
    const [zone, status, savingsAllowed, investmentsAllowed] = determineBudgetZoneAndOptions(expensesPercentage);

    return {
        annual_income: annualIncome,
        province: province,
        deductions: deductions,
        total_deductions: totalDeductions,
        annual_disposable_income: annualDisposableIncome,
        monthly_disposable_income: monthlyDisposableIncome,
        living_expenses: livingExpenses,
        total_monthly_expenses: totalMonthlyExpenses,
        expenses_percentage: expensesPercentage,
        budget_zone: zone,
        status_message: status,
        savings_allowed: savingsAllowed, // Still for UI feedback/disabling inputs for recommended
        investments_allowed: investmentsAllowed, // Still for UI feedback/disabling inputs for recommended
        retirement_percentage: retirementPercentage,

        // These percentages are now of the DISPOSABLE INCOME
        recommended_savings_pct: recommendedSavingsPct,
        recommended_investments_pct: recommendedInvestmentsPct,
        recommended_cashflow_pct: recommendedCashflowPct,
        recommended_allocations: recommendedAllocations,

        // Custom allocations also use percentages of disposable income
        custom_savings_pct: finalUserSavingsPct,
        custom_investments_pct: finalUserInvestmentsPct,
        // Calculate custom_cashflow_pct based on the final (unscaled) custom S&I percentages
        custom_cashflow_pct: 100 - expensesPercentage - finalUserSavingsPct - finalUserInvestmentsPct,
        custom_allocations: customAllocations // This will be null if no custom input
    };
}


// ===================================================================================
// BUDGETING AND ALLOCATION FUNCTIONS
// Functions related to budgeting, fund allocation, and financial health status.
// ===================================================================================

/**
 * Determines the user's budget "zone" (Green, Moderate, Red) based on their expense ratio.
 * @param {number} expensesPercentage - The percentage of disposable income that goes to expenses.
 * @returns {Array<string|boolean>} An array containing [zone, statusMessage, savingsAllowed, investmentsAllowed].
 */
function determineBudgetZoneAndOptions(expensesPercentage) {
    if (expensesPercentage <= 70) {
        return ["GREEN", "You have excellent financial flexibility. Great job!", true, true];
    } else if (expensesPercentage <= 80) {
        return [
            "MODERATE",
            "Your budget is tight. Focus on savings and consider reducing expenses.",
            true,
            false, // Investments not recommended in this zone
        ];
    } else {
        return ["RED", "Your expenses exceed a healthy limit. Prioritize increasing cashflow and reducing expenses immediately.", false, false];
    }
}

/**
 * Allocates funds to savings, investments, and cashflow based on desired percentages of the DISPOSABLE INCOME.
 * This function is now simplified as the `calculateBudget` determines the percentages directly.
 * @param {number} monthlyDisposable - The monthly income after all taxes and deductions.
 * @param {number} totalMonthlyExpenses - The total of all user-entered living expenses.
 * @param {number} savingsPctOfDisposable - The desired percentage OF THE DISPOSABLE INCOME to allocate to savings.
 * @param {number} investmentsPctOfDisposable - The desired percentage OF THE DISPOSABLE INCOME to allocate to investments.
 * @returns {object} An object with the calculated monthly allocations.
 */
function allocateFunds(
    monthlyDisposable,
    totalMonthlyExpenses,
    savingsPctOfDisposable,
    investmentsPctOfDisposable
) {
    const monthlySavings = (savingsPctOfDisposable / 100) * monthlyDisposable;
    const monthlyInvestments = (investmentsPctOfDisposable / 100) * monthlyDisposable;

    // Cashflow is disposable income minus expenses, savings, and investments
    const monthlyCashflow = monthlyDisposable - totalMonthlyExpenses - monthlySavings - monthlyInvestments;

    return {
        monthly_savings: monthlySavings,
        monthly_investments: monthlyInvestments,
        monthly_cashflow: monthlyCashflow,
    };
}


// ===================================================================================
// DOM ELEMENTS
// Cached references to all the necessary HTML elements to avoid repeated queries.
// ===================================================================================
const annualIncomeInput = document.getElementById("annualIncome");
const provinceSelect = document.getElementById("provinceSelect");
const annualIncomeError = document.getElementById("annualIncomeError");
const provinceError = document.getElementById("provinceError");
const includeRetirementCheckbox = document.getElementById("includeRetirement");
const deductonToggle = document.getElementById("deduction-toggle");
const excludeRetirementCheckbox = document.getElementById("excludeRetirement");
const navCTA = document.getElementById("cta");
const retirementPercentageSection = document.getElementById(
    "retirement-percentage-section"
);
const retirementPercentageInput = document.getElementById(
    "retirementPercentage"
);
const retirementPercentageError = document.getElementById(
    "retirementPercentageError"
);

const deductionsDisposableSection = document.getElementById(
    "deductions-disposable-section"
);
const totalAnnualDeductionsSpan = document.getElementById(
    "totalAnnualDeductions"
);
const deductionInputsContainer = document.getElementById(
    "deduction-inputs-container"
);
const annualDisposableIncomeSpan = document.getElementById(
    "annualDisposableIncome"
);
const monthlyDisposableIncomeSpan = document.getElementById(
    "monthlyDisposableIncome"
);

const expenseInputsContainer = document.getElementById(
    "expense-inputs-container"
);
const integratedExpenseSummary = document.getElementById(
    "integrated-expense-summary"
);
const currentTotalExpensesSpan = document.getElementById(
    "currentTotalExpenses"
);
const currentExpensesPercentageSpan = document.getElementById(
    "currentExpensesPercentage"
);
const currentBudgetZoneSpan = document.getElementById("currentBudgetZone");
const currentZoneMessageP = document.getElementById("currentZoneMessage");

const savingsInvestmentsSection = document.getElementById(
    "savings-investments-section"
);
const siGuidanceP = document.getElementById("si-guidance");
const savingsPercentageInput = document.getElementById("savingsPercentage");
const investmentsPercentageInput = document.getElementById(
    "investmentsPercentage"
);
const livingExpensesSection = document.getElementById(
    "living-expenses-section"
);
const cashflowCTA = document.getElementById("cashflow-cta");
const cashflowSavingPercentage = document.getElementById(
    "cashflow-saving-percentage"
);
const cashflowSavingPrice = document.getElementById("cashflow-saving-price");


const customSavingsAmountInput = document.getElementById("customSavingsAmount");
const customInvestmentsAmountInput = document.getElementById(
    "customInvestmentsAmount"
);


// ===================================================================================
// INITIALIZATION AND DOM MANIPULATION FUNCTIONS
// Functions responsible for setting up the initial state of the UI.
// ===================================================================================

/**
 * Populates the province dropdown from the TAX_CONFIG object.
 */
function initializeProvinceDropdown() {
    const provinces = TAX_CONFIG.canada.provinces;
    const dropdownList = document.getElementById("customProvinceOptions");
    const dropdownSelected = document.getElementById("dropdownSelected");

    provinceSelect.innerHTML =
        '<option value="">Choose your province...</option>';
    dropdownList.innerHTML = "";

    for (const provinceCode in provinces) {
        const province = provinces[provinceCode];

        // Add to hidden <select>
        const option = document.createElement("option");
        option.value = provinceCode;
        option.textContent = province.name;
        provinceSelect.appendChild(option);

        // Add to custom dropdown
        const li = document.createElement("li");
        li.textContent = province.name;
        li.setAttribute("data-value", provinceCode);
        li.className = "cursor-pointer px-4 py-2 hover:bg-white/10 rounded-lg";

        li.addEventListener("click", () => {
            dropdownSelected.textContent = province.name;
            provinceSelect.value = provinceCode;
            provinceSelect.dispatchEvent(new Event("change")); // Trigger change event
            dropdownList.classList.add("hidden");
        });

        dropdownList.appendChild(li);
    }
}

/**
 * Creates read-only input fields to display the breakdown of tax deductions.
 * @param {object} deductions - The deductions object from the calculateTaxes function.
 */
function createDeductionInputs(deductions) {
    deductionInputsContainer.innerHTML = "";
    Object.entries(deductions).forEach(([key, deduction]) => {
        const inputGroup = document.createElement("div");

        const label = document.createElement("label");

        let tooltipMessage = "";
        if (key === "federal_tax") {
            tooltipMessage = "Based on marginal tax brackets.";
        } else if (key === "provincial_tax") {
            tooltipMessage = "Based on provincial marginal tax brackets.";
        } else if (key === "cpp") {
            tooltipMessage = "Canada Pension Plan contribution.";
        } else if (key === "ei") {
            tooltipMessage = "Employment Insurance premium.";
        } else if (key === "retirement") {
            tooltipMessage = "Pre-tax retirement savings.";
        }

        label.innerHTML = `
      <div class="flex flex-col gap-1 rounded-md p-2 text-white">
        <span class="text-sm font-semibold tracking-tight">
          ${deduction.name} <span class="text-zinc-400">(${deduction.percentage.toFixed(2)}%)</span>
        </span>
        <span class="text-xs text-zinc-300 leading-snug">
          ${tooltipMessage}
        </span>
      </div>`;

        inputGroup.className = "relative w-full";

        const dollarSign = document.createElement("span");
        dollarSign.className =
            "absolute left-3 top-1/2 -translate-y-1/2 text-white text-sm pointer-events-none";
        dollarSign.textContent = "$";

        const input = document.createElement("input");
        input.type = "text";
        input.className =
            "input-field font-semibold w-full pl-7 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-primary input-glow transition-all duration-200";
        input.value = deduction.amount.toFixed(2);
        input.readOnly = true;

        inputGroup.appendChild(label); // Append label first
        inputGroup.appendChild(dollarSign);
        inputGroup.appendChild(input);
        deductionInputsContainer.appendChild(inputGroup);
    });
}


// ===================================================================================
// VALIDATION AND HELPER FUNCTIONS
// Small utility functions for validation and formatting.
// ===================================================================================

function validateAnnualIncome() {
    const value = parseFloat(annualIncomeInput.value);
    if (isNaN(value) || value <= 0) {
        showError(annualIncomeError, "Please enter a valid annual income.");
        return false;
    }
    if (value > 10000000) {
        showError(
            annualIncomeError,
            "Annual income seems unrealistic. Please check."
        );
        return false;
    }
    clearError(annualIncomeError);
    return true;
}

function validateProvince() {
    if (!provinceSelect.value) {
        showError(provinceError, "Please select your province.");
        return false;
    }
    clearError(provinceError);
    return true;
}

function validateRetirementPercentage() {
    if (!includeRetirementCheckbox.checked) {
        clearError(retirementPercentageError);
        return true;
    }

    const value = parseFloat(retirementPercentageInput.value);

    if (retirementPercentageInput.value === "" || isNaN(value)) {
        clearError(retirementPercentageError);
        return true;
    }

    if (value < 0 || value > 10) {
        showError(
            retirementPercentageError,
            "Contribution must be between 0% and 10%."
        );
        return false;
    }

    clearError(retirementPercentageError);
    return true;
}


function showError(element, message) {
    element.textContent = message;
    element.style.display = "block";
}

function clearError(element) {
    element.textContent = "";
    element.style.display = "none";
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
    }).format(amount);
}

function formatPercentage(percentage) {
    return isFinite(percentage) ? `${percentage.toFixed(1)}%` : "N/A";
}

// ===================================================================================
// UI UPDATE AND EVENT HANDLER FUNCTIONS
// These functions are called by event listeners to update the UI in response to user input.
// ===================================================================================

/**
 * Main handler for income/province/retirement changes.
 * It re-calculates taxes and disposable income, and updates the UI and application state.
 */
function handlePrimaryInputChange() {
    if (
        !validateAnnualIncome() ||
        !validateProvince() ||
        !validateRetirementPercentage()
    ) {
        return;
    }

    // Read inputs from DOM and update state
    calculatorState.annualIncome = parseFloat(annualIncomeInput.value);
    calculatorState.province = provinceSelect.value;
    calculatorState.retirementPercentage = includeRetirementCheckbox.checked
        ? parseFloat(retirementPercentageInput.value) || 0
        : 0;

    // Perform calculations
    const {deductions, totalDeductions} = calculateTaxes(
        calculatorState.annualIncome,
        calculatorState.province,
        calculatorState.retirementPercentage
    );

    // Update state with calculation results
    calculatorState.annualDisposable =
        calculatorState.annualIncome - totalDeductions;
    calculatorState.monthlyDisposableIncome =
        calculatorState.annualDisposable / 12;

    // Update UI
    createDeductionInputs(deductions);
    totalAnnualDeductionsSpan.textContent = formatCurrency(totalDeductions);
    annualDisposableIncomeSpan.textContent = formatCurrency(
        calculatorState.annualDisposable
    );
    monthlyDisposableIncomeSpan.textContent = formatCurrency(
        calculatorState.monthlyDisposableIncome
    );

    // Show/enable subsequent sections
    deductionsDisposableSection.classList.remove("hidden");
    livingExpensesSection.classList.remove(
        "opacity-50",
        "pointer-events-none"
    );
    livingExpensesSection.classList.add("animate-fade-in");

    // Trigger a full recalculation of expenses and recommendations
    handleExpenseOrAllocationChange();
}

/**
 * Handles changes from any expense or allocation input.
 * It gathers all current data and performs a full budget recalculation and UI update.
 */
function handleExpenseOrAllocationChange() {
    if (calculatorState.monthlyDisposableIncome <= 0) return;

    // 1. Gather all current living expenses from inputs
    let totalExpenses = 0;
    const currentExpenses = {};
    const expenseInputs = document.querySelectorAll('#living-expenses-section input[type="number"]');
    expenseInputs.forEach((input) => {
        const value = parseFloat(input.value) || 0;
        // Use the id as the key (e.g., 'rent-mortgage')
        const key = input.id;
        currentExpenses[key] = value;
        totalExpenses += value;
    });
    calculatorState.totalMonthlyExpensesEntered = totalExpenses;
    calculatorState.livingExpenses = currentExpenses;

    // 2. Gather custom allocation percentages (these are now meant to be percentages of DISPOSABLE INCOME)
    const userSavingsPct = parseFloat(savingsPercentageInput.value) || 0;
    const userInvestmentsPct = parseFloat(investmentsPercentageInput.value) || 0;

    // 3. Perform the main budget calculation with all current data
    const budget = calculateBudget(
        calculatorState.annualIncome,
        calculatorState.province,
        calculatorState.livingExpenses,
        calculatorState.retirementPercentage,
        userSavingsPct,
        userInvestmentsPct
    );

    // 4. Update all UI elements with the new budget data
    updateAllUI(budget);
}


/**
 * Updates all UI components based on the comprehensive budget object.
 * This function is the single source of truth for UI updates.
 * @param {object} budget - The full budget object from calculateBudget.
 */
function updateAllUI(budget) {
    // Update Expense Summary Section
    currentTotalExpensesSpan.textContent = formatCurrency(budget.total_monthly_expenses);
    currentExpensesPercentageSpan.textContent = formatPercentage(budget.expenses_percentage);
    currentBudgetZoneSpan.textContent = budget.budget_zone;
    currentZoneMessageP.textContent = budget.status_message;

    // Update Budget Zone coloring
    const zoneColors = {
        GREEN: {bg: 'bg-green-500/20', border: 'border-green-500/50'},
        MODERATE: {bg: 'bg-yellow-500/20', border: 'border-yellow-500/50'},
        RED: {bg: 'bg-red-500/20', border: 'border-red-500/50'},
    };
    const zoneColor = zoneColors[budget.budget_zone];
    integratedExpenseSummary.className = `mt-8 glass-effect p-4 rounded-xl text-white animate-slide-up ${zoneColor.bg} ${zoneColor.border}`;

    // Enable/disable and configure the Savings & Investments section
    if (budget.total_monthly_expenses > 0) {
        savingsInvestmentsSection.classList.remove("opacity-50", "pointer-events-none");
        savingsInvestmentsSection.classList.add("animate-fade-in");
    }
    // These remain dependent on the budget zone, as they are for *recommended* allocations
    savingsPercentageInput.disabled = !budget.savings_allowed;
    investmentsPercentageInput.disabled = !budget.investments_allowed;
    siGuidanceP.textContent = budget.savings_allowed || budget.investments_allowed
        ? "Set your custom goals below, or use our recommendations."
        : "Savings and investments are not recommended at this time. Focus on cashflow.";

    // Update Recommended Allocations
    document.getElementById('recommended-savings-amount').textContent = formatCurrency(budget.recommended_allocations.monthly_savings);
    document.getElementById('recommended-investments-amount').textContent = formatCurrency(budget.recommended_allocations.monthly_investments);
    document.getElementById('recommended-cashflow-amount').textContent = formatCurrency(budget.recommended_allocations.monthly_cashflow);


    // Display percentages as percentages of DISPOSABLE INCOME
    document.getElementById('recommended-savings-percentage').textContent = `${budget.recommended_savings_pct.toFixed(1)}%`;
    document.getElementById('recommended-investments-percentage').textContent = `${budget.recommended_investments_pct.toFixed(1)}%`;
    document.getElementById('recommended-cashflow-percentage').textContent = `(${(budget.recommended_cashflow_pct).toFixed(1)}%)`;


    // Update Custom Allocations (Amounts and Percentages)

    // Handle custom savings amount
    const userEnteredSavingsPct = parseFloat(savingsPercentageInput.value);
    if (!isNaN(userEnteredSavingsPct) && savingsPercentageInput.value !== '') {
        customSavingsAmountInput.value = formatCurrency(budget.custom_allocations ? budget.custom_allocations.monthly_savings : 0);
    } else {
        customSavingsAmountInput.value = ''; // Clear if no valid custom percentage
    }

    // Handle custom investments amount
    const userEnteredInvestmentsPct = parseFloat(investmentsPercentageInput.value);
    if (!isNaN(userEnteredInvestmentsPct) && investmentsPercentageInput.value !== '') {
        customInvestmentsAmountInput.value = formatCurrency(budget.custom_allocations ? budget.custom_allocations.monthly_investments : 0);
    } else {
        customInvestmentsAmountInput.value = ''; // Clear if no valid custom percentage
    }

    // Handle custom cashflow (amount and percentage)
    const hasAnyUserCustomInputForCashflow = (!isNaN(userEnteredSavingsPct) && savingsPercentageInput.value !== '') ||
        (!isNaN(userEnteredInvestmentsPct) && investmentsPercentageInput.value !== '');

    if (hasAnyUserCustomInputForCashflow) {
        if (budget.custom_allocations) {
            document.getElementById('custom-cashflow-amount').textContent = formatCurrency(budget.custom_allocations.monthly_cashflow);
            document.getElementById('custom-cashflow-percentage').textContent = `(${budget.custom_cashflow_pct.toFixed(1)}%)`;
        } else {
            // This case should ideally not be hit if hasAnyUserCustomInputForCashflow is true and calculateBudget ran
            document.getElementById('custom-cashflow-amount').textContent = formatCurrency(0);
            document.getElementById('custom-cashflow-percentage').textContent = `(0.0%)`;
        }
    } else {
        // If no custom percentages for S&I, cashflow is just disposable income minus expenses
        const currentCashflowAmount = budget.monthly_disposable_income - budget.total_monthly_expenses;
        const currentCashflowPct = 100 - budget.expenses_percentage;
        document.getElementById('custom-cashflow-amount').textContent = formatCurrency(currentCashflowAmount);
        document.getElementById('custom-cashflow-percentage').textContent = `(${currentCashflowPct.toFixed(1)}%)`;
    }

    // Fix for cashflow CTA - use correct budget values
    // The CTA logic for cashflow is still relevant as it warns if cashflow is low,
    // regardless of whether it's from custom or recommended allocations.
    // However, for the percentages and amounts, it should reflect the *actual* calculated cashflow,
    // which will come from the custom_allocations if the user has provided custom S&I.
    let ctaCashflowAmount;
    let ctaCashflowPercentage;

    if (hasAnyUserCustomInputForCashflow && budget.custom_allocations) {
        ctaCashflowAmount = budget.custom_allocations.monthly_cashflow;
        ctaCashflowPercentage = budget.custom_cashflow_pct;
    } else {
        // If no custom S&I, use the remaining disposable after expenses (which is the effective "cashflow")
        ctaCashflowAmount = budget.monthly_disposable_income - budget.total_monthly_expenses;
        ctaCashflowPercentage = 100 - budget.expenses_percentage;
    }


    if (ctaCashflowPercentage < 10 && budget.monthly_disposable_income > 0) {
        cashflowCTA.classList.remove('hidden');
        cashflowSavingPercentage.textContent = formatPercentage(ctaCashflowPercentage);
        cashflowSavingPrice.textContent = formatCurrency(ctaCashflowAmount);
    } else {
        cashflowCTA.classList.add('hidden');
    }


    // Update individual expense percentage labels
    updateExpensePercentageLabels(budget.monthly_disposable_income);
}

/**
 * Updates the percentage display for each expense item and category total.
 * @param {number} monthlyDisposableIncome - The current monthly disposable income.
 */
function updateExpensePercentageLabels(monthlyDisposableIncome) {
    if (monthlyDisposableIncome <= 0) return;

    const categories = {
        housing: ['rent-mortgage', 'electricity', 'water-sewer', 'gas-heating', 'home-insurance', 'housing-others'],
        transportation: ['car-payment', 'gas-fuel', 'car-insurance', 'public-transit', 'car-maintenance', 'transport-others'],
        loans: ['student-loans', 'credit-cards', 'personal-loans', 'business-loans', 'line-of-credit', 'loan-others'],
        living: ['groceries', 'dining-out', 'phone-bills', 'internet', 'subscriptions', 'living-others'],
        miscellaneous: ['healthcare', 'entertainment', 'clothing', 'personal-care', 'gifts-donations', 'misc-others'],
        children: ['school-tuition', 'childcare', 'school-supplies', 'kids-activities', 'education-savings', 'children-others']
    };

    for (const categoryName in categories) {
        let categoryTotal = 0;
        categories[categoryName].forEach(inputId => {
            const input = document.getElementById(inputId);
            const value = parseFloat(input.value) || 0;
            categoryTotal += value;
            const percentageSpan = document.getElementById(`${inputId.replace(/-/g, '_')}-percentage`);
            if (percentageSpan) {
                if (value > 0) {
                    const percentage = (value / monthlyDisposableIncome) * 100;
                    percentageSpan.textContent = `(${formatPercentage(percentage)})`;
                } else {
                    percentageSpan.textContent = '';
                }
            }
        });

        const categoryTotalSpan = document.getElementById(`${categoryName}-total`);
        if (categoryTotalSpan) {
            if (categoryTotal > 0) {
                const totalPercentage = (categoryTotal / monthlyDisposableIncome) * 100;
                categoryTotalSpan.textContent = `(${formatCurrency(categoryTotal)} = ${formatPercentage(totalPercentage)})`;
            } else {
                categoryTotalSpan.textContent = '';
            }
        }
    }
}


// ===================================================================================
// EVENT LISTENERS
// Attaching the handler functions to the DOM elements.
// ===================================================================================

function setupEventListeners() {
    // Primary income and deduction inputs
    annualIncomeInput.addEventListener("input", handlePrimaryInputChange);
    provinceSelect.addEventListener("change", handlePrimaryInputChange);
    includeRetirementCheckbox.addEventListener("change", handlePrimaryInputChange);
    excludeRetirementCheckbox.addEventListener("change", () => {
        if (excludeRetirementCheckbox.checked) {
            retirementPercentageSection.classList.add("hidden");
            retirementPercentageInput.value = "";
        }
        handlePrimaryInputChange();
    });
    retirementPercentageInput.addEventListener("input", () => {
        if (validateRetirementPercentage()) {
            handlePrimaryInputChange();
        }
    });

    // All living expense inputs
    const expenseInputs = document.querySelectorAll('#living-expenses-section input[type="number"]');
    expenseInputs.forEach(input => {
        input.addEventListener("input", handleExpenseOrAllocationChange);
    });

    // Custom savings and investments inputs
    savingsPercentageInput.addEventListener("input", () => {
        // No need to set isSavingsCustom here, as handleExpenseOrAllocationChange reads directly from input.
        handleExpenseOrAllocationChange();
    });
    investmentsPercentageInput.addEventListener("input", () => {
        // No need to set isInvestmentsCustom here, as handleExpenseOrAllocationChange reads directly from input.
        handleExpenseOrAllocationChange();
    });

    // UI Toggles
    const dropdownBtn = document.getElementById("dropdownBtn");
    const dropdownList = document.getElementById("customProvinceOptions");
    dropdownBtn.addEventListener("click", () => {
        dropdownList.classList.toggle("hidden");
    });

    deductonToggle.addEventListener("click", () => {
        const arrow = deductonToggle.querySelector('.dropdown-arrow');
        deductionInputsContainer.classList.toggle("hidden");
        arrow.classList.toggle('rotate-180');
    });

    // Popup logic
    const infoButton = document.getElementById('infoButton');
    const infoPopup = document.getElementById('infoPopup');
    const closePopup = document.getElementById('closePopup');
    infoButton.addEventListener('click', () => infoPopup.classList.remove('hidden'));
    closePopup.addEventListener('click', () => infoPopup.classList.add('hidden'));
    infoPopup.addEventListener('click', (e) => {
        if (e.target === infoPopup) infoPopup.classList.add('hidden');
    });
}

// Function to toggle category expansion/collapse
function toggleCategory(categoryName) {
    const categoryButton = document.querySelector(`[onclick="toggleCategory('${categoryName}')"]`);
    const categoryContent = categoryButton.nextElementSibling;
    const arrow = categoryButton.querySelector('.category-arrow');

    const isExpanded = categoryContent.style.maxHeight && categoryContent.style.maxHeight !== '0px';

    if (isExpanded) {
        categoryContent.style.maxHeight = '0px';
        arrow.style.transform = 'rotate(0deg)';
    } else {
        categoryContent.style.maxHeight = categoryContent.scrollHeight + 'px';
        arrow.style.transform = 'rotate(180deg)';
    }
}

// ===================================================================================
// APP INITIALIZATION
// The main function to kick off the application.
// ===================================================================================
function initializeApp() {
    initializeProvinceDropdown();
    setupEventListeners();
}

// Start the application once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', initializeApp);
