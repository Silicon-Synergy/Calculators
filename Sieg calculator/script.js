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
        { min: 0, max: 57375, rate: 0.15 },
        { min: 57375, max: 114750, rate: 0.205 },
        { min: 114750, max: 177882, rate: 0.26 },
        { min: 177882, max: 253414, rate: 0.29 },
        { min: 253414, max: Infinity, rate: 0.33 },
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
          { min: 0, max: 44192, rate: 0.087 },
          { min: 44192, max: 88382, rate: 0.145 },
          { min: 88382, max: 157792, rate: 0.158 },
          { min: 157792, max: 220910, rate: 0.178 },
          { min: 220910, max: 282214, rate: 0.198 },
          { min: 282214, max: 564429, rate: 0.208 },
          { min: 564429, max: 1128858, rate: 0.213 },
          { min: 1128858, max: Infinity, rate: 0.218 },
        ],
      },
      PE: {
        name: "Prince Edward Island",
        brackets: [
          { min: 0, max: 33328, rate: 0.095 },
          { min: 33328, max: 64656, rate: 0.1347 },
          { min: 64656, max: 105000, rate: 0.166 },
          { min: 105000, max: 140000, rate: 0.1762 },
          { min: 140000, max: Infinity, rate: 0.19 },
        ],
      },
      NS: {
        name: "Nova Scotia",
        brackets: [
          { min: 0, max: 30507, rate: 0.0879 },
          { min: 30507, max: 61015, rate: 0.1495 },
          { min: 61015, max: 95883, rate: 0.1667 },
          { min: 95883, max: 154650, rate: 0.175 },
          { min: 154650, max: Infinity, rate: 0.21 },
        ],
      },
      NB: {
        name: "New Brunswick",
        brackets: [
          { min: 0, max: 51306, rate: 0.094 },
          { min: 51306, max: 102614, rate: 0.14 },
          { min: 102614, max: 190060, rate: 0.16 },
          { min: 190060, max: Infinity, rate: 0.195 },
        ],
      },
      QC: {
        name: "Quebec",
        brackets: [
          { min: 0, max: 53255, rate: 0.14 },
          { min: 53255, max: 106495, rate: 0.19 },
          { min: 106495, max: 129590, rate: 0.24 },
          { min: 129590, max: Infinity, rate: 0.2575 },
        ],
      },
      ON: {
        name: "Ontario",
        brackets: [
          { min: 0, max: 52886, rate: 0.0505 },
          { min: 52886, max: 105775, rate: 0.0915 },
          { min: 105775, max: 150000, rate: 0.1116 },
          { min: 150000, max: 220000, rate: 0.1216 },
          { min: 220000, max: Infinity, rate: 0.1316 },
        ],
      },
      MB: {
        name: "Manitoba",
        brackets: [
          { min: 0, max: 47564, rate: 0.108 },
          { min: 47564, max: 101200, rate: 0.1275 },
          { min: 101200, max: Infinity, rate: 0.174 },
        ],
      },
      SK: {
        name: "Saskatchewan",
        brackets: [
          { min: 0, max: 53463, rate: 0.105 },
          { min: 53463, max: 152750, rate: 0.125 },
          { min: 152750, max: Infinity, rate: 0.145 },
        ],
      },
      AB: {
        name: "Alberta",
        brackets: [
          { min: 0, max: 60000, rate: 0.08 }, // New bracket for 2025
          { min: 60000, max: 151234, rate: 0.1 },
          { min: 151234, max: 181481, rate: 0.12 },
          { min: 181481, max: 241974, rate: 0.13 },
          { min: 241974, max: 362961, rate: 0.14 },
          { min: 362961, max: Infinity, rate: 0.15 },
        ],
      },
      BC: {
        name: "British Columbia",
        brackets: [
          { min: 0, max: 49279, rate: 0.0506 },
          { min: 49279, max: 98560, rate: 0.077 },
          { min: 98560, max: 113158, rate: 0.105 },
          { min: 113158, max: 137407, rate: 0.1229 },
          { min: 137407, max: 186306, rate: 0.147 },
          { min: 186306, max: 259829, rate: 0.168 },
          { min: 259829, max: Infinity, rate: 0.205 },
        ],
      },
      YT: {
        name: "Yukon",
        brackets: [
          { min: 0, max: 57375, rate: 0.064 },
          { min: 57375, max: 114750, rate: 0.09 },
          { min: 114750, max: 177882, rate: 0.109 },
          { min: 177882, max: 500000, rate: 0.128 },
          { min: 500000, max: Infinity, rate: 0.15 },
        ],
      },
      NT: {
        name: "Northwest Territories",
        brackets: [
          { min: 0, max: 51964, rate: 0.059 },
          { min: 51964, max: 103930, rate: 0.086 },
          { min: 103930, max: 168967, rate: 0.122 },
          { min: 168967, max: Infinity, rate: 0.1405 },
        ],
      },
      NU: {
        name: "Nunavut",
        brackets: [
          { min: 0, max: 54707, rate: 0.04 },
          { min: 54707, max: 109413, rate: 0.07 },
          { min: 109413, max: 177881, rate: 0.09 },
          { min: 177881, max: Infinity, rate: 0.115 },
        ],
      },
    },
  },
};

// ===================================================================================
// APPLICATION STATE
// These variables hold the dynamic state of the calculator as the user interacts.
// ===================================================================================

// An object to store the user-entered values for each living expense category.
const livingExpenses = {};

// A central object to hold the results of calculations to be used across different functions.
const calculatorState = {
  annualIncome: 0,
  province: "",
  retirementPercentage: 0,
  monthlyDisposableIncome: 0,
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
    const taxInThisBracket = taxableInThisBracket * bracket.rate;
    totalTax += taxInThisBracket;
    remainingIncome -= taxableInThisBracket;
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
  const contributoryEarnings =
    Math.min(income, cppConfig.maxEarnings) - cppConfig.basicExemption;
  const contribution = Math.max(0, contributoryEarnings * cppConfig.rate);
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

  return { deductions, totalDeductions };
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
    return ["GREEN", "You have excellent financial flexibility.", true, true];
  } else if (expensesPercentage <= 80) {
    return [
      "MODERATE",
      "Focus on savings and maintaining cashflow.",
      true,
      false,
    ];
  } else {
    return ["RED", "Prioritize cashflow and expense reduction.", false, false];
  }
}

/**
 * Allocates funds to savings, investments, and cashflow based on desired percentages and available income.
 * This is a private helper function for the main budget calculation.
 * @param {number} monthlyDisposable - The monthly income after all taxes and deductions.
 * @param {number} totalMonthlyExpenses - The total of all user-entered living expenses.
 * @param {number} savingsPctDesired - The desired percentage to allocate to savings.
 * @param {number} investmentsPctDesired - The desired percentage to allocate to investments.
 * @returns {object} An object with the calculated monthly allocations.
 */
function allocateFunds(
  monthlyDisposable,
  totalMonthlyExpenses,
  savingsPctDesired,
  investmentsPctDesired
) {
  let monthlySavings = 0;
  let monthlyInvestments = 0;
  let monthlyCashflow = 0;

  const remainingAfterExpenses = monthlyDisposable - totalMonthlyExpenses;
  const minCashflowPct = 0.1;
  const minCashflowAmount = monthlyDisposable * minCashflowPct;
  let hasAdequateCashflow = false;

  if (remainingAfterExpenses < minCashflowAmount) {
    monthlyCashflow = remainingAfterExpenses;
    hasAdequateCashflow = false;
    monthlySavings = 0;
    monthlyInvestments = 0;
  } else {
    monthlyCashflow = minCashflowAmount;
    let availableForSI = remainingAfterExpenses - monthlyCashflow;
    const minRequiredSavings =
      savingsPctDesired > 0 ? monthlyDisposable * 0.1 : 0;
    const minRequiredInvestments =
      investmentsPctDesired > 0 ? monthlyDisposable * 0.1 : 0;
    const totalMinSIRequired = minRequiredSavings + minRequiredInvestments;

    if (availableForSI >= totalMinSIRequired) {
      monthlySavings = minRequiredSavings;
      monthlyInvestments = minRequiredInvestments;
      availableForSI -= totalMinSIRequired;

      let remainingDesiredSavings =
        (monthlyDisposable * savingsPctDesired) / 100 - monthlySavings;
      let remainingDesiredInvestments =
        (monthlyDisposable * investmentsPctDesired) / 100 - monthlyInvestments;
      remainingDesiredSavings = Math.max(0, remainingDesiredSavings);
      remainingDesiredInvestments = Math.max(0, remainingDesiredInvestments);
      const totalRemainingDesired =
        remainingDesiredSavings + remainingDesiredInvestments;

      if (totalRemainingDesired > 0 && availableForSI > 0) {
        const scaleFactor = Math.min(1, availableForSI / totalRemainingDesired);
        monthlySavings += remainingDesiredSavings * scaleFactor;
        monthlyInvestments += remainingDesiredInvestments * scaleFactor;
      } else if (availableForSI > 0) {
        monthlyCashflow += availableForSI;
      }
    } else {
      const totalDesiredSIToScale =
        (monthlyDisposable * savingsPctDesired) / 100 +
        (monthlyDisposable * investmentsPctDesired) / 100;
      if (totalDesiredSIToScale > 0) {
        const scaleFactor = availableForSI / totalDesiredSIToScale;
        monthlySavings =
          ((monthlyDisposable * savingsPctDesired) / 100) * scaleFactor;
        monthlyInvestments =
          ((monthlyDisposable * investmentsPctDesired) / 100) * scaleFactor;
      } else {
        monthlySavings = 0;
        monthlyInvestments = 0;
      }
    }

    monthlyCashflow =
      monthlyDisposable -
      totalMonthlyExpenses -
      monthlySavings -
      monthlyInvestments;
    hasAdequateCashflow = monthlyCashflow >= minCashflowAmount;
  }

  return {
    monthly_savings: Math.max(0, monthlySavings),
    monthly_investments: Math.max(0, monthlyInvestments),
    monthly_cashflow: Math.max(0, monthlyCashflow),
    has_adequate_cashflow: hasAdequateCashflow,
    min_cashflow_amount: minCashflowAmount,
    remaining_unallocated: 0,
  };
}

/**
 * Orchestrates all calculations to produce a complete budget summary.
 * @param {number} annualIncome - Gross annual income.
 * @param {string} province - Two-letter province code.
 * @param {object} livingExpenses - Object with all living expense values.
 * @param {number} [retirementPercentage=0] - Retirement contribution percentage.
 * @param {number|null} userSavingsPct - User-defined savings percentage.
 * @param {number|null} userInvestmentsPct - User-defined investments percentage.
 * @returns {object} A comprehensive budget object with all calculated details.
 */
function calculateBudget(
  annualIncome,
  province,
  livingExpenses,
  retirementPercentage = 0,
  userSavingsPct = null,
  userInvestmentsPct = null
) {
  const { deductions, totalDeductions } = calculateTaxes(
    annualIncome,
    province,
    retirementPercentage
  );
  const annualDisposable = annualIncome - totalDeductions;
  const monthlyDisposable = annualDisposable / 12;
  const totalMonthlyExpenses = Object.values(livingExpenses).reduce(
    (sum, val) => sum + val,
    0
  );
  const expensesPercentage =
    monthlyDisposable <= 0
      ? Infinity
      : (totalMonthlyExpenses / monthlyDisposable) * 100;

  const [zone, status, savingsAllowed, investmentsAllowed] =
    determineBudgetZoneAndOptions(expensesPercentage);

  const recommendedSavingsPct = 12;
  const recommendedInvestmentsPct = 15;
  const effectiveRecSavingsPct = savingsAllowed ? recommendedSavingsPct : 0;
  const effectiveRecInvestmentsPct = investmentsAllowed
    ? recommendedInvestmentsPct
    : 0;

  const recommendedAllocations = allocateFunds(
    monthlyDisposable,
    totalMonthlyExpenses,
    effectiveRecSavingsPct,
    effectiveRecInvestmentsPct
  );

  let customAllocations = null;
  if (
    (savingsAllowed && userSavingsPct !== null) ||
    (investmentsAllowed && userInvestmentsPct !== null)
  ) {
    const userSavingsPctValidated =
      savingsAllowed && userSavingsPct !== null
        ? validateSavingsPercentage(userSavingsPct, true)
        : null;
    const userInvestmentsPctValidated =
      investmentsAllowed && userInvestmentsPct !== null
        ? validateInvestmentsPercentage(userInvestmentsPct, true)
        : null;

    if (
      (userSavingsPctValidated !== null &&
        userSavingsPctValidated >= 10 &&
        userSavingsPctValidated <= 15) ||
      (userInvestmentsPctValidated !== null &&
        userInvestmentsPctValidated >= 10 &&
        userInvestmentsPctValidated <= 20)
    ) {
      const finalCustomSavingsPct =
        userSavingsPctValidated !== null ? userSavingsPctValidated : 0;
      const finalCustomInvestmentsPct =
        userInvestmentsPctValidated !== null ? userInvestmentsPctValidated : 0;
      if (finalCustomSavingsPct > 0 || finalCustomInvestmentsPct > 0) {
        customAllocations = allocateFunds(
          monthlyDisposable,
          totalMonthlyExpenses,
          finalCustomSavingsPct,
          finalCustomInvestmentsPct
        );
      }
    }
  }

  return {
    annual_income: annualIncome,
    province: province,
    deductions: deductions,
    total_deductions: totalDeductions,
    annual_disposable: annualDisposable,
    monthly_disposable: monthlyDisposable,
    living_expenses: livingExpenses,
    total_monthly_expenses: totalMonthlyExpenses,
    expenses_percentage: expensesPercentage,
    budget_zone: zone,
    status_message: status,
    savings_allowed: savingsAllowed,
    investments_allowed: investmentsAllowed,
    recommended_allocations: recommendedAllocations,
    custom_allocations: customAllocations,
    retirement_percentage: retirementPercentage,
  };
}

// ===================================================================================
// DOM ELEMENTS
// Cached references to all the necessary HTML elements to avoid repeated queries.
// ===================================================================================
// const mainCalculatorCard = document.getElementById('main-calculator-card');
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
const savingsPercentageInput = document.getElementById("savingsPercentage");
const savingsPercentageError = document.getElementById(
  "savingsPercentageError"
);
const investmentsPercentageInput = document.getElementById(
  "investmentsPercentage"
);
const livingExpensesSection = document.getElementById(
  "living-expenses-section"
);
const investmentsPercentageError = document.getElementById(
  "investmentsPercentageError"
);
const cashflowAmountInput = document.getElementById("cashflowAmount");
const cashflowCTA = document.getElementById("cashflow-cta");
const cashflowSavingPercentage = document.getElementById(
  "cashflow-saving-percentage"
);
const cashflowSavingPrice = document.getElementById("cashflow-saving-price");

// ===================================================================================
// INITIALIZATION AND DOM MANIPULATION FUNCTIONS
// Functions responsible for setting up the initial state of the UI.
// ===================================================================================

/**
 * Populates the province dropdown from the TAX_CONFIG object.
 */

const taxConfig = TAX_CONFIG.canada.provinces;

// hidden <select>
const dropdownList = document.getElementById("customProvinceOptions"); // <ul>
const dropdownSelected = document.getElementById("dropdownSelected");
const dropdownBtn = document.getElementById("dropdownBtn");

function initializeProvinceDropdown() {
  const provinces = TAX_CONFIG.canada.provinces;

  provinceSelect.innerHTML =
    '<option value="">Choose your province...</option>';
  dropdownList.innerHTML = "";

  for (const provinceCode in taxConfig) {
    const province = taxConfig[provinceCode];

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
      // Set visual text
      dropdownSelected.textContent = province.name;

      // Sync hidden <select> value
      provinceSelect.value = provinceCode;
      provinceSelect.dispatchEvent(new Event("change"));

      // Hide dropdown
      dropdownList.classList.add("hidden");
    });

    dropdownList.appendChild(li);
  }
}

// Toggle custom dropdown
dropdownBtn.addEventListener("click", () => {
  dropdownList.classList.toggle("hidden");
});

document.getElementById("dropdownBtn").addEventListener("click", () => {
  customOptions.classList.toggle("hidden");
});

/**
 * Creates read-only input fields to display the breakdown of tax deductions.
 * @param {object} deductions - The deductions object from the calculateTaxes function.
 */
function createDeductionInputs(deductions) {
  deductionInputsContainer.innerHTML = "";
  Object.entries(deductions).forEach(([key, deduction]) => {
    const inputGroup = document.createElement("div");
    inputGroup.className = "input-group";

    const label = document.createElement("label");

    // Add tooltip messages based on deduction type
    let tooltipMessage = "";
    if (key === "federal_tax") {
      tooltipMessage = "Effective federal tax rate (marginal system)";
    } else if (key === "provincial_tax") {
      tooltipMessage = "Effective provincial tax rate (marginal system)";
    } else if (key === "cpp") {
      const config = TAX_CONFIG.canada.cpp;
      const isAtMax = deduction.amount >= config.maxContribution;
      tooltipMessage = isAtMax
        ? `CPP rate capped at max contribution of $${config.maxContribution.toFixed(
            2
          )}`
        : `CPP rate on contributory earnings (${(config.rate * 100).toFixed(
            2
          )}% on income above $${config.basicExemption})`;
    } else if (key === "ei") {
      const config = TAX_CONFIG.canada.ei;
      const isAtMax = deduction.amount >= config.maxContribution;
      tooltipMessage = isAtMax
        ? `EI rate capped at max contribution of $${config.maxContribution.toFixed(
            2
          )}`
        : `EI rate (${(config.rate * 100).toFixed(2)}% on insurable earnings)`;
    } else if (key === "retirement") {
      tooltipMessage = "Pre-tax retirement contribution reduces taxable income";
    }

    label.innerHTML = `
  <div class="flex flex-col gap-1 rounded-md  p-2 shadow-sm text-white">
    <span class="text-sm font-semibold tracking-tight">
      ${
        deduction.name
      } <span class="text-zinc-400">(${deduction.percentage.toFixed(2)}%)</span>
    </span>
    <span class="text-xs text-zinc-300 leading-snug">
      ${tooltipMessage}
    </span>
  </div>
`;

    inputGroup.className = "relative w-full";

    const dollarSign = document.createElement("span");
    dollarSign.className =
      "absolute left-3 top-1/2 -translate-y-1/2 text-white text-sm pointer-events-none";
    dollarSign.textContent = "$";

    const input = document.createElement("input");
    input.type = "text";
    input.className =
      "input-field font-semibold w-full pl-7 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-primary input-glow transition-all duration-200 text-white";
    input.value = deduction.amount.toFixed(2); // no $ here
    input.readOnly = true;

    inputGroup.appendChild(dollarSign);
    inputGroup.appendChild(input);
    deductionInputsContainer.appendChild(label);
    deductionInputsContainer.appendChild(inputGroup);
  });
}

// ===================================================================================
// VALIDATION AND HELPER FUNCTIONS
// Small utility functions for validation and formatting.
// ===================================================================================

function validateAnnualIncome() {
  /* Unchanged */
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
  /* Unchanged */
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

  // If the input is empty, treat it as 0 and allow it
  if (retirementPercentageInput.value === "" || isNaN(value)) {
    clearError(retirementPercentageError);
    return true;
  }

  if (value < 0 || value > 10) {
    showError(
      retirementPercentageError,
      "Retirement contribution must be between 0% and 10%."
    );
    return false;
  }

  clearError(retirementPercentageError);
  return true;
}

/**
 * Validates the user-entered savings percentage.
 * @param {number|string} value - The input value.
 * @param {boolean} [returnNull=false] - If true, returns the parsed value or null. Otherwise, returns boolean for DOM validation.
 * @returns {boolean|number|null}
 */
function validateSavingsPercentage(value, returnNull = false) {
  const val = parseFloat(value);
  const isValid = !isNaN(val) && val >= 10 && val <= 15;
  if (returnNull) return isValid ? val : null;

  if (savingsPercentageInput.value !== "" && !isValid) {
    showError(
      savingsPercentageError,
      "Savings percentage must be between 10% and 15%."
    );
    return false;
  }
  clearError(savingsPercentageError);
  return true;
}

/**
 * Validates the user-entered investments percentage.
 * @param {number|string} value - The input value.
 * @param {boolean} [returnNull=false] - If true, returns the parsed value or null. Otherwise, returns boolean for DOM validation.
 * @returns {boolean|number|null}
 */
function validateInvestmentsPercentage(value, returnNull = false) {
  const val = parseFloat(value);
  const isValid = !isNaN(val) && val >= 10 && val <= 20;
  if (returnNull) return isValid ? val : null;

  if (investmentsPercentageInput.value !== "" && !isValid) {
    showError(
      investmentsPercentageError,
      "Investments percentage must be between 10% and 20%."
    );
    return false;
  }
  clearError(investmentsPercentageError);
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
  return `${percentage.toFixed(1)}%`;
}

// ===================================================================================
// UI UPDATE AND EVENT HANDLER FUNCTIONS

// These functions are called by event listeners to update the UI in response to user input.
// ===================================================================================

/**
 * Main handler for income/province/retirement changes.
 * It re-calculates taxes and disposable income, and updates the UI and application state.
 */
function updateIncomeCalculations() {
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
  const { deductions, totalDeductions } = calculateTaxes(
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
  enableLivingExpensesSection();
  updateFinalCalculations();
}

/*
 * Enables and animates the living expenses section.
*/
function enableLivingExpensesSection() {
  livingExpensesSection.classList.remove("opacity-50", "pointer-events-none");
  livingExpensesSection.classList.add("animate-fade-in");
}

/*
 * Triggers the final budget calculation and displays the comprehensive summary.
*/
function updateFinalCalculations() {
  if (calculatorState.monthlyDisposableIncome <= 0) return;

  const userSavingsPct = savingsPercentageInput.value
    ? parseFloat(savingsPercentageInput.value)
    : null;
  const userInvestmentsPct = investmentsPercentageInput.value
    ? parseFloat(investmentsPercentageInput.value)
    : null;

  const budget = calculateBudget(
    calculatorState.annualIncome,
    calculatorState.province,
    livingExpenses,
    calculatorState.retirementPercentage,
    userSavingsPct,
    userInvestmentsPct
  );

  cashflowCTA.classList.remove("hidden");
  cashflowCTA.classList.add("block");

  // Update cashflow display
  const allocations =
    budget.custom_allocations || budget.recommended_allocations;
  const cashflowPercentage =
    calculatorState.monthlyDisposableIncome <= 0
      ? 0
      : (allocations.monthly_cashflow /
          calculatorState.monthlyDisposableIncome) *
        100;

  cashflowAmountInput.value = `${formatCurrency(
    allocations.monthly_cashflow
  )} (${formatPercentage(cashflowPercentage)})`;

  cashflowSavingPercentage.textContent = `${cashflowPercentage.toFixed(1)}%`;
  cashflowSavingPrice.textContent = `${formatCurrency(
    allocations.monthly_cashflow
  )}`;

}



// ===================================================================================
// EVENT LISTENERS
// Attaching the handler functions to the DOM elements.
// ===================================================================================

annualIncomeInput.addEventListener("input", updateIncomeCalculations);
provinceSelect.addEventListener("change", updateIncomeCalculations);

includeRetirementCheckbox.addEventListener("change", () => {
  if (includeRetirementCheckbox.checked) {
    retirementPercentageSection.classList.remove("hidden");
  }
  updateIncomeCalculations();
});

excludeRetirementCheckbox.addEventListener("change", () => {
  if (excludeRetirementCheckbox.checked) {
    retirementPercentageSection.classList.add("hidden");
    retirementPercentageInput.value = "";
  }
  updateIncomeCalculations();
});

retirementPercentageInput.addEventListener("input", () => {
  if (validateRetirementPercentage()) {
    updateIncomeCalculations();
  }
});

savingsPercentageInput.addEventListener("input", () => {
  calculatorState.isSavingsCustom = true; // Mark as custom on user input
  if (validateSavingsPercentage(savingsPercentageInput.value)) {
    updateFinalCalculations();
  }
});

investmentsPercentageInput.addEventListener("input", () => {
  calculatorState.isInvestmentsCustom = true; // Mark as custom on user input
  if (validateInvestmentsPercentage(investmentsPercentageInput.value)) {
    updateFinalCalculations();
  }
});

// ===================================================================================
// APP INITIALIZATION
// The main function to kick off the application.
// ===================================================================================
const toggleDeductionInputs = () => {
  deductonToggle.addEventListener("click", () => {
    deductionInputsContainer.classList.toggle("hidden");
  });
};

// Other functions that manipulate the DOM
document.addEventListener('DOMContentLoaded', function() {
  const infoButton = document.getElementById('infoButton');
  const infoPopup = document.getElementById('infoPopup');
  const closePopup = document.getElementById('closePopup');

  // Open popup
  infoButton.addEventListener('click', function() {
    infoPopup.classList.remove('hidden');
    // Add animation
    setTimeout(() => {
      infoPopup.querySelector('.transform').classList.remove('scale-95');
      infoPopup.querySelector('.transform').classList.add('scale-100');
    }, 10);
  });

  // Close popup
  closePopup.addEventListener('click', function() {
    infoPopup.querySelector('.transform').classList.remove('scale-100');
    infoPopup.querySelector('.transform').classList.add('scale-95');
    setTimeout(() => {
      infoPopup.classList.add('hidden');
    }, 200);
  });

  // Close popup when clicking outside
  infoPopup.addEventListener('click', function(e) {
    if (e.target === infoPopup) {
      closePopup.click();
    }
  });

  // Close popup with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !infoPopup.classList.contains('hidden')) {
      closePopup.click();
    }
  });
});

// Function to toggle category expansion/collapse
function toggleCategory(categoryName) {
  const categoryButton = document.querySelector(`[onclick="toggleCategory('${categoryName}')"]`);
  const categoryContent = categoryButton.nextElementSibling;
  const arrow = categoryButton.querySelector('.category-arrow');

  // Check if currently expanded
  const isExpanded = categoryContent.style.maxHeight && categoryContent.style.maxHeight !== '0px';

  if (isExpanded) {
    // Collapse
    categoryContent.style.maxHeight = '0px';
    arrow.style.transform = 'rotate(0deg)';
  } else {
    // Expand
    categoryContent.style.maxHeight = categoryContent.scrollHeight + 'px';
    arrow.style.transform = 'rotate(180deg)';
  }
}

// Add input event listeners for real-time calculations
document.addEventListener('DOMContentLoaded', function() {
  const allInputs = document.querySelectorAll('#living-expenses-section input[type="number"]');

  allInputs.forEach(input => {
    input.addEventListener('input', function() {
      // Add glow effect on focus/input
      this.classList.add('input-active');
    });

    input.addEventListener('blur', function() {
      this.classList.remove('input-active');
    });
  });
});

/**
 * Initializes the application by setting up the UI components.
 */
function initializeApp() {
  initializeProvinceDropdown();
}

// Start the application once the script loads.
initializeApp();
