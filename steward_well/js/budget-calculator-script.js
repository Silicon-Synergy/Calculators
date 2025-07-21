// A central object to hold the results of calculations to be used across different functions.
const calculatorState = {
  annualIncome: 0,
  province: "",
  retirementPercentage: 0,
  monthlyDisposableIncome: 0,
  livingExpenses: {},
  totalMonthlyExpensesEntered: 0,
  annualDisposable: 0,
  // Default values for compound interest calculation
  compoundInterest: {
    years: 5, // Default number of years
    returnRate: 6, // Default annual return rate (6%)
    compoundFrequency: 12, // Monthly compounding
    currentChartType: "savings", // Default chart type (savings, investments, or both)
  },
  customCompoundInterest: {
    years: 5,
    returnRate: 6, // percentage
    compoundFrequency: 12, // monthly
    currentChartType: "savings", // 'savings', 'investments', 'both'
  },
  // Store the current budget calculation results
  currentBudget: null,
};

// Core tax and deduction calculation functions.

/**
 * Calculates tax based on progressive (marginal) tax brackets.
 */

function calculateProgressiveTax(income, brackets) {
  let totalTax = 0;
  for (const bracket of brackets) {
    if (income > bracket.min) {
      const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
      totalTax += taxableInBracket * bracket.rate;
    }
  }
  return totalTax;
}

/**
 * Calculates Canada Pension Plan (CPP) contribution.
 */
function calculateCPP(income, cppConfig) {
  if (income <= cppConfig.basicExemption) {
    return 0;
  }
  const contributoryEarnings =
    Math.min(income, cppConfig.maxEarnings) - cppConfig.basicExemption;
  const contribution = contributoryEarnings * cppConfig.rate;
  return Math.min(contribution, cppConfig.maxContribution);
}

/**
 * Calculates Employment Insurance (EI) contribution.
 */
function calculateEI(income, eiConfig) {
  const contribution = Math.min(income, eiConfig.maxEarnings) * eiConfig.rate;
  return Math.min(contribution, eiConfig.maxContribution);
}

/**
 * Calculates all federal and provincial taxes, CPP, and EI deductions.
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

/**
 * Calculates all budget allocations (taxes, expenses, savings, investments, cashflow).
 */
function calculateBudget(
  annualIncome,
  province,
  livingExpenses,
  retirementPercentage,
  userSavingsPct = 0,
  userInvestmentsPct = 0
) {
  // Calculate taxes and deductions
  const { deductions, totalDeductions } = calculateTaxes(
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
  const expensesPercentage =
    monthlyDisposableIncome > 0
      ? (totalMonthlyExpenses / monthlyDisposableIncome) * 100
      : 0;

  // Main budget calculation and recommendation engine.

  let recommendedSavingsPct = 0;
  let recommendedInvestmentsPct = 0;
  let recommendedCashflowPct = 0;

  const MIN_CASHFLOW_PCT = 10;
  const MIN_SAVE_PCT = 5;
  const MAX_SAVE_PCT = 15;
  const MIN_INVEST_PCT = 10;
  const MAX_INVEST_PCT = 20;

  const idealAllocationTotal = MAX_SAVE_PCT + MAX_INVEST_PCT + MIN_CASHFLOW_PCT; // 15 + 20 + 10 = 45%
  const minimumAllocationTotal =
    MIN_SAVE_PCT + MIN_INVEST_PCT + MIN_CASHFLOW_PCT; // 5 + 10 + 10 = 25%
  const minCashflowAndSavings = MIN_CASHFLOW_PCT + MIN_SAVE_PCT; // 10 + 5 = 15%

  const availablePool = 100 - expensesPercentage;

  // Calculate remaining percentage after living expenses
  const remainingPct = 100 - expensesPercentage;
  let remainingAfterAllocation = remainingPct;

  // Different allocation strategies based on expense percentage zones
  if (expensesPercentage > 70 && expensesPercentage < 80) {
    // MODERATE ZONE (Yellow): 70.1% - 79.9% expenses
    // Priority: Cashflow first (10%), then maximize Savings up to 15%, no Investments

    // Step 1: Allocate to Cashflow (always at least 10% if possible)
    recommendedCashflowPct = Math.min(MIN_CASHFLOW_PCT, remainingPct);
    remainingAfterAllocation -= recommendedCashflowPct;

    // Step 2: Allocate to Savings (up to MAX_SAVE_PCT (15%) in this zone)
    recommendedSavingsPct = Math.min(MAX_SAVE_PCT, remainingAfterAllocation);
    remainingAfterAllocation -= recommendedSavingsPct;

    // Step 3: No investments in this zone, add remaining to cashflow
    recommendedInvestmentsPct = 0;

    // Add any leftover to Cashflow
    if (remainingAfterAllocation > 0) {
      recommendedCashflowPct += remainingAfterAllocation;
    }
  } else if (expensesPercentage < 70) {
    // GREEN ZONE: Less than 70% expenses
    // Step 1: Allocate to Cashflow (always at least 10% of remaining if possible)
    recommendedCashflowPct = Math.min(MIN_CASHFLOW_PCT, remainingPct);
    remainingAfterAllocation -= recommendedCashflowPct;

    // Check if we have enough for minimum investments (10%) and adjust allocation strategy
    if (remainingAfterAllocation >= MIN_INVEST_PCT + MIN_SAVE_PCT) {
      // We have enough for both minimum investments and at least minimum savings

      // Reserve 10% for investments first
      const reservedForInvestments = MIN_INVEST_PCT;
      const availableForSavings =
        remainingAfterAllocation - reservedForInvestments;

      // Step 2: Allocate to Savings (up to 15% of remaining after expenses)
      recommendedSavingsPct = Math.min(MAX_SAVE_PCT, availableForSavings);

      // Step 3: Allocate to Investments (minimum 10%, up to 20% with remaining)
      const remainingAfterSavings =
        remainingAfterAllocation - recommendedSavingsPct;
      recommendedInvestmentsPct = Math.min(
        MAX_INVEST_PCT,
        Math.max(MIN_INVEST_PCT, remainingAfterSavings)
      );

      // Calculate any leftover after both allocations
      const leftover =
        remainingAfterAllocation -
        recommendedSavingsPct -
        recommendedInvestmentsPct;

      // Step 4: If there's still leftover, add it to Cashflow
      if (leftover > 0) {
        recommendedCashflowPct += leftover;
      }
    } else {
      // Not enough for both minimum investments and minimum savings
      // Prioritize investments at 10% if possible
      if (remainingAfterAllocation >= MIN_INVEST_PCT) {
        recommendedInvestmentsPct = MIN_INVEST_PCT;
        recommendedSavingsPct = remainingAfterAllocation - MIN_INVEST_PCT;
      } else {
        // Not even enough for minimum investments
        recommendedInvestmentsPct = remainingAfterAllocation;
        recommendedSavingsPct = 0;
      }
    }
  } else if (expensesPercentage >= 80 && expensesPercentage <= 85) {
    // RED ZONE (80% - 85% expenses):
    // Priority: Ensure cashflow is at least 10%, allocate 5-10% to savings if possible,
    // and any remaining goes to cashflow

    // Step 1: Allocate to Cashflow (always at least 10% if possible)
    recommendedCashflowPct = Math.min(MIN_CASHFLOW_PCT, remainingPct);
    remainingAfterAllocation -= recommendedCashflowPct;

    // Step 2: Allocate to Savings (5-10% in this zone)
    if (remainingAfterAllocation > 0) {
      // Allocate between 5-10% to savings, but not more than what's available
      recommendedSavingsPct = Math.min(
        10,
        Math.max(MIN_SAVE_PCT, remainingAfterAllocation)
      );

      // If we can't meet minimum savings of 5%, allocate whatever is left
      if (recommendedSavingsPct < MIN_SAVE_PCT) {
        recommendedSavingsPct = remainingAfterAllocation;
      }

      remainingAfterAllocation -= recommendedSavingsPct;
    } else {
      recommendedSavingsPct = 0;
    }

    // Step 3: No investments in this zone
    recommendedInvestmentsPct = 0;

    // Step 4: Add any leftover to Cashflow
    if (remainingAfterAllocation > 0) {
      recommendedCashflowPct += remainingAfterAllocation;
    }
  } else {
    // EXTREME RED ZONE (85.1% or more expenses):
    // All remaining percentage goes directly to cashflow
    recommendedCashflowPct = remainingPct;
    recommendedSavingsPct = 0;
    recommendedInvestmentsPct = 0;
  }

  // Special case: If exactly 70% expenses, use fixed allocation
  if (expensesPercentage === 70) {
    recommendedCashflowPct = 10;
    recommendedSavingsPct = 10;
    recommendedInvestmentsPct = 10;
  }

  // Verify total allocation doesn't exceed remaining percentage
  const totalAllocation =
    recommendedCashflowPct + recommendedSavingsPct + recommendedInvestmentsPct;
  if (Math.abs(totalAllocation - remainingPct) > 0.01) {
    // Allow for small rounding errors
    // Adjust to ensure total is exactly the remaining percentage
    const adjustment = remainingPct - totalAllocation;
    recommendedCashflowPct += adjustment; // Add any difference to cashflow
  }
  // Final check to ensure no negative cashflow

  // Calculate recommended amounts based on the new percentages of disposable income
  const recommendedAllocations = {
    monthly_savings: (recommendedSavingsPct / 100) * monthlyDisposableIncome,
    monthly_investments:
      (recommendedInvestmentsPct / 100) * monthlyDisposableIncome,
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
  const hasUserCustomInput =
    (!isNaN(userSavingsPct) && String(userSavingsPct) !== "") ||
    (!isNaN(userInvestmentsPct) && String(userInvestmentsPct) !== "");

  if (hasUserCustomInput) {
    // As per the previous request, no restrictions on custom allocations.
    // User's input is taken directly.

    const customMonthlySavings =
      (finalUserSavingsPct / 100) * monthlyDisposableIncome;
    const customMonthlyInvestments =
      (finalUserInvestmentsPct / 100) * monthlyDisposableIncome;

    // Calculate custom monthly cashflow based on user's custom S&I and existing expenses
    const customMonthlyCashflow =
      monthlyDisposableIncome -
      totalMonthlyExpenses -
      customMonthlySavings -
      customMonthlyInvestments;

    customAllocations = {
      monthly_savings: customMonthlySavings,
      monthly_investments: customMonthlyInvestments,
      monthly_cashflow: customMonthlyCashflow,
    };
  }

  // Determine budget zone and options (this still uses the original logic for status messages and UI toggles)
  const [zone, status, savingsAllowed, investmentsAllowed] =
    determineBudgetZoneAndOptions(expensesPercentage);

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
    custom_cashflow_pct:
      100 - expensesPercentage - finalUserSavingsPct - finalUserInvestmentsPct,
    custom_allocations: customAllocations, // This will be null if no custom input
  };
}

// Determines the user's budget zone (Green, Moderate, Red, Extreme Red) based on expense ratio.
function determineBudgetZoneAndOptions(expensesPercentage) {
  if (expensesPercentage <= 70) {
    return [
      "GREEN",
      "You have excellent financial flexibility. Great job!",
      true,
      true,
    ];
  } else if (expensesPercentage <= 80) {
    return [
      "MODERATE",
      "Your budget is tight. Focus on savings and consider reducing expenses.",
      true,
      false, // Investments not recommended in this zone
    ];
  } else if (expensesPercentage <= 85) {
    return [
      "RED",
      "Your expenses exceed a healthy limit. Prioritize at least 10% cashflow, 5-10% savings if possible, and focus on reducing expenses immediately.",
      true, // Savings are now recommended in this zone (5-10%)
      false, // Investments still not recommended in this zone
    ];
  } else {
    return [
      "EXTREME RED",
      "Your expenses are critically high. All remaining funds should go to cashflow while you focus on reducing expenses urgently.",
      false, // No savings in this zone
      false, // No investments in this zone
    ];
  }
}

// Cached DOM element references.
const annualIncomeInput = document.getElementById("annualIncome");
const provinceSelect = document.getElementById("provinceSelect");
const annualIncomeError = document.getElementById("annualIncomeError");
const provinceError = document.getElementById("provinceError");
const includeRetirementCheckbox = document.getElementById("includeRetirement");
const deductonToggle = document.getElementById("deduction-toggle");
const excludeRetirementCheckbox = document.getElementById("excludeRetirement");

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

const customSavingsAmountInput = document.getElementById("customSavingsAmount");
const customInvestmentsAmountInput = document.getElementById(
  "customInvestmentsAmount"
);

// Populates the province dropdown from the TAX_CONFIG object.
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
      toggleProvinceDropdown(); // Use the animation function to close
    });

    dropdownList.appendChild(li);
  }
}

/**
 * Creates read-only input fields to display tax deduction breakdown.
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
          ${
            deduction.name
          } <span class="text-zinc-400">(${deduction.percentage.toFixed(
      2
    )}%)</span>
        </span>
        <span class="text-xs text-zinc-300 leading-snug">
          ${tooltipMessage}
        </span>
      </div>`;

    inputGroup.className = "w-full";

    const inputWrapper = document.createElement("div");
    inputWrapper.className = "relative";

    const dollarSign = document.createElement("span");
    dollarSign.className =
      "absolute left-3 top-1/2 -translate-y-1/2 text-white text-sm pointer-events-none";
    dollarSign.textContent = "$";

    const input = document.createElement("input");
    input.type = "text";
    input.className =
      "input-field w-full pl-8 pr-4 py-3 border border-transparent hover:border-[#57f2a9] bg-[#dfece6] rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary input-glow transition-all duration-200";
    input.value = deduction.amount.toFixed(2);
    input.readOnly = true;

    inputGroup.appendChild(label); // Append label first

    inputWrapper.appendChild(dollarSign);
    inputWrapper.appendChild(input);
    inputGroup.appendChild(inputWrapper);

    deductionInputsContainer.appendChild(inputGroup);
  });
}

// Utility functions for validation and formatting.

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
    // Cap the value and then trigger a recalculation
    if (value > 10) {
      retirementPercentageInput.value = "10";
    } else if (value < 0) {
      retirementPercentageInput.value = "0";
    }
    handlePrimaryInputChange(); // Trigger recalculation after capping
    return false;
  }

  clearError(retirementPercentageError);
  return true;
}

function showError(element, message) {
  element.textContent = message;
  element.style.display = "block";
  element.classList.add("text-red-500");
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

// Updates UI based on user input.

/**
 * Main handler for income/province/retirement changes. Recalculates taxes and disposable income.
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

  // If deduction details are currently expanded, update their max-height
  const deductionInputsContainer = document.getElementById(
    "deduction-inputs-container"
  );
  if (
    deductionInputsContainer.style.maxHeight &&
    deductionInputsContainer.style.maxHeight !== "0px"
  ) {
    deductionInputsContainer.style.maxHeight =
      deductionInputsContainer.scrollHeight + "px";
  }

  // Show/enable subsequent sections
  deductionsDisposableSection.classList.remove("hidden");
  livingExpensesSection.classList.remove("opacity-50", "pointer-events-none");
  livingExpensesSection.classList.add("animate-fade-in");

  // Trigger a full recalculation of expenses and recommendations
  handleExpenseOrAllocationChange();
}

/**
 * Handles changes from any expense or allocation input. Triggers full budget recalculation and UI update.
 */
function handleExpenseOrAllocationChange() {
  if (calculatorState.monthlyDisposableIncome <= 0) return;

  // 1. Gather all current living expenses from inputs
  let totalExpenses = 0;
  const currentExpenses = {};
  const expenseInputs = document.querySelectorAll(
    '#living-expenses-section input[type="number"]'
  );
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

  // Store the current budget in calculatorState for access by other functions
  calculatorState.currentBudget = budget;

  // 4. Update all UI elements with the new budget data
  updateAllUI(budget);
}

/**
 * Updates all UI components based on the comprehensive budget object.
 */
function updateAllUI(budget) {
  // Update Expense Summary Section
  currentTotalExpensesSpan.textContent = formatCurrency(
    budget.total_monthly_expenses
  );
  currentExpensesPercentageSpan.textContent = formatPercentage(
    budget.expenses_percentage
  );
  currentBudgetZoneSpan.textContent = budget.budget_zone;
  currentZoneMessageP.textContent = budget.status_message;

  // Update Budget Zone coloring
  const zoneColors = {
    GREEN: { bg: "bg-green-500/20", border: "border-green-500/50" },
    MODERATE: { bg: "bg-yellow-500/20", border: "border-yellow-500/50" },
    RED: { bg: "bg-red-500/20", border: "border-red-500/50" },
    "EXTREME RED": { bg: "bg-red-900/30", border: "border-red-700/70" },
  };
  const zoneColor = zoneColors[budget.budget_zone];
  integratedExpenseSummary.className = `mt-8 glass-effect p-4 rounded-xl text-white animate-slide-up ${zoneColor.bg} ${zoneColor.border}`;

  // Enable/disable and configure the Savings & Investments section
  if (budget.total_monthly_expenses > 0) {
    savingsInvestmentsSection.classList.remove(
      "opacity-50",
      "pointer-events-none"
    );
    savingsInvestmentsSection.classList.add("animate-fade-in");
  }
  // Custom allocation inputs are always enabled
  savingsPercentageInput.disabled = false;
  investmentsPercentageInput.disabled = false;

  siGuidanceP.textContent =
    budget.savings_allowed || budget.investments_allowed
      ? "Set your custom goals below, or use our recommendations."
      : "Savings and investments are not recommended at this time. Focus on cashflow.";

  // Update Recommended Allocations Display
  document.getElementById("recommended-savings-amount").textContent =
    formatCurrency(budget.recommended_allocations.monthly_savings);
  document.getElementById("recommended-investments-amount").textContent =
    formatCurrency(budget.recommended_allocations.monthly_investments);
  document.getElementById("recommended-cashflow-amount").textContent =
    formatCurrency(budget.recommended_allocations.monthly_cashflow);
  document.getElementById(
    "recommended-savings-percentage"
  ).textContent = `${budget.recommended_savings_pct.toFixed(1)}%`;
  document.getElementById(
    "recommended-investments-percentage"
  ).textContent = `${budget.recommended_investments_pct.toFixed(1)}%`;
  document.getElementById(
    "recommended-cashflow-percentage"
  ).textContent = `(${budget.recommended_cashflow_pct.toFixed(1)}%)`;

  // Update Custom Allocations Display (Amounts and Percentages)
  const userEnteredSavingsPct = parseFloat(savingsPercentageInput.value);
  const userEnteredInvestmentsPct = parseFloat(
    investmentsPercentageInput.value
  );
  const hasAnyUserCustomInputForCashflow =
    (!isNaN(userEnteredSavingsPct) && String(userEnteredSavingsPct) !== "") ||
    (!isNaN(userEnteredInvestmentsPct) &&
      String(userEnteredInvestmentsPct) !== "");

  // Custom Savings Amount
  if (!isNaN(userEnteredSavingsPct) && savingsPercentageInput.value !== "") {
    customSavingsAmountInput.value = formatCurrency(
      budget.custom_allocations ? budget.custom_allocations.monthly_savings : 0
    );
  } else {
    customSavingsAmountInput.value = ""; // Clear if no valid custom percentage
  }

  // Custom Investments Amount
  if (
    !isNaN(userEnteredInvestmentsPct) &&
    investmentsPercentageInput.value !== ""
  ) {
    customInvestmentsAmountInput.value = formatCurrency(
      budget.custom_allocations
        ? budget.custom_allocations.monthly_investments
        : 0
    );
  } else {
    customInvestmentsAmountInput.value = ""; // Clear if no valid custom percentage
  }

  // Custom Cashflow Amount and Percentage
  if (hasAnyUserCustomInputForCashflow) {
    if (budget.custom_allocations) {
      document.getElementById("custom-cashflow-amount").textContent =
        formatCurrency(budget.custom_allocations.monthly_cashflow);
      document.getElementById(
        "custom-cashflow-percentage"
      ).textContent = `(${budget.custom_cashflow_pct.toFixed(1)}%)`;
    } else {
      document.getElementById("custom-cashflow-amount").textContent =
        formatCurrency(0);
      document.getElementById(
        "custom-cashflow-percentage"
      ).textContent = `(0.0%)`;
    }
  } else {
    // If no custom percentages for S&I, custom cashflow is just disposable income minus expenses
    const currentCashflowAmount =
      budget.monthly_disposable_income - budget.total_monthly_expenses;
    const currentCashflowPct = 100 - budget.expenses_percentage;
    document.getElementById("custom-cashflow-amount").textContent =
      formatCurrency(currentCashflowAmount);
    document.getElementById(
      "custom-cashflow-percentage"
    ).textContent = `(${currentCashflowPct.toFixed(1)}%)`;
  }

  // === START: CTA DISPLAY LOGIC ===
  const ctaSection = document.getElementById("recommended-cashflow-cta");
  const ctaMessage = document.getElementById("cta-message");
  const MIN_CASHFLOW_PCT = 10;

  if (budget.monthly_disposable_income > 0) {
    ctaSection.classList.remove("hidden");

    // Use the custom cashflow for the check if it exists, otherwise use recommended.
    const cashflowToCheck = budget.custom_allocations
      ? budget.custom_allocations.monthly_cashflow
      : budget.recommended_allocations.monthly_cashflow;
    const cashflowPctToCheck = budget.custom_allocations
      ? budget.custom_cashflow_pct
      : budget.recommended_cashflow_pct;

    if (cashflowPctToCheck < MIN_CASHFLOW_PCT) {
      // Caution message
      ctaMessage.innerHTML = `Your cashflow is <strong class="text-red-400">${formatPercentage(
        cashflowPctToCheck
      )} (${formatCurrency(
        cashflowToCheck
      )})</strong>, which is below the recommended 10%. This indicates poor financial health. We recommend talking to an expert.`;
      ctaSection.classList.remove("bg-white/5", "border-white/10");
      ctaSection.classList.add("bg-red-900/30", "border-red-500/50");
    } else {
      // Standard message
      ctaMessage.innerHTML = `Your <strong class="font-semibold">recommended</strong> cashflow is <span class="text-green-400">${formatPercentage(
        budget.recommended_cashflow_pct
      )}</span>, which is <span class="text-green-400">${formatCurrency(
        budget.recommended_allocations.monthly_cashflow
      )}</span>. To learn how to manage and secure your finances, click the button below.`;
      ctaSection.classList.add("bg-white/5", "border-white/10");
      ctaSection.classList.remove("bg-red-900/30", "border-red-500/50");
    }
  } else {
    ctaSection.classList.add("hidden");
  }
  // === END: CTA DISPLAY LOGIC ===

  // Update individual expense percentage labels
  updateExpensePercentageLabels(budget.monthly_disposable_income);

  // Update the projection chart with the new budget data
  updateProjectionChart();

  // Update the custom projection chart with the new budget data
  updateCustomProjectionChart();
}

/**
 * Updates percentage display for each expense item and category total.
 */
function updateExpensePercentageLabels(monthlyDisposableIncome) {
  if (monthlyDisposableIncome <= 0) return;

  const categories = {
    housing: [
      "rent-mortgage",
      "electricity",
      "water",
      "gas-heating",
      "home-insurance",
      "housing-others",
    ],
    transportation: [
      "car-payment",
      "gas-fuel",
      "car-insurance",
      "public-transit",
      "car-maintenance",
      "transport-others",
    ],
    loans: [
      "student-loans",
      "credit-cards",
      "personal-loans",
      "life-insurance",
      "line-of-credit",
      "loan-others",
    ],
    living: [
      "groceries",
      "phone-bills",
      "subscriptions",
      "internet",
      "clothing",
      "living-others",
    ],
    miscellaneous: [
      "healthcare",
      "entertainment",
      "dining-out",
      "pets",
      "gifts-donations",
      "misc-others",
    ],
    children: [
      "school-tuition",
      "childcare",
      "school-supplies",
      "kids-activities",
      "education-savings",
      "children-others",
    ],
  };

  for (const categoryName in categories) {
    let categoryTotal = 0;
    categories[categoryName].forEach((inputId) => {
      const input = document.getElementById(inputId);
      const value = parseFloat(input.value) || 0;
      categoryTotal += value;
      const percentageSpan = document.getElementById(
        `${inputId.replace(/-/g, "_")}-percentage`
      );
      if (percentageSpan) {
        if (value > 0) {
          const percentage = (value / monthlyDisposableIncome) * 100;
          percentageSpan.textContent = `(${formatPercentage(percentage)})`;
        } else {
          percentageSpan.textContent = "";
        }
      }
    });

    const categoryTotalSpan = document.getElementById(`${categoryName}-total`);
    if (categoryTotalSpan) {
      if (categoryTotal > 0) {
        const totalPercentage = (categoryTotal / monthlyDisposableIncome) * 100;
        categoryTotalSpan.textContent = `${formatCurrency(
          categoryTotal
        )} (${formatPercentage(totalPercentage)} of your MDI)`;
      } else {
        categoryTotalSpan.textContent = "";
      }
    }
  }
}

// Attaches event listeners to DOM elements.

function setupEventListeners() {
  // Primary income and deduction inputs
  annualIncomeInput.addEventListener("input", handlePrimaryInputChange);
  provinceSelect.addEventListener("change", handlePrimaryInputChange);
  includeRetirementCheckbox.addEventListener("change", () => {
    toggleRetirementSection(true);
    handlePrimaryInputChange();
  });
  excludeRetirementCheckbox.addEventListener("change", () => {
    toggleRetirementSection(false);
    if (excludeRetirementCheckbox.checked) {
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
  const expenseInputs = document.querySelectorAll(
    '#living-expenses-section input[type="number"]'
  );
  expenseInputs.forEach((input) => {
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

  // Chart projection buttons
  const savingsChartBtn = document.getElementById("savingsChartBtn");
  const investmentsChartBtn = document.getElementById("investmentsChartBtn");
  const bothChartBtn = document.getElementById("bothChartBtn");
  const projectionYearsInput = document.getElementById("projectionYears");
  const projectionRateInput = document.getElementById("projectionRate");

  if (savingsChartBtn && investmentsChartBtn && bothChartBtn) {
    // Helper function to update active button styling
    const updateActiveButton = (activeBtn) => {
      [savingsChartBtn, investmentsChartBtn, bothChartBtn].forEach((btn) => {
        btn.classList.remove("active");
      });
      activeBtn.classList.add("active");
    };

    savingsChartBtn.addEventListener("click", () => {
      calculatorState.compoundInterest.currentChartType = "savings";
      updateActiveButton(savingsChartBtn);
      updateProjectionChart();
    });

    investmentsChartBtn.addEventListener("click", () => {
      calculatorState.compoundInterest.currentChartType = "investments";
      updateActiveButton(investmentsChartBtn);
      updateProjectionChart();
    });

    bothChartBtn.addEventListener("click", () => {
      calculatorState.compoundInterest.currentChartType = "both";
      updateActiveButton(bothChartBtn);
      updateProjectionChart();
    });

    // Add event listeners for projection parameters
    if (projectionYearsInput) {
      projectionYearsInput.addEventListener("input", () => {
        const years = parseInt(projectionYearsInput.value) || 5;
        calculatorState.compoundInterest.years = Math.max(
          1,
          Math.min(50, years)
        );
        updateProjectionChart();
      });
    }

    if (projectionRateInput) {
      projectionRateInput.addEventListener("input", () => {
        const rate = parseFloat(projectionRateInput.value) || 6;
        calculatorState.compoundInterest.returnRate = Math.max(
          0,
          Math.min(20, rate)
        );
        updateProjectionChart();
      });
    }
  }

  // Custom Chart projection buttons
  const customSavingsChartBtn = document.getElementById(
    "customSavingsChartBtn"
  );
  const customInvestmentsChartBtn = document.getElementById(
    "customInvestmentsChartBtn"
  );
  const customBothChartBtn = document.getElementById("customBothChartBtn");
  const customProjectionYearsInput = document.getElementById(
    "customProjectionYears"
  );
  const customProjectionRateInput = document.getElementById(
    "customProjectionRate"
  );

  if (
    customSavingsChartBtn &&
    customInvestmentsChartBtn &&
    customBothChartBtn
  ) {
    // Helper function to update active button styling for custom buttons
    const updateCustomActiveButton = (activeBtn) => {
      [
        customSavingsChartBtn,
        customInvestmentsChartBtn,
        customBothChartBtn,
      ].forEach((btn) => {
        btn.classList.remove("active");
      });
      activeBtn.classList.add("active");
    };

    customSavingsChartBtn.addEventListener("click", () => {
      calculatorState.customCompoundInterest.currentChartType = "savings";
      updateCustomActiveButton(customSavingsChartBtn);
      updateCustomProjectionChart();
    });

    customInvestmentsChartBtn.addEventListener("click", () => {
      calculatorState.customCompoundInterest.currentChartType = "investments";
      updateCustomActiveButton(customInvestmentsChartBtn);
      updateCustomProjectionChart();
    });

    customBothChartBtn.addEventListener("click", () => {
      calculatorState.customCompoundInterest.currentChartType = "both";
      updateCustomActiveButton(customBothChartBtn);
      updateCustomProjectionChart();
    });

    // Add event listeners for custom projection parameters
    if (customProjectionYearsInput) {
      customProjectionYearsInput.addEventListener("input", () => {
        const years = parseInt(customProjectionYearsInput.value) || 5;
        calculatorState.customCompoundInterest.years = Math.max(
          1,
          Math.min(50, years)
        );
        updateCustomProjectionChart();
      });
    }

    if (customProjectionRateInput) {
      customProjectionRateInput.addEventListener("input", () => {
        const rate = parseFloat(customProjectionRateInput.value) || 6;
        calculatorState.customCompoundInterest.returnRate = Math.max(
          0,
          Math.min(20, rate)
        );
        updateCustomProjectionChart();
      });
    }
  }

  // UI Toggles
  const dropdownBtn = document.getElementById("dropdownBtn");
  const dropdownList = document.getElementById("customProvinceOptions");
  dropdownBtn.addEventListener("click", () => {
    toggleProvinceDropdown();
  });

  deductonToggle.addEventListener("click", () => {
    toggleDeductionInputs();
  });

  const toggleAllExpensesButton = document.getElementById(
    "toggle-all-expenses"
  );
  if (toggleAllExpensesButton) {
    toggleAllExpensesButton.addEventListener("click", toggleAllExpenses);
  }

  // Popup logic
  const infoButton = document.getElementById("infoButton");
  const infoPopup = document.getElementById("infoPopup");
  const closePopup = document.getElementById("closePopup");
  infoButton.addEventListener("click", () =>
    infoPopup.classList.remove("hidden")
  );
  closePopup.addEventListener("click", () => infoPopup.classList.add("hidden"));
  infoPopup.addEventListener("click", (e) => {
    if (e.target === infoPopup) infoPopup.classList.add("hidden");
  });
}

// Function to toggle category expansion/collapse
function toggleCategory(categoryName) {
  const allCategoryContents = document.querySelectorAll(
    ".expense-category .category-content"
  );
  const allCategoryArrows = document.querySelectorAll(
    ".expense-category .category-arrow"
  );
  const allCategoryButtons = document.querySelectorAll(
    ".expense-category .category-toggle"
  );

  const currentButton = document.querySelector(
    `[onclick="toggleCategory('${categoryName}')"]`
  );
  const currentContent = currentButton.nextElementSibling;
  const currentArrow = currentButton.querySelector(".category-arrow");
  const isExpanded =
    currentContent.style.maxHeight && currentContent.style.maxHeight !== "0px";

  // First, close all categories
  allCategoryContents.forEach((content, index) => {
    content.style.maxHeight = "0px";
    allCategoryArrows[index].style.transform = "rotate(0deg)";
  });

  // If the clicked category was not already expanded, open it
  if (!isExpanded) {
    currentContent.style.maxHeight = currentContent.scrollHeight + "px";
    currentArrow.style.transform = "rotate(180deg)";
  }
  // If it was expanded, the above loop already closed it.
}

// Function to toggle all expense categories at once
function toggleAllExpenses() {
  const toggleAllButton = document.getElementById("toggle-all-expenses");
  const expenseCategories = document.querySelectorAll(".expense-category");
  const isExpanding = toggleAllButton.textContent.includes("Expand");

  expenseCategories.forEach((category) => {
    const categoryContent = category.querySelector(".category-content");
    const arrow = category.querySelector(".category-arrow");
    const isExpanded =
      categoryContent.style.maxHeight &&
      categoryContent.style.maxHeight !== "0px";

    if (isExpanding && !isExpanded) {
      // Expand it
      categoryContent.style.maxHeight = categoryContent.scrollHeight + "px";
      arrow.style.transform = "rotate(180deg)";
    } else if (!isExpanding && isExpanded) {
      // Collapse it
      categoryContent.style.maxHeight = "0px";
      arrow.style.transform = "rotate(0deg)";
    }
  });

  toggleAllButton.textContent = isExpanding ? "Collapse All" : "Expand All";
}

// Function to toggle deduction inputs expansion/collapse
function toggleDeductionInputs() {
  const deductionInputsContainer = document.getElementById(
    "deduction-inputs-container"
  );
  const arrow = deductonToggle.querySelector(".dropdown-arrow");

  const isExpanded =
    deductionInputsContainer.style.maxHeight &&
    deductionInputsContainer.style.maxHeight !== "0px";

  if (isExpanded) {
    deductionInputsContainer.style.maxHeight = "0px";
    arrow.style.transform = "rotate(0deg)";
  } else {
    deductionInputsContainer.style.maxHeight =
      deductionInputsContainer.scrollHeight + "px";
    arrow.style.transform = "rotate(180deg)";
  }
}

function toggleRetirementSection(isShown) {
  const retirementSection = document.getElementById(
    "retirement-percentage-section"
  );
  if (isShown) {
    retirementSection.style.maxHeight = retirementSection.scrollHeight + "px";
    retirementSection.style.opacity = "1";
  } else {
    retirementSection.style.maxHeight = "0";
    retirementSection.style.opacity = "0";
  }
}

function toggleProvinceDropdown() {
  const dropdownList = document.getElementById("customProvinceOptions");
  const isExpanded =
    dropdownList.style.maxHeight && dropdownList.style.maxHeight !== "0px";

  if (isExpanded) {
    dropdownList.style.maxHeight = "0";
    dropdownList.style.opacity = "0";
  } else {
    dropdownList.style.maxHeight = dropdownList.scrollHeight + "px";
    dropdownList.style.opacity = "1";
  }
}

// Initializes the application on DOM load.
/**
 * Calculates the future value of an investment using compound interest.
 * FV = PMT * ((1 + r)^n - 1) / r
 * where:
 * - PMT is the monthly contribution
 * - r is the monthly interest rate (annual rate / 12)
 * - n is the total number of periods (years * 12)
 */
function calculateFutureValue(
  monthlyContribution,
  years,
  annualRate,
  compoundFrequency
) {
  // Convert annual rate to decimal
  const r = annualRate / 100;

  // Calculate the rate per period
  const ratePerPeriod = r / compoundFrequency;

  // Calculate total number of periods
  const totalPeriods = years * compoundFrequency;

  // Calculate future value using the compound interest formula
  // FV = PMT * ((1 + r)^n - 1) / r
  const futureValue =
    monthlyContribution *
    ((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod);

  // Calculate total contributions
  const totalContributions = monthlyContribution * totalPeriods;

  // Calculate interest earned
  const interestEarned = futureValue - totalContributions;

  return {
    endingBalance: futureValue,
    totalContributions: totalContributions,
    interestEarned: interestEarned,
  };
}

/**
 * Updates the projection chart based on the selected allocation type (savings, investments, or both)
 */
function updateProjectionChart() {
  const { years, returnRate, compoundFrequency, currentChartType } =
    calculatorState.compoundInterest;

  // Get the chart instance
  const chartElement = document.getElementById("myPieChart2");
  let chart = Chart.getChart(chartElement);

  // If no budget calculation has been performed yet, return early
  if (!calculatorState.currentBudget) {
    console.log("No budget data available yet for projection chart");
    return;
  }

  const currentBudget = calculatorState.currentBudget;

  // Determine the monthly contribution based on the selected chart type
  let monthlyContribution = 0;

  if (currentChartType === "savings") {
    monthlyContribution = currentBudget.recommended_allocations.monthly_savings;
  } else if (currentChartType === "investments") {
    monthlyContribution =
      currentBudget.recommended_allocations.monthly_investments;
  } else if (currentChartType === "both") {
    monthlyContribution =
      currentBudget.recommended_allocations.monthly_savings +
      currentBudget.recommended_allocations.monthly_investments;
  }

  // Calculate the future value
  const { endingBalance, totalContributions, interestEarned } =
    calculateFutureValue(
      monthlyContribution,
      years,
      returnRate,
      compoundFrequency
    );

  // Update the chart data
  if (chart) {
    chart.data.datasets[0].data = [
      totalContributions,
      interestEarned,
      endingBalance,
    ];
    chart.data.labels = [
      "Total Contributions",
      "Interest Earned",
      "Ending Balance",
    ];
    chart.update();
  } else {
    // If chart doesn't exist yet, create it
    chart = new Chart(chartElement.getContext("2d"), {
      type: "pie",
      data: {
        labels: ["Total Contributions", "Interest Earned", "Ending Balance"],
        datasets: [
          {
            label: "Projection",
            data: [totalContributions, interestEarned, endingBalance],
            backgroundColor: [
              "rgba(255, 206, 86, 0.7)", // Yellow for contributions
              "rgba(75, 192, 192, 0.7)", // Green for interest
              "rgba(54, 162, 235, 0.7)", // Blue for ending balance
            ],
            borderColor: [
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(54, 162, 235, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.raw || 0;
                return `${label}: ${formatCurrency(value)}`;
              },
            },
          },
          legend: {
            position: "bottom",
            labels: {
              color: "white",
              font: {
                size: 12,
              },
            },
          },
          title: {
            display: true,
            text: `Projection over ${years} years at ${returnRate}%`,
            color: "white",
            font: {
              size: 14,
            },
          },
        },
      },
    });
  }

  // Display a summary of the projection below the chart
  const summaryElement = document.getElementById("projectionSummary");
  if (summaryElement) {
    const contributionType =
      currentChartType === "savings"
        ? "Savings"
        : currentChartType === "investments"
        ? "Investments"
        : "Combined";

    summaryElement.innerHTML = `
      <div class="text-white text-sm mt-4">
        <p><strong>${contributionType} of ${formatCurrency(
      monthlyContribution
    )}/month</strong> for ${years} years at ${returnRate}% return:</p>
        <ul class="list-disc pl-5 mt-2 space-y-1">
          <li><span class="font-semibold">Total Contributions:</span> ${formatCurrency(
            totalContributions
          )}</li>
          <li><span class="font-semibold">Interest Earned:</span> ${formatCurrency(
            interestEarned
          )}</li>
          <li><span class="font-semibold">Ending Balance:</span> ${formatCurrency(
            endingBalance
          )}</li>
        </ul>
      </div>
    `;
  }
}

/**
 * Updates the custom projection chart based on the selected allocation type (savings, investments, or both)
 */
function updateCustomProjectionChart() {
  const { years, returnRate, compoundFrequency, currentChartType } =
    calculatorState.customCompoundInterest;

  // Get the chart instance
  const chartElement = document.getElementById("customPieChart");
  let chart = Chart.getChart(chartElement);

  // If no budget calculation has been performed yet, return early
  if (!calculatorState.currentBudget) {
    console.log("No budget data available yet for custom projection chart");
    return;
  }

  const currentBudget = calculatorState.currentBudget;

  // Determine the monthly contribution based on the selected chart type using custom allocations
  let monthlyContribution = 0;

  if (currentBudget.custom_allocations) {
    if (currentChartType === "savings") {
      monthlyContribution = currentBudget.custom_allocations.monthly_savings;
    } else if (currentChartType === "investments") {
      monthlyContribution =
        currentBudget.custom_allocations.monthly_investments;
    } else if (currentChartType === "both") {
      monthlyContribution =
        currentBudget.custom_allocations.monthly_savings +
        currentBudget.custom_allocations.monthly_investments;
    }
  }

  // Calculate the future value
  const { endingBalance, totalContributions, interestEarned } =
    calculateFutureValue(
      monthlyContribution,
      years,
      returnRate,
      compoundFrequency
    );

  // Update the chart data
  if (chart) {
    chart.data.datasets[0].data = [
      totalContributions,
      interestEarned,
      endingBalance,
    ];
    chart.data.labels = [
      "Total Contributions",
      "Interest Earned",
      "Ending Balance",
    ];
    chart.update();
  } else {
    // If chart doesn't exist yet, create it
    chart = new Chart(chartElement.getContext("2d"), {
      type: "pie",
      data: {
        labels: ["Total Contributions", "Interest Earned"],
        datasets: [
          {
            label: "Custom Projection",
            data: [totalContributions, interestEarned, endingBalance],
            backgroundColor: [
              "rgba(255, 206, 86, 0.7)", // Yellow for contributions
              "rgba(75, 192, 192, 0.7)", // Green for interest
              "rgba(54, 162, 235, 0.7)", // Blue for ending balance
            ],
            borderColor: [
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(54, 162, 235, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.raw || 0;
                return `${label}: ${formatCurrency(value)}`;
              },
            },
          },
          legend: {
            position: "bottom",
            labels: {
              color: "white",
              font: {
                size: 12,
              },
            },
          },
          title: {
            display: true,
            text: `Custom Projection over ${years} years at ${returnRate}%`,
            color: "white",
            font: {
              size: 14,
            },
          },
        },
      },
    });
  }

  // Display a summary of the projection below the chart
  const summaryElement = document.getElementById("customProjectionSummary");
  if (summaryElement) {
    const contributionType =
      currentChartType === "savings"
        ? "Savings"
        : currentChartType === "investments"
        ? "Investments"
        : "Combined";

    summaryElement.innerHTML = `
      <div class="text-white text-sm mt-4">
        <p><strong>Custom ${contributionType} of ${formatCurrency(
      monthlyContribution
    )}/month</strong> for ${years} years at ${returnRate}% return:</p>
        <ul class="list-disc pl-5 mt-2 space-y-1">
          <li><span class="font-semibold">Total Contributions:</span> ${formatCurrency(
            totalContributions
          )}</li>
          <li><span class="font-semibold">Interest Earned:</span> ${formatCurrency(
            interestEarned
          )}</li>
          <li><span class="font-semibold">Ending Balance:</span> ${formatCurrency(
            endingBalance
          )}</li>
        </ul>
      </div>
    `;
  }
}

function initializeApp() {
  initializeProvinceDropdown();
  setupEventListeners();
}

// Start the application once the DOM is fully loaded.
document.addEventListener("DOMContentLoaded", initializeApp);
