// Register Chart.js datalabels plugin
Chart.register(ChartDataLabels);

// A central object to hold the results of calculations to be used across different functions.
const calculatorState = {
  annualIncome: 0,
  province: "",
  ageGroup: "", // Added age group tracking
  retirementPercentage: 0,
  monthlyDisposableIncome: 0,
  livingExpenses: {},
  totalMonthlyExpensesEntered: 0,
  annualDisposable: 0,
  // Track if user has entered custom savings/investment values
  hasCustomSavings: false,
  hasCustomInvestments: false,
  // Track if any expense field has been touched
  hasEnteredExpenses: false,
  // Track if custom savings/investments toggle is on
  customSavingsToggleEnabled: false,
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
  deductionsExpanded: false,
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

  // Define custom color schemes for custom charts
  const customColorSchemes = {
    savings: {
      backgroundColor: [
        "rgba(233, 30, 99, 0.8)", // Pink for contributions
        "rgba(0, 188, 212, 0.8)", // Cyan for interest
        "rgba(63, 81, 181, 0.8)", // Indigo for ending balance
      ],
      borderColor: [
        "rgba(233, 30, 99, 1)",
        "rgba(0, 188, 212, 1)",
        "rgba(63, 81, 181, 1)",
      ],
      borderWidth: 2,
    },
    investments: {
      backgroundColor: [
        "rgba(255, 87, 34, 0.8)", // Deep orange for contributions
        "rgba(139, 195, 74, 0.8)", // Light green for interest
        "rgba(156, 39, 176, 0.8)", // Purple for ending balance
      ],
      borderColor: [
        "rgba(255, 87, 34, 1)",
        "rgba(139, 195, 74, 1)",
        "rgba(156, 39, 176, 1)",
      ],
      borderWidth: 3,
    },
    both: {
      backgroundColor: [
        "rgba(121, 85, 72, 0.8)", // Brown for contributions
        "rgba(96, 125, 139, 0.8)", // Blue grey for interest
        "rgba(255, 152, 0, 0.8)", // Orange for ending balance
      ],
      borderColor: [
        "rgba(121, 85, 72, 1)",
        "rgba(96, 125, 139, 1)",
        "rgba(255, 152, 0, 1)",
      ],
      borderWidth: 1,
    },
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
    name: "EI",
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

  // Determine budget zone and options (this still uses the original logic for status messages and UI toggles)
  const [zone, status, savingsAllowed, investmentsAllowed] =
    determineBudgetZoneAndOptions(expensesPercentage);

  // Calculate custom allocations if percentages are provided
  let customAllocations = null;
  let finalUserSavingsPct = parseFloat(userSavingsPct) || 0;
  let finalUserInvestmentsPct = parseFloat(userInvestmentsPct) || 0;

  // Check if user has entered any valid custom savings or investment percentage
  const hasUserCustomInput =
    (!isNaN(userSavingsPct) && String(userSavingsPct) !== "") ||
    (!isNaN(userInvestmentsPct) && String(userInvestmentsPct) !== "");

  if (hasUserCustomInput) {
    // Override user percentages to 0% if savings/investments are not allowed in current zone
    if (!savingsAllowed) {
      finalUserSavingsPct = 0;
    }
    if (!investmentsAllowed) {
      finalUserInvestmentsPct = 0;
    }

    let sAmt = (finalUserSavingsPct / 100) * monthlyDisposableIncome;
    let iAmt = (finalUserInvestmentsPct / 100) * monthlyDisposableIncome;
    const available = Math.max(
      0,
      monthlyDisposableIncome - totalMonthlyExpenses
    );
    let sum = sAmt + iAmt;
    if (sum > available && sum > 0) {
      const scale = available / sum;
      sAmt = sAmt * scale;
      iAmt = iAmt * scale;
    }
    sAmt = Math.floor(sAmt * 100) / 100;
    iAmt = Math.floor(iAmt * 100) / 100;
    let cflow = available - (sAmt + iAmt);
    if (cflow < 0 && Math.abs(cflow) < 0.05) {
      cflow = 0;
    }
    finalUserSavingsPct =
      monthlyDisposableIncome > 0 ? (sAmt / monthlyDisposableIncome) * 100 : 0;
    finalUserInvestmentsPct =
      monthlyDisposableIncome > 0 ? (iAmt / monthlyDisposableIncome) * 100 : 0;

    customAllocations = {
      monthly_savings: sAmt,
      monthly_investments: iAmt,
      monthly_cashflow: cflow,
    };
  }

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
  if (isNaN(expensesPercentage)) {
    // return ["GREEN", "Enter expenses to see guidance.", true, true];
    return [null, null, true, true];
  }

  if (expensesPercentage <= 70) {
    // Healthy: ample room to save/invest
    return [
      // "GREEN",
      // "Healthy budget: allocate to savings and investments.",
      null,
      null,
      true,
      true,
    ];
  } else if (expensesPercentage <= 80) {
    // Caution: watch lifestyle creep, keep cashflow positive
    return [
      // "MODERATE",
      // "Caution: spending is close to your take-home; keep cashflow positive.",
      null,
      null,
      true,
      true,
    ];
  } else if (expensesPercentage <= 85) {
    // Red: prioritize cashflow, reduce expenses; investments not recommended
    return [
      // "RED",
      // "Focus on reducing expenses and maintaining cashflow.",
      null,
      null,
      true,
      false,
    ];
  } else {
    // Extreme Red: cut expenses immediately; pause savings/investments
    return [
      // "EXTREME RED",
      // "Critical: expenses too high; pause savings/investments and cut costs.",
      null,
      null,
      false,
      false,
    ];
  }
}

// Cached DOM element references.
const annualIncomeInput = document.getElementById("annualIncome");
const provinceSelect = document.getElementById("provinceSelect");
const annualIncomeError = document.getElementById("annualIncomeError");
const provinceError = document.getElementById("provinceError");
const ageRangeError = document.getElementById("ageRangeError");
const ageDropdownSelected = document.getElementById("ageDropdownSelected");
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
// const totalAnnualDeductionsSpan = document.getElementById(
//   "totalAnnualDeductions"
// );
const deductionInputsContainer = document.getElementById(
  "deduction-inputs-container"
);
// const annualDisposableIncomeSpan = document.getElementById(
//   "annualDisposableIncome"
// );
// const monthlyDisposableIncomeSpan = document.getElementById(
//   "monthlyDisposableIncome"
// );

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

const annualIncomeSection = document.getElementById("annual-income-section");

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
  4;
  const deductionHexColors = {
    federal_tax: "#D6426C",
    provincial_tax: "#9D88E1",
    cpp: "#8DE188",
    ei: "#3364E1",
    retirement: "#94a3b8",
  };

  const gradientStyle = "linear-gradient(to right, #177F5B, #154D80)";

  Object.entries(deductions).forEach(([key, deduction]) => {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between py-2";
    row.setAttribute("data-row-type", "deduction");

    const left = document.createElement("div");
    left.className = "flex items-center gap-3";

    const dot = document.createElement("span");
    dot.className = "w-3 h-3 rounded-sm";
    dot.style.backgroundColor = deductionHexColors[key] || "#94a3b8";
    left.appendChild(dot);

    const name = key === "provincial_tax" ? "Provincial tax" : deduction.name;

    const labelText = document.createElement("span");
    labelText.className = "text-gray-200 text-sm ";
    labelText.innerHTML = `${name} <span class="text-zinc-400">(${deduction.percentage.toFixed(
      2
    )}%)</span>`;
    left.appendChild(labelText);

    if (key === "cpp" || key === "ei") {
      const infoWrap = document.createElement("span");
      infoWrap.style.position = "relative";
      infoWrap.style.display = "inline-flex";
      infoWrap.style.alignItems = "center";
      infoWrap.style.marginLeft = "6px";

      const info = document.createElement("span");
      info.className =
        "text-xs inline-flex items-center justify-center w-5 h-5 border border-slate-300 rounded-full text-slate-700 cursor-help";
      info.textContent = "i";

      const tooltip = document.createElement("div");
      tooltip.textContent =
        key === "cpp"
          ? "Canada Pension Plan contribution (up to annual max)."
          : "Employment Insurance premium (up to annual max).";
      tooltip.style.position = "absolute";
      tooltip.style.left = "24px";
      tooltip.style.top = "50%";
      tooltip.style.transform = "translateY(-50%)";
      tooltip.style.background = "#ffffff";
      tooltip.style.color = "#0f172a";
      tooltip.style.border = "1px solid #cbd5e1";
      tooltip.style.borderRadius = "6px";
      tooltip.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
      tooltip.style.padding = "6px 8px";
      tooltip.style.whiteSpace = "nowrap";
      tooltip.style.zIndex = "50";
      tooltip.style.opacity = "0";
      tooltip.style.visibility = "hidden";
      tooltip.style.transition = "opacity 150ms ease, visibility 150ms ease";
      tooltip.style.pointerEvents = "none";

      const showTooltip = () => {
        tooltip.style.opacity = "1";
        tooltip.style.visibility = "visible";
      };
      const hideTooltip = () => {
        tooltip.style.opacity = "0";
        tooltip.style.visibility = "hidden";
      };

      infoWrap.addEventListener("mouseenter", showTooltip);
      infoWrap.addEventListener("mouseleave", hideTooltip);
      infoWrap.addEventListener("click", (e) => {
        e.stopPropagation();
        tooltip.style.visibility === "visible" ? hideTooltip() : showTooltip();
      });

      infoWrap.appendChild(info);
      infoWrap.appendChild(tooltip);
      left.appendChild(infoWrap);
    }

    const dotted = document.createElement("div");
    dotted.className = "flex-1 border-t border-dashed border-emerald-200 mx-3";

    const amount = document.createElement("span");
    amount.style.background = gradientStyle;
    amount.style.webkitBackgroundClip = "text";
    amount.style.webkitTextFillColor = "transparent";
    amount.style.fontWeight = "600";
    amount.textContent = formatCurrency(deduction.amount);

    row.appendChild(left);
    row.appendChild(dotted);
    row.appendChild(amount);

    deductionInputsContainer.appendChild(row);
  });

  // Summary rows: Total Annual Deduction, Annual & Monthly Take Home Pay
  const totalAmount = Object.values(deductions).reduce(
    (sum, d) => sum + d.amount,
    0
  );
  const totalPct =
    calculatorState.annualIncome > 0
      ? (totalAmount / calculatorState.annualIncome) * 100
      : 0;

  const summaryRows = [
    { name: "Total Annual Deduction", pct: totalPct, value: totalAmount },
    {
      name: "Annual Take Home Pay",
      pct: null,
      value: calculatorState.annualDisposable,
    },
    {
      name: "Monthly Take Home Pay",
      pct: null,
      value: calculatorState.monthlyDisposableIncome,
    },
  ];

  summaryRows.forEach(({ name, pct, value }) => {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between py-2";
    row.setAttribute("data-row-type", "summary");

    const left = document.createElement("div");
    left.className = "flex items-center gap-2";

    // Dot for Annual Take Home Pay with your specified color
    if (name === "Annual Take Home Pay") {
      const dot = document.createElement("span");
      dot.className = "w-3 h-3 rounded-sm";
      dot.style.backgroundColor = "#FB725A";
      left.appendChild(dot);
    }

    const labelText = document.createElement("span");
    labelText.className = "text-gray-200 ";
    labelText.innerHTML =
      pct != null
        ? `${name}<span class="text-zinc-400">(${pct.toFixed(2)}%)</span>`
        : name;
    left.appendChild(labelText);

    const dotted = document.createElement("div");
    dotted.className = "flex-1 border-t border-dashed border-emerald-200 mx-3";

    const amount = document.createElement("span");
    amount.style.background = gradientStyle;
    amount.style.webkitBackgroundClip = "text";
    amount.style.webkitTextFillColor = "transparent";
    amount.style.fontWeight = "600";
    amount.textContent = formatCurrency(value);

    row.appendChild(left);
    row.appendChild(dotted);
    row.appendChild(amount);

    deductionInputsContainer.appendChild(row);
  });

  applyDeductionsVisibility();
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

function validateAgeGroup() {
  const selectedAge = ageDropdownSelected.textContent;
  if (!selectedAge || selectedAge === "Choose your age range") {
    showError(ageRangeError, "Please select your age group.");
    return false;
  }
  clearError(ageRangeError);
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
function renderDeductionsProgressBar(deductions) {
  const segmentsEl = document.getElementById("taxes-bar-segments");
  if (!segmentsEl) return;

  const gross = calculatorState.annualIncome || 0;
  if (gross <= 0) {
    segmentsEl.innerHTML = "";
    return;
  }

  const hexMap = {
    federal_tax: "#D6426C",
    provincial_tax: "#9D88E1",
    cpp: "#8DE188",
    ei: "#3364E1",
    take_home: "#FB725A",
  };

  // Build ordered segments
  const orderedKeys = ["federal_tax", "provincial_tax", "cpp", "ei"];
  const widths = [];
  let totalDeductPct = 0;

  orderedKeys.forEach((key) => {
    const d = deductions[key];
    if (!d) return;
    const pct = Math.max(0, Math.min(100, (d.amount / gross) * 100));
    totalDeductPct += pct;
    widths.push({ key, pct });
  });

  const takeHomePct = Math.max(0, 100 - totalDeductPct);
  segmentsEl.innerHTML = "";

  // Render deduction segments with exact hex colors
  widths.forEach(({ key, pct }) => {
    const seg = document.createElement("div");
    seg.className = "h-full";
    seg.style.background = hexMap[key] || "#64748b"; // slate fallback
    seg.style.width = `${pct}%`;
    segmentsEl.appendChild(seg);
  });

  // Render take-home segment last with exact hex color
  const takeHomeSeg = document.createElement("div");
  takeHomeSeg.className = "h-full";
  takeHomeSeg.style.background = hexMap.take_home;
  takeHomeSeg.style.width = `${takeHomePct}%`;
  segmentsEl.appendChild(takeHomeSeg);
}

function handlePrimaryInputChange() {
  if (
    !validateAgeGroup() ||
    !validateAnnualIncome() ||
    !validateProvince() ||
    !validateRetirementPercentage()
  ) {
    return;
  }

  // Read inputs from DOM and update state
  calculatorState.annualIncome = parseFloat(annualIncomeInput.value);
  calculatorState.province = provinceSelect.value;
  calculatorState.ageGroup = ageDropdownSelected.textContent;
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
  renderDeductionsProgressBar(deductions);
  // totalAnnualDeductionsSpan.textContent = formatCurrency(totalDeductions);
  // annualDisposableIncomeSpan.textContent = formatCurrency(
  //   calculatorState.annualDisposable
  // );
  // monthlyDisposableIncomeSpan.textContent = formatCurrency(
  //   calculatorState.monthlyDisposableIncome
  // );

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
  // Don't return early - let the function run to update UI even with no income

  console.log("=== HANDLE EXPENSE CHANGE START ===");
  console.log("Savings input value:", savingsPercentageInput.value);
  console.log("Investments input value:", investmentsPercentageInput.value);

  // 1. Gather all current living expenses from inputs
  let totalExpenses = 0;
  const currentExpenses = {};
  const expenseInputs = document.querySelectorAll(
    '#living-expenses-section input[type="number"]'
  );
  if (expenseInputs && expenseInputs.length > 0) {
    expenseInputs.forEach((input) => {
      const value = parseFloat(input.value) || 0;
      // Use the id as the key (e.g., 'rent-mortgage')
      const key = input.id;
      currentExpenses[key] = value;
      totalExpenses += value;
    });
  }
  calculatorState.totalMonthlyExpensesEntered = totalExpenses;
  calculatorState.livingExpenses = currentExpenses;
  calculatorState.hasEnteredExpenses = totalExpenses > 0;

  // 2. Gather custom allocation percentages (these are now meant to be percentages of DISPOSABLE INCOME)
  const userSavingsPct = parseFloat(savingsPercentageInput.value);
  const userInvestmentsPct = parseFloat(investmentsPercentageInput.value);

  console.log("=== HANDLE EXPENSE CHANGE DEBUG ===");
  console.log("User savings % from input:", userSavingsPct);
  console.log("User investments % from input:", userInvestmentsPct);
  console.log("Annual income:", calculatorState.annualIncome);
  console.log("Province:", calculatorState.province);
  console.log("Living expenses:", calculatorState.livingExpenses);

  // 3. Perform the main budget calculation with all current data
  const budget = calculateBudget(
    calculatorState.annualIncome,
    calculatorState.province,
    calculatorState.livingExpenses,
    calculatorState.retirementPercentage,
    userSavingsPct,
    userInvestmentsPct
  );

  console.log("Budget calculation result:");
  console.log("Total monthly expenses:", budget.total_monthly_expenses);
  console.log("Recommended savings %:", budget.recommended_savings_pct);
  console.log("Recommended investments %:", budget.recommended_investments_pct);
  console.log(
    "Recommended savings amount:",
    budget.recommended_allocations.monthly_savings
  );
  console.log(
    "Recommended investments amount:",
    budget.recommended_allocations.monthly_investments
  );

  // Store the current budget in calculatorState for access by other functions
  calculatorState.currentBudget = budget;

  // 4. Update all UI elements with the new budget data
  updateAllUI(budget);

  // Update charts immediately when budget data becomes available
  updateAllCustomProjectionCharts();
}

/**
 * Updates all UI components based on the comprehensive budget object.
 */
function updateChartButtonStates(budget) {
  // Get button elements for recommended allocations
  const savingsChartBtn = document.getElementById("savingsChartBtn");
  const investmentsChartBtn = document.getElementById("investmentsChartBtn");
  const bothChartBtn = document.getElementById("bothChartBtn");

  // Get button elements for custom allocations
  const customSavingsChartBtn = document.getElementById(
    "customSavingsChartBtn"
  );
  const customInvestmentsChartBtn = document.getElementById(
    "customInvestmentsChartBtn"
  );
  const customBothChartBtn = document.getElementById("customBothChartBtn");

  // Helper function to disable/enable a button
  const setButtonState = (button, isEnabled) => {
    if (!button) return;

    if (isEnabled) {
      button.disabled = false;
      button.style.opacity = "1";
      button.style.cursor = "pointer";
      button.style.pointerEvents = "auto";
    } else {
      button.disabled = true;
      button.style.opacity = "0.5";
      button.style.cursor = "not-allowed";
      button.style.pointerEvents = "none";
    }
  };

  // Check recommended allocations percentages
  const recommendedSavingsAmount =
    budget.recommended_allocations.monthly_savings;
  const recommendedInvestmentsAmount =
    budget.recommended_allocations.monthly_investments;
  const hasSavings = recommendedSavingsAmount > 0;
  const hasInvestments = recommendedInvestmentsAmount > 0;

  // Update recommended allocation buttons
  setButtonState(savingsChartBtn, hasSavings);
  setButtonState(investmentsChartBtn, hasInvestments);
  setButtonState(bothChartBtn, hasSavings && hasInvestments);

  // If all buttons are disabled, we need to handle the chart display
  if (!hasSavings && !hasInvestments) {
    // Disable all buttons
    setButtonState(savingsChartBtn, false);
    setButtonState(investmentsChartBtn, false);
    setButtonState(bothChartBtn, false);
  }

  // Check custom allocations percentages (fallback to recommended if custom is not set)
  let customSavingsAmount = 0;
  let customInvestmentsAmount = 0;

  if (budget.custom_allocations) {
    customSavingsAmount = budget.custom_allocations.monthly_savings;
    customInvestmentsAmount = budget.custom_allocations.monthly_investments;
  } else {
    // Fallback so custom tabs stay usable
    customSavingsAmount = budget.recommended_allocations.monthly_savings;
    customInvestmentsAmount =
      budget.recommended_allocations.monthly_investments;
  }

  const hasCustomSavings = customSavingsAmount > 0;
  const hasCustomInvestments = customInvestmentsAmount > 0;

  // Update custom allocation buttons (now stay enabled with fallback)
  setButtonState(customSavingsChartBtn, hasCustomSavings);
  setButtonState(customInvestmentsChartBtn, hasCustomInvestments);
  setButtonState(customBothChartBtn, hasCustomSavings && hasCustomInvestments);

  // If all custom buttons are disabled
  if (!hasCustomSavings && !hasCustomInvestments) {
    setButtonState(customSavingsChartBtn, false);
    setButtonState(customInvestmentsChartBtn, false);
    setButtonState(customBothChartBtn, false);
  }

  // Switch to an enabled button if current selection is disabled
  const currentChartType = calculatorState.compoundInterest.currentChartType;
  const customCurrentChartType =
    calculatorState.customCompoundInterest.currentChartType;

  // Handle recommended allocations chart type switching
  if (currentChartType === "investments" && !hasInvestments && hasSavings) {
    calculatorState.compoundInterest.currentChartType = "savings";
    if (savingsChartBtn) {
      const updateActiveButton = (activeBtn) => {
        [savingsChartBtn, investmentsChartBtn, bothChartBtn].forEach((btn) => {
          if (btn) {
            btn.classList.remove("chart-btn-active");
            btn.classList.add("chart-btn-inactive");
            btn.classList.remove("shadow-lg", "transform", "scale-110");
            btn.classList.add("shadow-md");
            btn.className = btn.className.replace(
              /bg-gradient-to-r from-emerald-600 to-emerald-700/g,
              "bg-gradient-to-r from-emerald-400/60 to-emerald-500/60"
            );
          }
        });
        if (activeBtn) {
          activeBtn.classList.remove("chart-btn-inactive");
          activeBtn.classList.add("chart-btn-active");
          activeBtn.classList.remove("shadow-md");
          activeBtn.classList.add("shadow-lg", "transform", "scale-110");
          activeBtn.className = activeBtn.className.replace(
            /bg-gradient-to-r from-emerald-400\/60 to-emerald-500\/60/g,
            "bg-gradient-to-r from-emerald-600 to-emerald-700"
          );
        }
      };
      updateActiveButton(savingsChartBtn);
    }
  } else if (currentChartType === "both" && (!hasSavings || !hasInvestments)) {
    if (hasSavings) {
      calculatorState.compoundInterest.currentChartType = "savings";
      if (savingsChartBtn) {
        const updateActiveButton = (activeBtn) => {
          [savingsChartBtn, investmentsChartBtn, bothChartBtn].forEach(
            (btn) => {
              if (btn) {
                btn.classList.remove("chart-btn-active");
                btn.classList.add("chart-btn-inactive");
                btn.classList.remove("shadow-lg", "transform", "scale-110");
                btn.classList.add("shadow-md");
                btn.className = btn.className.replace(
                  /bg-gradient-to-r from-emerald-600 to-emerald-700/g,
                  "bg-gradient-to-r from-emerald-400/60 to-emerald-500/60"
                );
              }
            }
          );
          if (activeBtn) {
            activeBtn.classList.remove("chart-btn-inactive");
            activeBtn.classList.add("chart-btn-active");
            activeBtn.classList.remove("shadow-md");
            activeBtn.classList.add("shadow-lg", "transform", "scale-110");
            activeBtn.className = activeBtn.className.replace(
              /bg-gradient-to-r from-emerald-400\/60 to-emerald-500\/60/g,
              "bg-gradient-to-r from-emerald-600 to-emerald-700"
            );
          }
        };
        updateActiveButton(savingsChartBtn);
      }
    } else if (hasInvestments) {
      calculatorState.compoundInterest.currentChartType = "investments";
      if (investmentsChartBtn) {
        const updateActiveButton = (activeBtn) => {
          [savingsChartBtn, investmentsChartBtn, bothChartBtn].forEach(
            (btn) => {
              if (btn) {
                btn.classList.remove("chart-btn-active");
                btn.classList.add("chart-btn-inactive");
                btn.classList.remove("shadow-lg", "transform", "scale-110");
                btn.classList.add("shadow-md");
                btn.className = btn.className.replace(
                  /bg-gradient-to-r from-emerald-600 to-emerald-700/g,
                  "bg-gradient-to-r from-emerald-400/60 to-emerald-500/60"
                );
              }
            }
          );
          if (activeBtn) {
            activeBtn.classList.remove("chart-btn-inactive");
            activeBtn.classList.add("chart-btn-active");
            activeBtn.classList.remove("shadow-md");
            activeBtn.classList.add("shadow-lg", "transform", "scale-110");
            activeBtn.className = activeBtn.className.replace(
              /bg-gradient-to-r from-emerald-400\/60 to-emerald-500\/60/g,
              "bg-gradient-to-r from-emerald-600 to-emerald-700"
            );
          }
        };
        updateActiveButton(investmentsChartBtn);
      }
    }
  }

  // Handle custom allocations chart type switching
  if (
    customCurrentChartType === "investments" &&
    !hasCustomInvestments &&
    hasCustomSavings
  ) {
    calculatorState.customCompoundInterest.currentChartType = "savings";
    if (customSavingsChartBtn) {
      const updateCustomActiveButton = (activeBtn) => {
        [
          customSavingsChartBtn,
          customInvestmentsChartBtn,
          customBothChartBtn,
        ].forEach((btn) => {
          if (btn) {
            btn.classList.remove("chart-btn-active");
            btn.classList.add("chart-btn-inactive");
            btn.classList.remove("shadow-lg", "transform", "scale-110");
            btn.classList.add("shadow-md");
            btn.className = btn.className.replace(
              /bg-gradient-to-r from-emerald-600 to-emerald-700/g,
              "bg-gradient-to-r from-emerald-400/60 to-emerald-500/60"
            );
          }
        });
        if (activeBtn) {
          activeBtn.classList.remove("chart-btn-inactive");
          activeBtn.classList.add("chart-btn-active");
          activeBtn.classList.remove("shadow-md");
          activeBtn.classList.add("shadow-lg", "transform", "scale-110");
          activeBtn.className = activeBtn.className.replace(
            /bg-gradient-to-r from-emerald-400\/60 to-emerald-500\/60/g,
            "bg-gradient-to-r from-emerald-600 to-emerald-700"
          );
        }
      };
      updateCustomActiveButton(customSavingsChartBtn);
    }
  } else if (
    customCurrentChartType === "both" &&
    (!hasCustomSavings || !hasCustomInvestments)
  ) {
    if (hasCustomSavings) {
      calculatorState.customCompoundInterest.currentChartType = "savings";
      if (customSavingsChartBtn) {
        const updateCustomActiveButton = (activeBtn) => {
          [
            customSavingsChartBtn,
            customInvestmentsChartBtn,
            customBothChartBtn,
          ].forEach((btn) => {
            if (btn) {
              btn.classList.remove("chart-btn-active");
              btn.classList.add("chart-btn-inactive");
              btn.classList.remove("shadow-lg", "transform", "scale-110");
              btn.classList.add("shadow-md");
              btn.className = btn.className.replace(
                /bg-gradient-to-r from-emerald-600 to-emerald-700/g,
                "bg-gradient-to-r from-emerald-400/60 to-emerald-500/60"
              );
            }
          });
          if (activeBtn) {
            activeBtn.classList.remove("chart-btn-inactive");
            activeBtn.classList.add("chart-btn-active");
            activeBtn.classList.remove("shadow-md");
            activeBtn.classList.add("shadow-lg", "transform", "scale-110");
            activeBtn.className = activeBtn.className.replace(
              /bg-gradient-to-r from-emerald-400\/60 to-emerald-500\/60/g,
              "bg-gradient-to-r from-emerald-600 to-emerald-700"
            );
          }
        };
        updateCustomActiveButton(customSavingsChartBtn);
      }
    } else if (hasCustomInvestments) {
      calculatorState.customCompoundInterest.currentChartType = "investments";
      if (customInvestmentsChartBtn) {
        const updateCustomActiveButton = (activeBtn) => {
          [
            customSavingsChartBtn,
            customInvestmentsChartBtn,
            customBothChartBtn,
          ].forEach((btn) => {
            if (btn) {
              btn.classList.remove("chart-btn-active");
              btn.classList.add("chart-btn-inactive");
              btn.classList.remove("shadow-lg", "transform", "scale-110");
              btn.classList.add("shadow-md");
              btn.className = btn.className.replace(
                /bg-gradient-to-r from-emerald-600 to-emerald-700/g,
                "bg-gradient-to-r from-emerald-400/60 to-emerald-500/60"
              );
            }
          });
          if (activeBtn) {
            activeBtn.classList.remove("chart-btn-inactive");
            activeBtn.classList.add("chart-btn-active");
            activeBtn.classList.remove("shadow-md");
            activeBtn.classList.add("shadow-lg", "transform", "scale-110");
            activeBtn.className = activeBtn.className.replace(
              /bg-gradient-to-r from-emerald-400\/60 to-emerald-500\/60/g,
              "bg-gradient-to-r from-emerald-600 to-emerald-700"
            );
          }
        };
        updateCustomActiveButton(customInvestmentsChartBtn);
      }
    }
  }
}

function updateAllUI(budget) {
  // Update category summary if it exists
  updateExpenseCategorySummary(budget);

  // Update Progress Bar Indicator
  updateProgressBar(budget.expenses_percentage);

  // Update the new simple bar under the legend
  updateExpenseHealthBar(budget);

  // Update Budget Zone coloring
  const zoneColors = {
    GREEN: { bg: "bg-green-500/20", border: "border-green-500/50" },
    MODERATE: { bg: "bg-yellow-500/20", border: "border-yellow-500/50" },
    RED: { bg: "bg-red-500/20", border: "border-red-500/50" },
    "EXTREME RED": { bg: "bg-red-900/30", border: "border-red-700/70" },
  };
  const zoneColor = budget.budget_zone
    ? zoneColors[budget.budget_zone]
    : { bg: "", border: "" };

  // Enable/disable and configure the Savings & Investments section
  console.log(
    "Debug: budget.total_monthly_expenses =",
    budget.total_monthly_expenses
  );
  console.log(
    "Debug: typeof budget.total_monthly_expenses =",
    typeof budget.total_monthly_expenses
  );

  // Only unlock Savings & Investments once the user has typed at least one expense
  const hasAnyExpense = budget.total_monthly_expenses > 0;
  if (hasAnyExpense) {
    console.log("Debug: Removing opacity from savings section");
    console.log(
      "savingsInvestmentsSection element:",
      savingsInvestmentsSection
    );
    if (savingsInvestmentsSection) {
      savingsInvestmentsSection.classList.remove(
        "opacity-50",
        "pointer-events-none"
      );
      savingsInvestmentsSection.classList.add("animate-fade-in");
      console.log(
        "Debug: Savings section classes after update:",
        savingsInvestmentsSection.className
      );
    } else {
      console.log("Debug: savingsInvestmentsSection element not found!");
    }
  } else {
    console.log(
      "Debug: Savings section stays locked – no expenses entered yet"
    );
  }
  const isEnabledInputs = !!calculatorState.customSavingsToggleEnabled;
  savingsPercentageInput.disabled = !isEnabledInputs;
  investmentsPercentageInput.disabled = !isEnabledInputs;
  customSavingsAmountInput.disabled = !isEnabledInputs;
  customInvestmentsAmountInput.disabled = !isEnabledInputs;

  // Apply field appearance updates
  const isCustomToggleEnabled =
    calculatorState.customSavingsToggleEnabled || false;
  // Update field appearance based on enabled state
  const updateFieldAppearance = (input, enabled) => {
    if (enabled) {
      input.classList.remove("opacity-50", "cursor-not-allowed");
      input.classList.add("cursor-text");
    } else {
      input.classList.add("opacity-50", "cursor-not-allowed");
      input.classList.remove("cursor-text");
    }
  };

  // Apply field appearance updates
  updateFieldAppearance(
    savingsPercentageInput,
    !savingsPercentageInput.disabled
  );
  updateFieldAppearance(
    investmentsPercentageInput,
    !investmentsPercentageInput.disabled
  );
  updateFieldAppearance(
    customSavingsAmountInput,
    !customSavingsAmountInput.disabled
  );
  updateFieldAppearance(
    customInvestmentsAmountInput,
    !customInvestmentsAmountInput.disabled
  );

  if (siGuidanceP) {
    siGuidanceP.textContent =
      "For sustainable wealth creation, view our recommended allocations below.";
  }

  // Update Recommended Allocations Display (only update elements that exist)
  const recommendedSavingsAmountEl = document.getElementById(
    "recommended-savings-amount"
  );
  const recommendedInvestmentsAmountEl = document.getElementById(
    "recommended-investments-amount"
  );
  const recommendedCashflowAmountEl = document.getElementById(
    "recommended-cashflow-amount"
  );
  const recommendedSavingsPctEl = document.getElementById(
    "recommended-savings-percentage"
  );
  const recommendedInvestmentsPctEl = document.getElementById(
    "recommended-investments-percentage"
  );
  const recommendedCashflowPctEl = document.getElementById(
    "recommended-cashflow-percentage"
  );

  if (recommendedSavingsAmountEl)
    recommendedSavingsAmountEl.textContent = formatCurrency(
      budget.recommended_allocations.monthly_savings
    );
  if (recommendedInvestmentsAmountEl)
    recommendedInvestmentsAmountEl.textContent = formatCurrency(
      budget.recommended_allocations.monthly_investments
    );
  if (recommendedCashflowAmountEl)
    recommendedCashflowAmountEl.textContent = formatCurrency(
      budget.recommended_allocations.monthly_cashflow
    );
  if (recommendedSavingsPctEl)
    recommendedSavingsPctEl.textContent = `${budget.recommended_savings_pct.toFixed(
      1
    )}%`;
  if (recommendedInvestmentsPctEl)
    recommendedInvestmentsPctEl.textContent = `${budget.recommended_investments_pct.toFixed(
      1
    )}%`;
  if (recommendedCashflowPctEl)
    recommendedCashflowPctEl.textContent = `(${budget.recommended_cashflow_pct.toFixed(
      1
    )}%)`;

  // Debug logging
  console.log("=== UPDATE ALL UI DEBUG ===");
  console.log("Total monthly expenses:", budget.total_monthly_expenses);
  console.log("Recommended savings %:", budget.recommended_savings_pct);
  console.log("Recommended investments %:", budget.recommended_investments_pct);
  console.log(
    "Recommended savings amount:",
    budget.recommended_allocations.monthly_savings
  );
  console.log(
    "Recommended investments amount:",
    budget.recommended_allocations.monthly_investments
  );
  console.log("Current savings % input:", savingsPercentageInput.value);
  console.log("Current investments % input:", investmentsPercentageInput.value);
  console.log("Custom allocations available:", !!budget.custom_allocations);

  // Auto-populate defaults when user has not entered custom values yet
  const isSavingsPctEmpty =
    savingsPercentageInput.value === "" || savingsPercentageInput.value === "0";
  const isInvestPctEmpty =
    investmentsPercentageInput.value === "" ||
    investmentsPercentageInput.value === "0";
  const isSavingsAmtEmpty =
    !customSavingsAmountInput.value ||
    customSavingsAmountInput.value.trim() === "" ||
    customSavingsAmountInput.value === "$0.00";
  const isInvestAmtEmpty =
    !customInvestmentsAmountInput.value ||
    customInvestmentsAmountInput.value.trim() === "" ||
    customInvestmentsAmountInput.value === "$0.00";

  console.log("Field empty states:");
  console.log(
    "Is savings % empty?",
    isSavingsPctEmpty,
    "(value:",
    savingsPercentageInput.value,
    ")"
  );
  console.log(
    "Is investments % empty?",
    isInvestPctEmpty,
    "(value:",
    investmentsPercentageInput.value,
    ")"
  );
  console.log(
    "Is savings amount empty?",
    isSavingsAmtEmpty,
    "(value:",
    customSavingsAmountInput.value,
    ")"
  );
  console.log(
    "Is investments amount empty?",
    isInvestAmtEmpty,
    "(value:",
    customInvestmentsAmountInput.value,
    ")"
  );
  console.log("Has custom savings?", calculatorState.hasCustomSavings);
  console.log("Has custom investments?", calculatorState.hasCustomInvestments);

  // Check if this is the first time auto-populating (fields are empty) OR if recommended values have changed
  const currentSavingsPct = parseFloat(savingsPercentageInput.value) || 0;
  const currentInvestPct = parseFloat(investmentsPercentageInput.value) || 0;
  const recommendedSavingsPct = budget.recommended_savings_pct;
  const recommendedInvestPct = budget.recommended_investments_pct;

  // Check if recommended values have changed significantly (more than 0.01%)
  // BUT skip this check if the user is currently editing the field
  const isUserEditingSavings = savingsPercentageInput.matches(":focus");
  const isUserEditingInvestments = investmentsPercentageInput.matches(":focus");

  const hasRecommendedValuesChanged =
    (!isUserEditingSavings &&
      Math.abs(currentSavingsPct - recommendedSavingsPct) > 0.01) ||
    (!isUserEditingInvestments &&
      Math.abs(currentInvestPct - recommendedInvestPct) > 0.01);

  console.log(
    "Current savings %:",
    currentSavingsPct,
    "Recommended:",
    recommendedSavingsPct
  );
  console.log(
    "Current investments %:",
    currentInvestPct,
    "Recommended:",
    recommendedInvestPct
  );
  console.log("Have recommended values changed?", hasRecommendedValuesChanged);

  // Auto-populate recommended values when:
  // 1. Fields are empty/0 (first time), OR
  // 2. Recommended values have changed due to expense updates AND user hasn't entered custom values
  // 3. BUT NOT when user is actively editing (difference is due to user input, not expense changes)
  // 4. AND only when custom toggle is disabled (user wants recommended values)
  const shouldAutoPopulate =
    !calculatorState.customSavingsToggleEnabled &&
    (isSavingsPctEmpty ||
      isInvestPctEmpty ||
      isSavingsAmtEmpty ||
      isInvestAmtEmpty ||
      (hasRecommendedValuesChanged &&
        !calculatorState.hasCustomSavings &&
        !calculatorState.hasCustomInvestments));

  console.log("=== AUTO-POPULATION DECISION ===");
  console.log("Should auto-populate?", shouldAutoPopulate);
  console.log(
    "Is custom toggle enabled?",
    calculatorState.customSavingsToggleEnabled
  );
  console.log("Is savings field empty?", isSavingsPctEmpty);
  console.log("Is investments field empty?", isInvestPctEmpty);
  console.log("Has custom savings?", calculatorState.hasCustomSavings);
  console.log("Has custom investments?", calculatorState.hasCustomInvestments);
  console.log("Recommended values changed?", hasRecommendedValuesChanged);
  console.log("Is user editing savings?", isUserEditingSavings);
  console.log("Is user editing investments?", isUserEditingInvestments);
  console.log("Current savings % input:", savingsPercentageInput.value);
  console.log("Current investments % input:", investmentsPercentageInput.value);
  console.log("Recommended savings %:", budget.recommended_savings_pct);
  console.log("Recommended investments %:", budget.recommended_investments_pct);

  if (shouldAutoPopulate) {
    console.log("🎯 Auto-population condition MET - updating fields");

    // Update charts immediately when auto-populating recommended values
    updateAllCustomProjectionCharts();

    // Only update fields if user hasn't entered custom values (unless fields are empty)
    // AND don't update if user is currently editing that field
    if (
      (isSavingsPctEmpty && !isUserEditingSavings) ||
      (!calculatorState.hasCustomSavings &&
        hasRecommendedValuesChanged &&
        !isUserEditingSavings)
    ) {
      console.log(
        "✅ Setting savings % to:",
        budget.recommended_savings_pct.toFixed(1)
      );
      savingsPercentageInput.value = budget.recommended_savings_pct.toFixed(1);
    }
    if (
      (isInvestPctEmpty && !isUserEditingInvestments) ||
      (!calculatorState.hasCustomInvestments &&
        hasRecommendedValuesChanged &&
        !isUserEditingInvestments)
    ) {
      console.log(
        "✅ Setting investments % to:",
        budget.recommended_investments_pct.toFixed(1)
      );
      investmentsPercentageInput.value =
        budget.recommended_investments_pct.toFixed(1);
    }
    if (
      isSavingsAmtEmpty ||
      (!calculatorState.hasCustomSavings && hasRecommendedValuesChanged)
    ) {
      console.log(
        "✅ Setting savings amount to:",
        budget.recommended_allocations.monthly_savings
      );
      customSavingsAmountInput.value = formatCurrency(
        budget.recommended_allocations.monthly_savings
      );
    }
    if (
      isInvestAmtEmpty ||
      (!calculatorState.hasCustomInvestments && hasRecommendedValuesChanged)
    ) {
      console.log(
        "✅ Setting investments amount to:",
        budget.recommended_allocations.monthly_investments
      );
      customInvestmentsAmountInput.value = formatCurrency(
        budget.recommended_allocations.monthly_investments
      );
    }
  } else {
    console.log("❌ Auto-population condition NOT MET");
    console.log(
      "Custom toggle enabled?",
      calculatorState.customSavingsToggleEnabled
    );
    console.log("Has custom savings?", calculatorState.hasCustomSavings);
    console.log(
      "Has custom investments?",
      calculatorState.hasCustomInvestments
    );
    console.log(
      "Any field empty?",
      isSavingsPctEmpty ||
        isInvestPctEmpty ||
        isSavingsAmtEmpty ||
        isInvestAmtEmpty
    );
    console.log("Recommended values changed?", hasRecommendedValuesChanged);
  }

  // Store monthly investment amount in localStorage for use in investment calculator
  const monthlyInvestmentAmount = budget.custom_allocations
    ? budget.custom_allocations.monthly_investments
    : budget.recommended_allocations.monthly_investments;

  // Convert monthly to annual amount (investment calculator expects annual contributions)
  const annualInvestmentAmount = monthlyInvestmentAmount * 12;
  localStorage.setItem(
    "budgetMonthlyInvestment",
    monthlyInvestmentAmount.toString()
  );
  localStorage.setItem(
    "budgetAnnualInvestment",
    annualInvestmentAmount.toString()
  );

  // Update Custom Allocations Display (Amounts and Percentages)
  const userEnteredSavingsPct = parseFloat(savingsPercentageInput.value);
  const userEnteredInvestmentsPct = parseFloat(
    investmentsPercentageInput.value
  );

  // Check if this is the first time we're showing recommended values (auto-population case)
  const isFirstTimeRecommended =
    (savingsPercentageInput.value === "" ||
      savingsPercentageInput.value === "0") &&
    (investmentsPercentageInput.value === "" ||
      investmentsPercentageInput.value === "0") &&
    budget.total_monthly_expenses > 0;

  console.log("isFirstTimeRecommended:", isFirstTimeRecommended);
  console.log("savingsPercentageInput.value:", savingsPercentageInput.value);
  console.log(
    "investmentsPercentageInput.value:",
    investmentsPercentageInput.value
  );

  const hasAnyUserCustomInputForCashflow =
    (!isNaN(userEnteredSavingsPct) &&
      savingsPercentageInput.value !== "" &&
      savingsPercentageInput.value !== "0" &&
      !isFirstTimeRecommended) ||
    (!isNaN(userEnteredInvestmentsPct) &&
      investmentsPercentageInput.value !== "" &&
      investmentsPercentageInput.value !== "0" &&
      !isFirstTimeRecommended);

  // Custom Savings Amount - ensure synchronization with percentage
  if (
    savingsPercentageInput.value === "0" ||
    savingsPercentageInput.value === ""
  ) {
    // If percentage is explicitly 0 or empty, show $0.00
    if (!customSavingsAmountInput.matches(":focus")) {
      customSavingsAmountInput.value = formatCurrency(0);
    }
  } else if (
    !isNaN(userEnteredSavingsPct) &&
    savingsPercentageInput.value !== "" &&
    !isFirstTimeRecommended
  ) {
    // Only update the amount field if the user hasn't directly edited it
    if (!customSavingsAmountInput.matches(":focus")) {
      customSavingsAmountInput.value = formatCurrency(
        budget.custom_allocations
          ? budget.custom_allocations.monthly_savings
          : 0
      );
    }
  } else {
    // If user hasn't provided a custom percentage, keep showing recommended amount
    if (!customSavingsAmountInput.matches(":focus")) {
      customSavingsAmountInput.value = formatCurrency(
        budget.recommended_allocations.monthly_savings || 0
      );
    }
  }

  // Custom Investments Amount - ensure synchronization with percentage
  if (
    investmentsPercentageInput.value === "0" ||
    investmentsPercentageInput.value === ""
  ) {
    // If percentage is explicitly 0 or empty, show $0.00
    if (!customInvestmentsAmountInput.matches(":focus")) {
      customInvestmentsAmountInput.value = formatCurrency(0);
    }
  } else if (
    !isNaN(userEnteredInvestmentsPct) &&
    investmentsPercentageInput.value !== "" &&
    !isFirstTimeRecommended
  ) {
    // Only update the amount field if the user hasn't directly edited it
    if (!customInvestmentsAmountInput.matches(":focus")) {
      customInvestmentsAmountInput.value = formatCurrency(
        budget.custom_allocations
          ? budget.custom_allocations.monthly_investments
          : 0
      );
    }
  } else {
    // If user hasn't provided a custom percentage, keep showing recommended amount
    if (!customInvestmentsAmountInput.matches(":focus")) {
      customInvestmentsAmountInput.value = formatCurrency(
        budget.recommended_allocations.monthly_investments || 0
      );
    }
  }

  if (!calculatorState.customSavingsToggleEnabled) {
    const sPctVal = parseFloat(savingsPercentageInput.value) || 0;
    const iPctVal = parseFloat(investmentsPercentageInput.value) || 0;

    // Update savings amount based on percentage (including 0%)
    if (!customSavingsAmountInput.matches(":focus")) {
      if (sPctVal > 0) {
        const sAmtVal = (sPctVal / 100) * budget.monthly_disposable_income;
        customSavingsAmountInput.value = formatCurrency(sAmtVal);
      } else {
        customSavingsAmountInput.value = formatCurrency(0);
      }
    }

    // Update investments amount based on percentage (including 0%)
    if (!customInvestmentsAmountInput.matches(":focus")) {
      if (iPctVal > 0) {
        const iAmtVal = (iPctVal / 100) * budget.monthly_disposable_income;
        customInvestmentsAmountInput.value = formatCurrency(iAmtVal);
      } else {
        customInvestmentsAmountInput.value = formatCurrency(0);
      }
    }
  }

  // Custom Cashflow Amount and Percentage
  if (hasAnyUserCustomInputForCashflow) {
    if (budget.custom_allocations) {
      document.getElementById("customCashflowAmount").textContent =
        formatCurrency(budget.custom_allocations.monthly_cashflow);
      document.getElementById(
        "customCashflowPercentage"
      ).textContent = `(${budget.custom_cashflow_pct.toFixed(1)}%)`;
    } else {
      document.getElementById("customCashflowAmount").textContent =
        formatCurrency(0);
      document.getElementById(
        "customCashflowPercentage"
      ).textContent = `(0.0%)`;
    }
  } else {
    // If no custom percentages for S&I, custom cashflow is just disposable income minus expenses
    const currentCashflowAmount =
      budget.monthly_disposable_income - budget.total_monthly_expenses;
    const currentCashflowPct = 100 - budget.expenses_percentage;
    document.getElementById("customCashflowAmount").textContent =
      formatCurrency(currentCashflowAmount);
    document.getElementById(
      "customCashflowPercentage"
    ).textContent = `(${currentCashflowPct.toFixed(1)}%)`;
  }

  // === START: CTA DISPLAY LOGIC ===
  const ctaSection = document.getElementById("recommended-cashflow-cta");
  const ctaMessage = document.getElementById("cta-message");
  const MIN_CASHFLOW_PCT = 10;

  if (budget.monthly_disposable_income > 0) {
    ctaSection.classList.remove("hidden");

    const cashflowToCheck = budget.custom_allocations
      ? budget.custom_allocations.monthly_cashflow
      : budget.recommended_allocations.monthly_cashflow;
    const cashflowPctToCheck = budget.custom_allocations
      ? budget.custom_cashflow_pct
      : budget.recommended_cashflow_pct;

    if (cashflowPctToCheck < MIN_CASHFLOW_PCT) {
      // Caution message
      ctaMessage.innerHTML = `<strong class="font-semibold">Great Job, lets walk you through a clear next step to build sustainable wealth</strong>`;

      // Remove any background colors; only use border for emphasis
      ctaSection.classList.remove("bg-white/5", "bg-red-900/30");
      ctaSection.classList.remove("border-white/10");
      ctaSection.classList.add("border-red-500/50");
    } else {
      // Standard message
      ctaMessage.innerHTML = `<strong class="font-semibold">Great Job, lets walk you through a clear next step to build sustainable wealth</strong>`;

      // Remove any background colors; only use border for normal state
      ctaSection.classList.remove("bg-white/5", "bg-red-900/30");
      ctaSection.classList.remove("border-red-500/50");
      ctaSection.classList.add("border-white/10");
    }
  } else {
    ctaSection.classList.add("hidden");
  }
  // === END: CTA DISPLAY LOGIC ===

  // Update individual expense percentage labels
  updateExpensePercentageLabels(budget.monthly_disposable_income);

  // Update the projection chart with the new budget data
  updateProjectionChart();

  // Render all custom projection charts stacked
  updateAllCustomProjectionCharts();

  // Update chart button states based on budget data
  updateChartButtonStates(budget);
  updateProjectionChart();

  // Render all custom projection charts stacked
  updateAllCustomProjectionCharts();
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
        )} (${formatPercentage(totalPercentage)} of your Take-Home Pay)`;
      } else {
        categoryTotalSpan.textContent = "";
      }
    }
  }
}

// Attaches event listeners to DOM elements.

function setupEventListeners() {
  // Primary income and deduction inputs
  annualIncomeInput.addEventListener("focus", switchToTaxesTab);
  annualIncomeInput.addEventListener("input", () => {
    switchToTaxesTab();
    handlePrimaryInputChange();
  });
  provinceSelect.addEventListener("change", () => {
    switchToTaxesTab();
    handlePrimaryInputChange();
  });
  includeRetirementCheckbox.addEventListener("change", () => {
    switchToTaxesTab();
    toggleRetirementSection(true);
    handlePrimaryInputChange();
  });
  excludeRetirementCheckbox.addEventListener("change", () => {
    switchToTaxesTab();
    toggleRetirementSection(false);
    if (excludeRetirementCheckbox.checked) {
      retirementPercentageInput.value = "";
    }
    handlePrimaryInputChange();
  });
  retirementPercentageInput.addEventListener("input", () => {
    switchToTaxesTab();
    if (validateRetirementPercentage()) {
      handlePrimaryInputChange();
    }
  });

  // Custom Allocations Toggle Button
  const toggleCustomAllocationsBtn = document.getElementById(
    "toggleCustomAllocationsBtn"
  );

  const customAllocationsSection = document.getElementById(
    "customAllocationsSection"
  );

  // Ensure visible by default; no toggle behavior
  if (customAllocationsSection) {
    customAllocationsSection.classList.remove("hidden");
    customAllocationsSection.style.overflow = "visible";
    customAllocationsSection.style.maxHeight = "none";
    customAllocationsSection.style.opacity = "1";
  }

  if (toggleCustomAllocationsBtn && customAllocationsSection) {
    toggleCustomAllocationsBtn.addEventListener("click", () => {
      switchToSaveTab();
      const isHidden = customAllocationsSection.classList.contains("hidden");

      if (isHidden) {
        // Show with animation
        customAllocationsSection.classList.remove("hidden");
        // Set a small delay to ensure the hidden class is removed first
        setTimeout(() => {
          customAllocationsSection.style.maxHeight = "5000px"; // Large enough to contain all content
          customAllocationsSection.style.opacity = "1";
        }, 10);

        toggleCustomAllocationsBtn.innerHTML = `
          <span style="color: white; font-weight: 500">Hide Custom Allocations</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
        `;
      } else {
        // Hide with animation
        customAllocationsSection.style.maxHeight = "0";
        customAllocationsSection.style.opacity = "0";

        // Add the hidden class after animation completes
        setTimeout(() => {
          customAllocationsSection.classList.add("hidden");
        }, 500); // Match the transition duration

        toggleCustomAllocationsBtn.innerHTML = `
          <span>Enter Custom Allocations</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        `;
      }
    });
  }

  // All living expense inputs
  const expenseInputs = document.querySelectorAll(
    '#living-expenses-section input[type="number"]'
  );
  expenseInputs.forEach((input) => {
    input.addEventListener("focus", switchToExpensesTab);
    input.addEventListener("input", () => {
      if (input.value.length > 10) {
        input.value = input.value.slice(0, 10);
      }
      switchToExpensesTab();
      if (calculatorState.customSavingsToggleEnabled) {
        const customSavingsToggleEl = document.getElementById(
          "customSavingsToggle"
        );
        const siToggleTextEl = document.getElementById("si-toggle-text");
        if (customSavingsToggleEl) {
          customSavingsToggleEl.checked = false;
          calculatorState.customSavingsToggleEnabled = false;
          if (siToggleTextEl) {
            siToggleTextEl.textContent = "Set your custom allocations";
          }
          customSavingsToggleEl.dispatchEvent(new Event("change"));
        }
      }
      handleExpenseChangeWithChartSync();
    });
  });

  if (livingExpensesSection) {
    livingExpensesSection.addEventListener("click", switchToExpensesTab);
  }

  if (savingsInvestmentsSection) {
    savingsInvestmentsSection.addEventListener("click", switchToSaveTab);
  }

  if (annualIncomeSection) {
    annualIncomeSection.addEventListener("click", switchToTaxesTab);
  }

  if (savingsInvestmentsSection && livingExpensesSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const livingBottom =
            livingExpensesSection.offsetTop +
            livingExpensesSection.offsetHeight;
          const viewportCenter = window.scrollY + window.innerHeight / 2;
          if (entry.isIntersecting && viewportCenter > livingBottom) {
            collapseAllExpenses();
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(savingsInvestmentsSection);
  }

  if (savingsInvestmentsSection && livingExpensesSection) {
    const maybeCollapseExpensesOnScroll = () => {
      const savingsRect = savingsInvestmentsSection.getBoundingClientRect();
      const livingRect = livingExpensesSection.getBoundingClientRect();
      const nearSavings = savingsRect.top <= window.innerHeight * 0.65;
      const pastLiving = livingRect.bottom <= 0;
      if (nearSavings || pastLiving) collapseAllExpenses();
    };
    window.addEventListener("scroll", maybeCollapseExpensesOnScroll, {
      passive: true,
    });
    window.addEventListener("resize", maybeCollapseExpensesOnScroll);
  }

  // Income section collapse logic
  const incomeToggleBtn = document.getElementById("income-section-toggle");
  if (incomeToggleBtn) {
    incomeToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleIncomeSection();
    });
  }

  if (livingExpensesSection && annualIncomeSection) {
    const maybeCollapseIncomeOnScroll = () => {
      const livingRect = livingExpensesSection.getBoundingClientRect();
      // Collapse income when scrolling down to expenses (living expenses near top of viewport)
      const nearLiving = livingRect.top <= window.innerHeight * 0.5;

      if (nearLiving) {
        collapseIncomeSection();
      }
    };

    window.addEventListener("scroll", maybeCollapseIncomeOnScroll, {
      passive: true,
    });
    window.addEventListener("resize", maybeCollapseIncomeOnScroll);
  }

  // Custom savings and investments inputs
  savingsPercentageInput.addEventListener("focus", switchToSaveTab);
  savingsPercentageInput.addEventListener("input", () => {
    // Process input regardless of toggle state for real-time updates
    switchToSaveTab();

    // Debug logging to see what's happening
    console.log("=== SAVINGS INPUT DEBUG ===");
    console.log("Raw input value:", savingsPercentageInput.value);
    console.log("Parsed value:", parseFloat(savingsPercentageInput.value));
    console.log("Document.activeElement:", document.activeElement);
    console.log(
      "Is input focused?",
      document.activeElement === savingsPercentageInput
    );

    const budget = calculatorState.currentBudget;
    if (budget && budget.monthly_disposable_income > 0) {
      const mdi = budget.monthly_disposable_income;
      const expenses = budget.total_monthly_expenses || 0;
      const available = Math.max(0, mdi - expenses);
      const maxPctTotal = (available / mdi) * 100;
      const otherPct = parseFloat(investmentsPercentageInput.value) || 0;
      let sPct = parseFloat(savingsPercentageInput.value) || 0;
      if (sPct + otherPct > maxPctTotal) {
        sPct = Math.max(0, maxPctTotal - otherPct);
        savingsPercentageInput.value = sPct.toFixed(1);
        const allocErr = document.getElementById("allocationError");
        if (allocErr) {
          allocErr.classList.remove("hidden");
          allocErr.textContent =
            "Total allocations cannot exceed remaining amount after expenses.";
        }
      } else {
        const allocErr = document.getElementById("allocationError");
        if (allocErr) allocErr.classList.add("hidden");
      }
    }

    // Only set custom flag if user enters a non-empty value
    if (savingsPercentageInput.value && savingsPercentageInput.value !== "0") {
      calculatorState.hasCustomSavings = true;
    } else {
      calculatorState.hasCustomSavings = false; // Field is cleared
    }

    // Update charts immediately for real-time rendering (use debounced version)
    debouncedChartUpdate();

    // Force refresh if percentage dropped to 0 to clear cached data
    if (
      savingsPercentageInput.value === "0" ||
      savingsPercentageInput.value === ""
    ) {
      setTimeout(() => {
        forceRefreshCharts();
      }, 150);
    }

    // Don't recalculate immediately if user is actively typing (debounce)
    clearTimeout(window.savingsInputTimeout);
    window.savingsInputTimeout = setTimeout(() => {
      handleExpenseOrAllocationChange();
    }, 300); // 300ms delay
  });
  investmentsPercentageInput.addEventListener("focus", switchToSaveTab);
  investmentsPercentageInput.addEventListener("input", () => {
    // Process input regardless of toggle state for real-time updates
    switchToSaveTab();

    // Debug logging to see what's happening
    console.log("=== INVESTMENTS INPUT DEBUG ===");
    console.log("Raw input value:", investmentsPercentageInput.value);
    console.log("Parsed value:", parseFloat(investmentsPercentageInput.value));

    const budget = calculatorState.currentBudget;
    if (budget && budget.monthly_disposable_income > 0) {
      const mdi = budget.monthly_disposable_income;
      const expenses = budget.total_monthly_expenses || 0;
      const available = Math.max(0, mdi - expenses);
      const maxPctTotal = (available / mdi) * 100;
      const otherPct = parseFloat(savingsPercentageInput.value) || 0;
      let iPct = parseFloat(investmentsPercentageInput.value) || 0;
      if (iPct + otherPct > maxPctTotal) {
        iPct = Math.max(0, maxPctTotal - otherPct);
        investmentsPercentageInput.value = iPct.toFixed(1);
        const allocErr = document.getElementById("allocationError");
        if (allocErr) {
          allocErr.classList.remove("hidden");
          allocErr.textContent =
            "Total allocations cannot exceed remaining amount after expenses.";
        }
      } else {
        const allocErr = document.getElementById("allocationError");
        if (allocErr) allocErr.classList.add("hidden");
      }
    }

    // Only set custom flag if user enters a non-empty value
    if (
      investmentsPercentageInput.value &&
      investmentsPercentageInput.value !== "0"
    ) {
      calculatorState.hasCustomInvestments = true;
    } else {
      calculatorState.hasCustomInvestments = false; // Field is cleared
    }

    // Update charts immediately for real-time rendering (use debounced version)
    debouncedChartUpdate();

    // Force refresh if percentage dropped to 0 to clear cached data
    if (
      investmentsPercentageInput.value === "0" ||
      investmentsPercentageInput.value === ""
    ) {
      setTimeout(() => {
        forceRefreshCharts();
      }, 150);
    }

    // Don't recalculate immediately if user is actively typing (debounce)
    clearTimeout(window.investmentsInputTimeout);
    window.investmentsInputTimeout = setTimeout(() => {
      handleExpenseOrAllocationChange();
    }, 300); // 300ms delay
  });

  // Custom amount inputs
  customSavingsAmountInput.addEventListener("focus", switchToSaveTab);
  customSavingsAmountInput.addEventListener("input", (e) => {
    // Process input regardless of toggle state for real-time updates
    switchToSaveTab();
    // Only set custom flag if user enters a non-empty value
    if (
      customSavingsAmountInput.value &&
      customSavingsAmountInput.value !== "$0.00"
    ) {
      calculatorState.hasCustomSavings = true;
    } else {
      calculatorState.hasCustomSavings = false; // Field is cleared
    }
    const budget = calculatorState.currentBudget;
    if (budget && budget.monthly_disposable_income > 0) {
      const mdi = budget.monthly_disposable_income;
      const expenses = budget.total_monthly_expenses || 0;
      const available = Math.max(0, mdi - expenses);
      const otherAmt =
        parseFloat(
          (customInvestmentsAmountInput.value || "").replace(/[^0-9.]/g, "")
        ) || 0;
      let sAmt =
        parseFloat(
          (customSavingsAmountInput.value || "").replace(/[^0-9.]/g, "")
        ) || 0;
      if (sAmt + otherAmt > available) {
        sAmt = Math.max(0, available - otherAmt);
        customSavingsAmountInput.value = formatCurrency(sAmt);
        const allocErr = document.getElementById("allocationError");
        if (allocErr) {
          allocErr.classList.remove("hidden");
          allocErr.textContent =
            "Total allocations cannot exceed remaining amount after expenses.";
        }
      } else {
        const allocErr = document.getElementById("allocationError");
        if (allocErr) allocErr.classList.add("hidden");
      }
    }
    handleCustomAmountChange(e);

    // Update charts immediately for real-time rendering (use debounced version)
    debouncedChartUpdate();
  });
  customInvestmentsAmountInput.addEventListener("focus", switchToSaveTab);
  customInvestmentsAmountInput.addEventListener("input", (e) => {
    // Process input regardless of toggle state for real-time updates
    switchToSaveTab();
    // Only set custom flag if user enters a non-empty value
    if (
      customInvestmentsAmountInput.value &&
      customInvestmentsAmountInput.value !== "$0.00"
    ) {
      calculatorState.hasCustomInvestments = true;
    } else {
      calculatorState.hasCustomInvestments = false; // Field is cleared
    }
    const budget2 = calculatorState.currentBudget;
    if (budget2 && budget2.monthly_disposable_income > 0) {
      const mdi = budget2.monthly_disposable_income;
      const expenses = budget2.total_monthly_expenses || 0;
      const available = Math.max(0, mdi - expenses);
      const otherAmt =
        parseFloat(
          (customSavingsAmountInput.value || "").replace(/[^0-9.]/g, "")
        ) || 0;
      let iAmt =
        parseFloat(
          (customInvestmentsAmountInput.value || "").replace(/[^0-9.]/g, "")
        ) || 0;
      if (iAmt + otherAmt > available) {
        iAmt = Math.max(0, available - otherAmt);
        customInvestmentsAmountInput.value = formatCurrency(iAmt);
        const allocErr = document.getElementById("allocationError");
        if (allocErr) {
          allocErr.classList.remove("hidden");
          allocErr.textContent =
            "Total allocations cannot exceed remaining amount after expenses.";
        }
      } else {
        const allocErr = document.getElementById("allocationError");
        if (allocErr) allocErr.classList.add("hidden");
      }
    }
    handleCustomAmountChange(e);

    // Update charts immediately for real-time rendering (use debounced version)
    debouncedChartUpdate();
  });

  // Custom Savings Toggle functionality
  const customSavingsToggle = document.getElementById("customSavingsToggle");
  const siToggleText = document.getElementById("si-toggle-text");

  if (customSavingsToggle) {
    customSavingsToggle.addEventListener("change", () => {
      calculatorState.customSavingsToggleEnabled = customSavingsToggle.checked;

      // Update toggle text
      if (siToggleText) {
        siToggleText.textContent = customSavingsToggle.checked
          ? "Switch to recommended allocations"
          : "Set your custom allocations";
      }

      // Enable/disable input fields based on toggle state
      const isEnabled = customSavingsToggle.checked;
      savingsPercentageInput.disabled = !isEnabled;
      investmentsPercentageInput.disabled = !isEnabled;
      customSavingsAmountInput.disabled = !isEnabled;
      customInvestmentsAmountInput.disabled = !isEnabled;

      // Update field appearance based on enabled state
      const updateFieldAppearance = (input, enabled) => {
        if (enabled) {
          input.classList.remove("opacity-50", "cursor-not-allowed");
          input.classList.add("cursor-text");
        } else {
          input.classList.add("opacity-50", "cursor-not-allowed");
          input.classList.remove("cursor-text");
        }
      };

      updateFieldAppearance(savingsPercentageInput, isEnabled);
      updateFieldAppearance(investmentsPercentageInput, isEnabled);
      updateFieldAppearance(customSavingsAmountInput, isEnabled);
      updateFieldAppearance(customInvestmentsAmountInput, isEnabled);

      // If toggle is turned off, reset to recommended numbers
      if (!isEnabled) {
        const budget = calculatorState.currentBudget;
        if (budget) {
          // Clear custom flags since we're resetting to recommended
          calculatorState.hasCustomSavings = false;
          calculatorState.hasCustomInvestments = false;

          // Set inputs to recommended percentages
          savingsPercentageInput.value =
            budget.recommended_savings_pct.toFixed(1);
          investmentsPercentageInput.value =
            budget.recommended_investments_pct.toFixed(1);

          // Set amount inputs to recommended monthly amounts
          customSavingsAmountInput.value = formatCurrency(
            budget.recommended_allocations.monthly_savings
          );
          customInvestmentsAmountInput.value = formatCurrency(
            budget.recommended_allocations.monthly_investments
          );

          // Recalculate with these values to update charts and cashflow
          handleExpenseOrAllocationChange();

          // Update charts immediately after toggle change
          updateAllCustomProjectionCharts();
        }
      }
    });

    // Initialize toggle state - disabled by default (recommended values mode)
    customSavingsToggle.checked = false;
    calculatorState.customSavingsToggleEnabled = false;
    if (siToggleText) {
      siToggleText.textContent = "Set your custom allocations";
    }
    savingsPercentageInput.disabled = true;
    investmentsPercentageInput.disabled = true;
    customSavingsAmountInput.disabled = true;
    customInvestmentsAmountInput.disabled = true;
    savingsPercentageInput.classList.add("opacity-50", "cursor-not-allowed");
    investmentsPercentageInput.classList.add(
      "opacity-50",
      "cursor-not-allowed"
    );
    customSavingsAmountInput.classList.add("opacity-50", "cursor-not-allowed");
    customInvestmentsAmountInput.classList.add(
      "opacity-50",
      "cursor-not-allowed"
    );
    savingsPercentageInput.classList.remove("cursor-text");
    investmentsPercentageInput.classList.remove("cursor-text");
    customSavingsAmountInput.classList.remove("cursor-text");
    customInvestmentsAmountInput.classList.remove("cursor-text");
  }

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
        btn.classList.remove("chart-btn-active");
        btn.classList.add("chart-btn-inactive");
        // Remove active styling classes
        btn.classList.remove("shadow-lg", "transform", "scale-110");
        btn.classList.add("shadow-md");
        btn.className = btn.className.replace(
          /bg-gradient-to-r from-emerald-600 to-emerald-700/g,
          "bg-gradient-to-r from-emerald-400/60 to-emerald-500/60"
        );
      });
      activeBtn.classList.remove("chart-btn-inactive");
      activeBtn.classList.add("chart-btn-active");
      // Add active styling classes
      activeBtn.classList.remove("shadow-md");
      activeBtn.classList.add("shadow-lg", "transform", "scale-110");
      activeBtn.className = activeBtn.className.replace(
        /bg-gradient-to-r from-emerald-400\/60 to-emerald-500\/60/g,
        "bg-gradient-to-r from-emerald-600 to-emerald-700"
      );
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
  // Custom projection now uses same parameters as recommended allocations
  // No need for separate input elements

  if (
    customSavingsChartBtn &&
    customInvestmentsChartBtn &&
    customBothChartBtn
  ) {
    // NEW: tabbed view toggling
    const customViews = {
      savings: document.getElementById("customSavingsView"),
      investments: document.getElementById("customInvestmentsView"),
      both: document.getElementById("customBothView"),
    };
    const showCustomView = (key) => {
      Object.entries(customViews).forEach(([name, el]) => {
        if (el) el.classList.toggle("hidden", name !== key);
      });
    };

    // Helper function to update active button styling for custom buttons
    const updateCustomActiveButton = (activeBtn) => {
      [
        customSavingsChartBtn,
        customInvestmentsChartBtn,
        customBothChartBtn,
      ].forEach((btn) => {
        btn.classList.remove("chart-btn-active");
        btn.classList.add("chart-btn-inactive");
        // Remove active styling classes
        btn.classList.remove("shadow-lg", "transform", "scale-110");
        btn.classList.add("shadow-md");
        btn.className = btn.className.replace(
          /bg-gradient-to-r from-emerald-600 to-emerald-700/g,
          "bg-gradient-to-r from-emerald-400/60 to-emerald-500/60"
        );
      });
      activeBtn.classList.remove("chart-btn-inactive");
      activeBtn.classList.add("chart-btn-active");
      // Add active styling classes
      activeBtn.classList.remove("shadow-md");
      activeBtn.classList.add("shadow-lg", "transform", "scale-110");
      activeBtn.className = activeBtn.className.replace(
        /bg-gradient-to-r from-emerald-400\/60 to-emerald-500\/60/g,
        "bg-gradient-to-r from-emerald-600 to-emerald-700"
      );
    };

    customSavingsChartBtn.addEventListener("click", () => {
      calculatorState.customCompoundInterest.currentChartType = "savings";
      updateCustomActiveButton(customSavingsChartBtn);
      showCustomView("savings");
      updateCustomProjectionChart();
    });

    customInvestmentsChartBtn.addEventListener("click", () => {
      calculatorState.customCompoundInterest.currentChartType = "investments";
      updateCustomActiveButton(customInvestmentsChartBtn);
      showCustomView("investments");
      updateCustomProjectionChart();
    });

    customBothChartBtn.addEventListener("click", () => {
      calculatorState.customCompoundInterest.currentChartType = "both";
      updateCustomActiveButton(customBothChartBtn);
      showCustomView("both");
      updateCustomProjectionChart();
    });

    // Default visible tab
    showCustomView("savings");

    // Custom projection now uses same parameters as recommended allocations
    // No separate event listeners needed
  }

  // Toggle combined view for Save & Invest section
  const showCombinedToggle = document.getElementById("showCombinedToggle");
  if (showCombinedToggle) {
    const showCombinedText = document.getElementById("showCombinedText");
    const savingsEl = document.getElementById("customSavingsView");
    const investmentsEl = document.getElementById("customInvestmentsView");
    const bothEl = document.getElementById("customBothView");

    const applyVisibility = (isCombined) => {
      if (!savingsEl || !investmentsEl || !bothEl) return;

      console.log("Applying visibility - isCombined:", isCombined);
      console.log("Savings element:", savingsEl);
      console.log("Investments element:", investmentsEl);
      console.log("Both element:", bothEl);

      // Ensure proper class management - use add/remove instead of toggle for clarity
      if (isCombined) {
        savingsEl.classList.add("hidden");
        investmentsEl.classList.add("hidden");
        bothEl.classList.remove("hidden");
        if (showCombinedText) {
          showCombinedText.textContent =
            "Show total of savings and investments";
        }
        const chartsContainer = document.getElementById(
          "customChartsContainer"
        );
        if (chartsContainer) {
          chartsContainer.classList.remove("space-y-10");
          chartsContainer.classList.add("space-y-0");
        }
      } else {
        savingsEl.classList.remove("hidden");
        investmentsEl.classList.remove("hidden");
        bothEl.classList.add("hidden");
        if (showCombinedText) {
          showCombinedText.textContent =
            "Switch to savings & investments projections";
        }
        const chartsContainer = document.getElementById(
          "customChartsContainer"
        );
        if (chartsContainer) {
          chartsContainer.classList.remove("space-y-0");
          chartsContainer.classList.add("space-y-10");
        }
      }

      // Force chart update when toggle changes
      setTimeout(() => {
        updateAllCustomProjectionCharts();
      }, 50);
    };

    // Initial state: OFF => show savings + investments
    console.log(
      "Initial showCombinedToggle.checked:",
      showCombinedToggle.checked
    );
    applyVisibility(showCombinedToggle.checked);

    showCombinedToggle.addEventListener("change", (e) => {
      console.log("showCombinedToggle changed to:", e.target.checked);
      applyVisibility(e.target.checked);
    });
  }

  // UI Toggles
  const dropdownBtn = document.getElementById("dropdownBtn");
  const dropdownList = document.getElementById("customProvinceOptions");
  dropdownBtn.addEventListener("click", () => {
    switchToTaxesTab();
    toggleProvinceDropdown();
  });

  // deductonToggle.addEventListener("click", () => {
  //   toggleDeductionInputs();
  // });

  const toggleAllExpensesButton = document.getElementById(
    "toggle-all-expenses"
  );
  if (toggleAllExpensesButton) {
    toggleAllExpensesButton.addEventListener("click", toggleAllExpenses);
  }

  //this is the age drop down list
  const ageDropdownBtn = document.getElementById("ageDropdownBtn");
  const ageDropdownList = document.getElementById("customAgeOptions");

  // Toggle age dropdown visibility
  function toggleAgeDropdown() {
    const isOpen =
      ageDropdownList.style.maxHeight &&
      ageDropdownList.style.maxHeight !== "0px";
    if (isOpen) {
      ageDropdownList.style.maxHeight = "0";
      ageDropdownList.style.opacity = "0";
    } else {
      ageDropdownList.style.maxHeight = ageDropdownList.scrollHeight + "px";
      ageDropdownList.style.opacity = "1";
    }
  }

  // Handle dropdown toggle
  ageDropdownBtn.addEventListener("click", () => {
    switchToTaxesTab();
    toggleAgeDropdown();
  });

  // Handle selecting an age option
  const ageOptions = ageDropdownList.querySelectorAll("li");
  ageOptions.forEach((option) => {
    option.addEventListener("click", () => {
      document.getElementById("ageDropdownSelected").textContent =
        option.textContent;
      toggleAgeDropdown();
      switchToTaxesTab();
      handlePrimaryInputChange(); // Trigger validation and recalculation
    });
  });
  // Popup logic
  const infoButton = document.getElementById("infoButton");
  const infoPopup = document.getElementById("infoPopup");
  const closePopup = document.getElementById("closePopup");

  // New AllocationsBtn popup logic
  const allocationsBtn = document.getElementById("AllocationsBtn");
  const infoPopup2 = document.getElementById("infoPopup2");
  const closePopup2 = document.getElementById("closePopup2");

  if (infoButton) {
    infoButton.addEventListener("click", () => {
      console.log("i got clicked!");
      infoPopup.classList.remove("hidden");
    });
  }
  if (closePopup) {
    closePopup.addEventListener("click", () =>
      infoPopup.classList.add("hidden")
    );
  }
  if (infoPopup) {
    infoPopup.addEventListener("click", (e) => {
      if (e.target === infoPopup) infoPopup.classList.add("hidden");
    });
  }
  // Add event listeners for the new AllocationsBtn modal
  if (allocationsBtn) {
    allocationsBtn.addEventListener("click", () =>
      infoPopup2.classList.remove("hidden")
    );
  }

  if (closePopup2) {
    closePopup2.addEventListener("click", () =>
      infoPopup2.classList.add("hidden")
    );
  }

  if (infoPopup2) {
    infoPopup2.addEventListener("click", (e) => {
      if (e.target === infoPopup2) infoPopup2.classList.add("hidden");
    });
  }
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
  const label = document.getElementById("toggle-all-expenses-text");
  const expenseCategories = document.querySelectorAll(".expense-category");

  const isExpanding = label
    ? label.textContent.trim().toLowerCase().includes("expand")
    : true; // default to expanding if label not found

  expenseCategories.forEach((category) => {
    const categoryContent = category.querySelector(".category-content");
    const arrow = category.querySelector(".category-arrow");
    const isExpanded =
      categoryContent.style.maxHeight &&
      categoryContent.style.maxHeight !== "0px";

    if (isExpanding && !isExpanded) {
      categoryContent.style.maxHeight = categoryContent.scrollHeight + "px";
      arrow.style.transform = "rotate(180deg)";
    } else if (!isExpanding && isExpanded) {
      categoryContent.style.maxHeight = "0px";
      arrow.style.transform = "rotate(0deg)";
    }
  });

  // Update only the label text so icons never disappear
  if (label) {
    label.textContent = isExpanding ? "Collapse all" : "Expand all";
  }
  // DO NOT set toggleAllButton.textContent (it would remove the icons)
}

function collapseAllExpenses() {
  const contents = document.querySelectorAll(
    ".expense-category .category-content"
  );
  const arrows = document.querySelectorAll(".expense-category .category-arrow");
  contents.forEach((content, index) => {
    content.style.maxHeight = "0px";
    if (arrows[index]) arrows[index].style.transform = "rotate(0deg)";
  });
  const label = document.getElementById("toggle-all-expenses-text");
  if (label) label.textContent = "Expand all";
}

function collapseIncomeSection() {
  const content = document.getElementById("income-section-content");
  const arrow = document.getElementById("income-section-arrow");
  if (content) {
    content.style.maxHeight = "0px";
    content.style.opacity = "0";
  }
  if (arrow) {
    arrow.style.transform = "rotate(0deg)";
  }
}

function expandIncomeSection() {
  const content = document.getElementById("income-section-content");
  const arrow = document.getElementById("income-section-arrow");
  if (content) {
    content.style.maxHeight = "3000px";
    content.style.opacity = "1";
  }
  if (arrow) {
    arrow.style.transform = "rotate(180deg)";
  }
}

function toggleIncomeSection() {
  const content = document.getElementById("income-section-content");
  if (!content) return;

  const isCollapsed = content.style.maxHeight === "0px";

  if (isCollapsed) {
    expandIncomeSection();
  } else {
    collapseIncomeSection();
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
  const { years, compoundFrequency, currentChartType } =
    calculatorState.compoundInterest;

  // Get the chart instance
  const chartElement = document.getElementById("myPieChart2");

  // Check if chart element exists
  if (!chartElement) {
    console.log("Chart element myPieChart2 not found, skipping chart update");
    return;
  }
  let chart = Chart.getChart(chartElement);

  // If no budget calculation has been performed yet, return early
  if (!calculatorState.currentBudget) {
    console.log("No budget data available yet for projection chart");
    return;
  }

  const currentBudget = calculatorState.currentBudget;

  // Get the current input values to check if user has entered 0% or empty
  const savingsPercentageInput = document.getElementById("savingsPercentage");
  const investmentsPercentageInput = document.getElementById(
    "investmentsPercentage"
  );

  const savingsInputValue = savingsPercentageInput
    ? savingsPercentageInput.value
    : "";
  const investmentsInputValue = investmentsPercentageInput
    ? investmentsPercentageInput.value
    : "";

  // Determine the monthly contribution and return rate based on the selected chart type
  let monthlyContribution = 0;
  let returnRate = 0;

  if (currentChartType === "savings") {
    // Check if savings input is 0% or empty - if so, show $0.00
    if (savingsInputValue === "0" || savingsInputValue === "") {
      monthlyContribution = 0;
    } else {
      monthlyContribution =
        currentBudget.recommended_allocations.monthly_savings;
    }
    returnRate = 3; // 3% for savings
  } else if (currentChartType === "investments") {
    // Check if investments input is 0% or empty - if so, show $0.00
    if (investmentsInputValue === "0" || investmentsInputValue === "") {
      monthlyContribution = 0;
    } else {
      monthlyContribution =
        currentBudget.recommended_allocations.monthly_investments;
    }
    returnRate = 10; // 10% for investments
  } else if (currentChartType === "both") {
    const savingsAmount =
      savingsInputValue === "0" || savingsInputValue === ""
        ? 0
        : currentBudget.recommended_allocations.monthly_savings;
    const investmentsAmount =
      investmentsInputValue === "0" || investmentsInputValue === ""
        ? 0
        : currentBudget.recommended_allocations.monthly_investments;
    monthlyContribution = savingsAmount + investmentsAmount;
    // Use simple average of 3% and 10%
    returnRate = (3 + 10) / 2; // 6.5%
  }

  // Calculate the future value
  const { endingBalance, totalContributions, interestEarned } =
    calculateFutureValue(
      monthlyContribution,
      years,
      returnRate,
      compoundFrequency
    );

  // Define color schemes for different chart types
  const colorSchemes = {
    savings: {
      backgroundColor: [
        "rgba(239, 68, 68, 0.8)", // Red for contributions
        "rgba(59, 130, 246, 0.8)", // Blue for interest
        "rgba(251, 191, 36, 0.8)", // Yellow for ending balance
      ],
      borderColor: [
        "rgba(239, 68, 68, 1)",
        "rgba(59, 130, 246, 1)",
        "rgba(251, 191, 36, 1)",
      ],
      borderWidth: 2,
    },
    investments: {
      backgroundColor: [
        "rgba(34, 197, 94, 0.8)", // Green for contributions
        "rgba(168, 85, 247, 0.8)", // Purple for interest
        "rgba(249, 115, 22, 0.8)", // Orange for ending balance
      ],
      borderColor: [
        "rgba(34, 197, 94, 1)",
        "rgba(168, 85, 247, 1)",
        "rgba(249, 115, 22, 1)",
      ],
      borderWidth: 2,
    },
    both: {
      backgroundColor: [
        "rgba(99, 102, 241, 0.8)", // Indigo for contributions
        "rgba(236, 72, 153, 0.8)", // Pink for interest
        "rgba(14, 165, 233, 0.8)", // Sky blue for ending balance
      ],
      borderColor: [
        "rgba(99, 102, 241, 1)",
        "rgba(236, 72, 153, 1)",
        "rgba(14, 165, 233, 1)",
      ],
      borderWidth: 2,
    },
  };

  const currentColors = colorSchemes[currentChartType] || colorSchemes.savings;

  // Update the chart data as percentages of ending balance
  const contributionPercentage = Math.round(
    (totalContributions / endingBalance) * 100
  );
  const interestPercentage = Math.round((interestEarned / endingBalance) * 100);
  const chartData = [contributionPercentage, interestPercentage];
  const chartLabels = ["Total Contributions", "Interest Earned"];
  const chartTotal = 100; // Total is always 100%

  if (chart) {
    chart.data.datasets[0].data = chartData;
    chart.data.labels = chartLabels;
    chart.data.datasets[0].backgroundColor =
      currentColors.backgroundColor.slice(0, 2);
    chart.data.datasets[0].borderColor = currentColors.borderColor.slice(0, 2);
    chart.data.datasets[0].borderWidth = currentColors.borderWidth;
    chart.update();
  } else {
    // If chart doesn't exist yet, create it
    chart = new Chart(chartElement.getContext("2d"), {
      type: "pie",
      data: {
        labels: chartLabels,
        datasets: [
          {
            label: "Projection",
            data: chartData,
            backgroundColor: currentColors.backgroundColor.slice(0, 2),
            borderColor: currentColors.borderColor.slice(0, 2),
            borderWidth: currentColors.borderWidth,
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
                const percentage = context.raw || 0;
                const dollarValue =
                  label === "Total Contributions"
                    ? totalContributions
                    : interestEarned;
                return `${label}\n${formatCurrency(
                  dollarValue
                )} (${percentage}%)`;
              },
            },
          },
          legend: {
            display: false,
          },
          title: {
            display: false,
          },
          datalabels: {
            color: "white",
            font: {
              weight: "bold",
              size: 12,
            },
            formatter: function (value, context) {
              return value + "%";
            },
          },
        },
        layout: {
          padding: 10,
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

    // Create return rate description based on chart type
    let returnRateDescription = "";
    if (currentChartType === "savings") {
      returnRateDescription = `${returnRate}% 
        return (savings rate)`;
    } else if (currentChartType === "investments") {
      returnRateDescription = `${returnRate}% 
        return (investment rate)`;
    } else if (currentChartType === "both") {
      returnRateDescription = `${returnRate.toFixed(1)}% 
        return (average of savings 3% and investments 10%)`;
    }

    summaryElement.innerHTML = `
      <div class="text-white text-sm">
        <p class="font-semibold mb-2 text-center">${contributionType} Projection</p>
        <p class="text-xs text-white/70 mb-2 text-center">${formatCurrency(
          monthlyContribution
        )}/month for ${years} years at ${returnRateDescription}</p>
        <div class="space-y-1">
          <div class="flex items-center justify-between p-2 rounded bg-white/10 mb-3">
            <span class="text-sm font-bold">Ending Balance</span>
            <span class="font-bold text-lg">${formatCurrency(
              endingBalance
            )}</span>
          </div>
          <div class="flex items-center justify-between p-1 rounded cursor-pointer hover:bg-white/5 transition-colors" onclick="toggleChartSegment(0)">
            <div class="flex items-center gap-2">
              <div class="w-4 h-3 rounded" style="background-color: ${
                currentColors.backgroundColor[0]
              }"></div>
              <span class="text-sm" id="legend-0">Total Contributions</span>
            </div>
            <span class="font-semibold">${formatCurrency(
              totalContributions
            )}</span>
          </div>
          <div class="flex items-center justify-between p-1 rounded cursor-pointer hover:bg-white/5 transition-colors" onclick="toggleChartSegment(1)">
            <div class="flex items-center gap-2">
              <div class="w-4 h-3 rounded" style="background-color: ${
                currentColors.backgroundColor[1]
              }"></div>
              <span class="text-sm" id="legend-1">Interest Earned</span>
            </div>
            <span class="font-semibold">${formatCurrency(interestEarned)}</span>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Updates the custom projection chart based on the selected allocation type (savings, investments, or both)
 */
// Render one chart + summary + title (stacked view)
function renderCustomProjection(chartType, canvasId, summaryId, titleId) {
  const { years, compoundFrequency } = calculatorState.compoundInterest;
  if (!calculatorState.currentBudget) return;
  const currentBudget = calculatorState.currentBudget;

  // Get the current input values to check if user has entered 0% or empty
  const savingsPercentageInput = document.getElementById("savingsPercentage");
  const investmentsPercentageInput = document.getElementById(
    "investmentsPercentage"
  );

  const savingsInputValue = savingsPercentageInput
    ? savingsPercentageInput.value
    : "";
  const investmentsInputValue = investmentsPercentageInput
    ? investmentsPercentageInput.value
    : "";

  // Fallback to recommended amounts when custom values are empty
  const rec = currentBudget.recommended_allocations || {
    monthly_savings: 0,
    monthly_investments: 0,
  };
  const cust = currentBudget.custom_allocations || null;

  let monthlyContribution = 0;
  let returnRate = 0;

  if (chartType === "savings") {
    // Check if savings input is 0% or empty - if so, show $0.00
    if (savingsInputValue === "0" || savingsInputValue === "") {
      monthlyContribution = 0;
    } else {
      // Use the actual current percentage value, not the cached allocation
      const currentSavingsPct = parseFloat(savingsInputValue) || 0;
      monthlyContribution =
        (currentSavingsPct / 100) *
        (currentBudget.monthly_disposable_income || 0);
    }
    returnRate = 3;
  } else if (chartType === "investments") {
    // Check if investments input is 0% or empty - if so, show $0.00
    if (investmentsInputValue === "0" || investmentsInputValue === "") {
      monthlyContribution = 0;
    } else {
      // Use the actual current percentage value, not the cached allocation
      const currentInvestmentsPct = parseFloat(investmentsInputValue) || 0;
      monthlyContribution =
        (currentInvestmentsPct / 100) *
        (currentBudget.monthly_disposable_income || 0);
    }
    returnRate = 10;
  } else {
    const currentSavingsPct = parseFloat(savingsInputValue) || 0;
    const currentInvestmentsPct = parseFloat(investmentsInputValue) || 0;
    const s =
      (currentSavingsPct / 100) *
      (currentBudget.monthly_disposable_income || 0);
    const i =
      (currentInvestmentsPct / 100) *
      (currentBudget.monthly_disposable_income || 0);
    monthlyContribution = s + i;
    const total = s + i;
    returnRate = total > 0 ? (s * 3 + i * 10) / total : 7;
    returnRate = Math.min(7, Math.round(returnRate * 10) / 10);
  }

  const { endingBalance, totalContributions, interestEarned } =
    calculateFutureValue(
      monthlyContribution,
      years,
      returnRate,
      compoundFrequency
    );

  // Hide the chart container if monthly contribution is 0 and no data is available
  const containerId =
    chartType === "savings"
      ? "customSavingsView"
      : chartType === "investments"
      ? "customInvestmentsView"
      : "customBothView";
  const containerElement = document.getElementById(containerId);
  if (containerElement) {
    // Only hide if truly no data (both input is 0/empty AND no recommended data)
    const hasData =
      chartType === "savings"
        ? currentBudget.recommended_savings_pct > 0 ||
          (currentBudget.custom_savings_pct &&
            currentBudget.custom_savings_pct > 0)
        : chartType === "investments"
        ? currentBudget.recommended_investments_pct > 0 ||
          (currentBudget.custom_investments_pct &&
            currentBudget.custom_investments_pct > 0)
        : true; // Both chart always shows if either has data

    if (monthlyContribution === 0 && !hasData) {
      containerElement.classList.add("hidden");
      return; // Exit early if hidden
    } else {
      containerElement.classList.remove("hidden");
    }
  }

  // Avoid divide-by-zero
  const pctContrib =
    endingBalance > 0
      ? Math.round((totalContributions / endingBalance) * 100)
      : 0;
  const pctInterest =
    endingBalance > 0 ? Math.round((interestEarned / endingBalance) * 100) : 0;

  const colors = {
    savings: {
      background: ["#16815A", "#CDEEE2"],
      border: ["#16815A", "#CDEEE2"],
      borderWidth: 2,
    },
    investments: {
      background: ["#164A83", "#BBD4F0"],
      border: ["#164A83", "#BBD4F0"],
      borderWidth: 2,
    },
    both: {
      background: ["#A33047", "#ECC9D0"],
      border: ["#A33047", "#ECC9D0"],
      borderWidth: 2,
    },
  }[chartType];

  const labels =
    chartType === "savings"
      ? ["Total savings", "Interest earned"]
      : chartType === "investments"
      ? ["Total investments", "Interest earned"]
      : ["Total investments and savings", "Interest earned"];

  const chartElement = document.getElementById(canvasId);
  if (!chartElement) return;
  let chart = Chart.getChart(chartElement);

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = [pctContrib, pctInterest];
    chart.data.datasets[0].backgroundColor = colors.background;
    chart.data.datasets[0].borderColor = colors.border;
    chart.data.datasets[0].borderWidth = colors.borderWidth;
    chart.update();
  } else {
    chart = new Chart(chartElement.getContext("2d"), {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            label: "Custom Projection",
            data: [pctContrib, pctInterest],
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: colors.borderWidth,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const lbl = context.label || "";
                const percentage = context.raw || 0;
                const dollarValue = lbl.toLowerCase().includes("interest")
                  ? interestEarned
                  : totalContributions;
                return `${lbl}\n${formatCurrency(
                  dollarValue
                )} (${percentage}%)`;
              },
            },
          },
          legend: { display: false },
          title: { display: false },
          datalabels: {
            color: "white",
            font: { weight: "bold", size: 12 },
            formatter: () => "",
          },
        },
        layout: { padding: 10 },
      },
    });
  }

  const titleElement = document.getElementById(titleId);
  if (titleElement) {
    const titleText =
      chartType === "savings"
        ? `Savings projection for ${formatCurrency(
            monthlyContribution
          )}/month for ${years} years at ${returnRate}% return (savings rate)`
        : chartType === "investments"
        ? `Investments Projection for ${formatCurrency(
            monthlyContribution
          )}/month for ${years} years at ${returnRate}% return (investment rate)`
        : `Investment and savings projection for ${formatCurrency(
            monthlyContribution
          )}/month for ${years} years at ${returnRate.toFixed(1)}% return`;
    titleElement.textContent = titleText;
  }

  const summaryElement = document.getElementById(summaryId);
  if (!summaryElement) return;
  const leader = `<span class="flex-1 border-t border-dotted border-gray-300 mx-2"></span>`;
  const greenAmt = (val) =>
    `<span class="font-semibold text-transparent" style="background-image: linear-gradient(to right, var(--base-color-brand--brand-green), var(--base-color-system--focus-state)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">${formatCurrency(
      val
    )}</span>`;

  summaryElement.innerHTML = `
    <div class="space-y-2 text-sm text-gray-700">
      <div class="flex font-thin items-center">
        <span class="inline-block w-3 h-3 rounded-full" style="background-color:${
          colors.background[0]
        }"></span>
        <span class="ml-2">${labels[0]} (${pctContrib}%)</span>
        ${leader}
        ${greenAmt(totalContributions)}
      </div>
      <div class="flex font-thin items-center">
        <span class="inline-block w-3 h-3 rounded-full" style="background-color:${
          colors.background[1]
        }"></span>
        <span class="ml-2">${labels[1]} (${pctInterest}%)</span>
        ${leader}
        ${greenAmt(interestEarned)}
      </div>
      <div class="flex font-thin items-center">
        <span class="font-semibold">Ending balance</span>
        <span class="flex-1 border-t border-dotted border-gray-300 mx-2"></span>
        <span class="">
        ${leader}
        ${greenAmt(endingBalance)}
        </span>
      </div>
    </div>
  `;
}

// Debounced chart update function for performance
function debouncedChartUpdate() {
  clearTimeout(window.chartUpdateTimeout);
  window.chartUpdateTimeout = setTimeout(() => {
    updateAllCustomProjectionCharts();
  }, 100); // 100ms delay for better performance
}

// Force refresh charts by destroying existing ones
function forceRefreshCharts() {
  // Destroy existing charts to prevent caching issues
  const chartIds = [
    "customSavingsPieChart",
    "customInvestmentsPieChart",
    "customBothPieChart",
  ];
  chartIds.forEach((chartId) => {
    const canvas = document.getElementById(chartId);
    if (canvas) {
      const existingChart = Chart.getChart(canvas);
      if (existingChart) {
        existingChart.destroy();
      }
    }
  });
  // Then update with fresh data
  updateAllCustomProjectionCharts();
}

// Handle expense changes that affect percentages and amounts
function handleExpenseChangeWithChartSync() {
  // Store previous percentages before recalculation
  const prevSavingsPct = savingsPercentageInput.value;
  const prevInvestmentsPct = investmentsPercentageInput.value;

  // Let the normal calculation happen
  handleExpenseOrAllocationChange();

  // After calculation, check if percentages changed to 0
  setTimeout(() => {
    const budget = calculatorState.currentBudget;
    if (!budget) return;

    // Check if percentages dropped to 0 and amounts need sync
    const currentSavingsPct = savingsPercentageInput.value;
    const currentInvestmentsPct = investmentsPercentageInput.value;

    // Force sync if percentages changed to 0
    if (
      (prevSavingsPct !== "0" && currentSavingsPct === "0") ||
      (prevInvestmentsPct !== "0" && currentInvestmentsPct === "0")
    ) {
      // Force amount fields to $0.00
      if (
        currentSavingsPct === "0" &&
        !customSavingsAmountInput.matches(":focus")
      ) {
        customSavingsAmountInput.value = formatCurrency(0);
      }
      if (
        currentInvestmentsPct === "0" &&
        !customInvestmentsAmountInput.matches(":focus")
      ) {
        customInvestmentsAmountInput.value = formatCurrency(0);
      }

      // Force chart refresh
      forceRefreshCharts();
    }
  }, 400);
}

// Render all stacked charts/summaries and titles
function updateAllCustomProjectionCharts() {
  if (!calculatorState.currentBudget) return;

  // Get current budget data
  const budget = calculatorState.currentBudget;

  // Check if combined view is enabled
  const showCombinedToggle = document.getElementById("showCombinedToggle");
  const isCombined = showCombinedToggle ? showCombinedToggle.checked : false;

  console.log("=== updateAllCustomProjectionCharts ===");
  console.log("showCombinedToggle element:", showCombinedToggle);
  console.log("isCombined:", isCombined);

  // Determine which charts should be shown based on available data
  const hasSavingsData =
    budget.recommended_savings_pct > 0 ||
    (budget.custom_savings_pct && budget.custom_savings_pct > 0);
  const hasInvestmentsData =
    budget.recommended_investments_pct > 0 ||
    (budget.custom_investments_pct && budget.custom_investments_pct > 0);

  console.log(
    "hasSavingsData:",
    hasSavingsData,
    "hasInvestmentsData:",
    hasInvestmentsData
  );

  // Show/hide chart containers based on data availability
  const savingsView = document.getElementById("customSavingsView");
  const investmentsView = document.getElementById("customInvestmentsView");
  const bothView = document.getElementById("customBothView");

  console.log(
    "savingsView:",
    savingsView,
    "investmentsView:",
    investmentsView,
    "bothView:",
    bothView
  );

  if (savingsView) {
    const shouldHide = isCombined || !hasSavingsData;
    console.log("savingsView shouldHide:", shouldHide);
    savingsView.classList.toggle("hidden", shouldHide);
  }
  if (investmentsView) {
    const shouldHide = isCombined || !hasInvestmentsData;
    console.log("investmentsView shouldHide:", shouldHide);
    investmentsView.classList.toggle("hidden", shouldHide);
  }
  if (bothView) {
    const shouldHide = !isCombined || (!hasSavingsData && !hasInvestmentsData);
    console.log("bothView shouldHide:", shouldHide);
    bothView.classList.toggle("hidden", shouldHide);
  }

  if (isCombined) {
    // Show combined view - only render "both" chart if there's data
    if (hasSavingsData || hasInvestmentsData) {
      renderCustomProjection(
        "both",
        "customBothPieChart",
        "customBothProjectionSummary",
        "customBothTitle"
      );
    }
  } else {
    // Show individual views - render only charts with available data
    if (hasSavingsData) {
      renderCustomProjection(
        "savings",
        "customSavingsPieChart",
        "customSavingsProjectionSummary",
        "customSavingsTitle"
      );
    }
    if (hasInvestmentsData) {
      renderCustomProjection(
        "investments",
        "customInvestmentsPieChart",
        "customInvestmentsProjectionSummary",
        "customInvestmentsTitle"
      );
    }
  }
}

// Backward compatibility for existing calls
function updateCustomProjectionChart() {
  updateAllCustomProjectionCharts();
}

// Toggle a segment for a specific chart
function toggleCustomChartSegmentFor(chartId, segmentIndex) {
  const chartElement = document.getElementById(chartId);
  const chart = Chart.getChart(chartElement);
  if (chart && chart.data.datasets[0]) {
    const meta = chart.getDatasetMeta(0);
    if (meta.data[segmentIndex]) {
      meta.data[segmentIndex].hidden = !meta.data[segmentIndex].hidden;
      chart.update();
    }
  }
}

// Function to toggle chart segment visibility (for interactive legends)
function toggleChartSegment(segmentIndex) {
  const chartElement = document.getElementById("myPieChart2");
  const chart = Chart.getChart(chartElement);

  if (chart && chart.data.datasets[0]) {
    const meta = chart.getDatasetMeta(0);
    if (meta.data[segmentIndex]) {
      meta.data[segmentIndex].hidden = !meta.data[segmentIndex].hidden;

      // Toggle strikethrough on legend text
      const legendElement = document.getElementById(`legend-${segmentIndex}`);
      if (legendElement) {
        if (meta.data[segmentIndex].hidden) {
          legendElement.style.textDecoration = "line-through";
          legendElement.style.opacity = "0.5";
        } else {
          legendElement.style.textDecoration = "none";
          legendElement.style.opacity = "1";
        }
      }

      chart.update();
    }
  }
}

// Function to toggle custom chart segment visibility
function toggleCustomChartSegment(segmentIndex) {
  const chartElement = document.getElementById("customPieChart");
  const chart = Chart.getChart(chartElement);

  if (chart && chart.data.datasets[0]) {
    const meta = chart.getDatasetMeta(0);
    if (meta.data[segmentIndex]) {
      meta.data[segmentIndex].hidden = !meta.data[segmentIndex].hidden;

      // Toggle strikethrough on legend text
      const legendElement = document.getElementById(
        `custom-legend-${segmentIndex}`
      );
      if (legendElement) {
        if (meta.data[segmentIndex].hidden) {
          legendElement.style.textDecoration = "line-through";
          legendElement.style.opacity = "0.5";
        } else {
          legendElement.style.textDecoration = "none";
          legendElement.style.opacity = "1";
        }
      }

      chart.update();
    }
  }
}

function initializeApp() {
  initializeProvinceDropdown();
  setupEventListeners();
}

/**
 * Handles changes from custom amount inputs. Updates percentages and triggers budget recalculation.
 */
function handleCustomAmountChange(event) {
  if (calculatorState.monthlyDisposableIncome <= 0) return;

  // Get the current input field and its value
  const input = event.target;

  // Store cursor position before formatting
  const cursorPosition = input.selectionStart;
  const oldValue = input.value;

  let value = input.value.replace(/[^0-9.]/g, ""); // Remove non-numeric characters except decimal
  value = parseFloat(value) || 0;

  // Calculate the percentage based on the amount
  const percentage = (value / calculatorState.monthlyDisposableIncome) * 100;

  // Update the corresponding percentage input
  if (input.id === "customSavingsAmount") {
    savingsPercentageInput.value = percentage.toFixed(1);
  } else if (input.id === "customInvestmentsAmount") {
    investmentsPercentageInput.value = percentage.toFixed(1);
  }

  // Format the amount with currency symbol
  const newValue = formatCurrency(value);
  input.value = newValue;

  // Restore cursor position, accounting for added characters
  const lengthDifference = newValue.length - oldValue.length;
  const newCursorPosition = Math.max(1, cursorPosition + lengthDifference); // Ensure cursor is after '$'
  input.setSelectionRange(newCursorPosition, newCursorPosition);

  // Trigger budget recalculation
  handleExpenseOrAllocationChange();
}

// Add new function to update progress bar
function updateProgressBar(expensesPercentage) {
  const progressIndicator = document.getElementById("progressIndicator");
  const indicatorValue = document.getElementById("indicatorValue");

  if (!progressIndicator || !indicatorValue) return;

  // Calculate position based on percentage
  let position;

  if (expensesPercentage <= 70) {
    // Green zone: 0-70% maps to 0-70% of the bar
    position = (expensesPercentage / 70) * 70;
  } else if (expensesPercentage <= 85) {
    // Amber zone: 70-85% maps to 70-85% of the bar
    position = 70 + ((expensesPercentage - 70) / 15) * 15;
  } else {
    // Red zone: 85%+ maps to 85-100% of the bar
    position = 85 + Math.min((expensesPercentage - 85) / 15, 1) * 15;
  }

  // Ensure position doesn't exceed 100%
  position = Math.min(position, 100);

  // Update indicator position and value
  progressIndicator.style.left = `${position}%`;
  indicatorValue.textContent = `${expensesPercentage.toFixed(1)}%`;

  // Add dynamic color to indicator based on zone
  const indicatorDot = progressIndicator.querySelector(".indicator-dot");
  if (indicatorDot) {
    if (expensesPercentage <= 70) {
      indicatorDot.style.background =
        "linear-gradient(135deg, #10b981, #059669)";
      indicatorDot.style.borderColor = "#047857";
    } else if (expensesPercentage <= 85) {
      indicatorDot.style.background =
        "linear-gradient(135deg, #f59e0b, #d97706)";
      indicatorDot.style.borderColor = "#b45309";
    } else {
      indicatorDot.style.background =
        "linear-gradient(135deg, #ef4444, #dc2626)";
      indicatorDot.style.borderColor = "#b91c1c";
    }
  }
}

function updateExpenseHealthBar(budget) {
  // ... existing code ...
  const hasUserCustomInput = !!(budget && budget.custom_allocations);

  const percentUsed = Math.max(
    0,
    Math.min(100, budget?.expenses_percentage || 0)
  );
  const leftAmount = Math.max(
    0,
    (budget?.monthly_disposable_income || 0) -
      (budget?.total_monthly_expenses || 0)
  );

  // Update only the percentage value; keep gradient and sizing intact
  const usedValueSpan = document.getElementById("expenseUsedValue");
  const usedText = document.getElementById("expenseUsedText");
  if (usedValueSpan) {
    usedValueSpan.textContent = `${percentUsed.toFixed(0)}%`;
  } else if (usedText) {
    // usedText.textContent = `${percentUsed.toFixed(0)}% used`;
  }

  // Right-side label
  const leftText = document.getElementById("expenseLeftText");
  if (leftText) {
    leftText.textContent = `${formatCurrency(
      leftAmount
    )} left of ${formatCurrency(budget?.monthly_disposable_income || 0)}`;
  }

  // Grey overlay covers the unused portion from the right
  const overlay = document.getElementById("expenseHealthBar");
  if (overlay) {
    const remainder = 100 - percentUsed;
    overlay.style.width = `${remainder}%`;
  }

  // If no custom input, set the simple cashflow display from current budget
  if (!hasUserCustomInput) {
    const currentCashflowAmount =
      (budget?.monthly_disposable_income || 0) -
      (budget?.total_monthly_expenses || 0);
    const currentCashflowPct = 100 - (budget?.expenses_percentage || 0);

    const cashflowAmtEl = document.getElementById("customCashflowAmount");
    const cashflowPctEl = document.getElementById("customCashflowPercentage");
    if (cashflowAmtEl) {
      cashflowAmtEl.textContent = formatCurrency(currentCashflowAmount);
    }
    if (cashflowPctEl) {
      cashflowPctEl.textContent = `(${currentCashflowPct.toFixed(1)}%)`;
    }
  }
  // ... existing code ...
}

function updateExpenseCategorySummary(budget) {
  const mdi = budget?.monthly_disposable_income || 0;
  const exp = budget?.living_expenses || {};
  const sum = (ids) => ids.reduce((s, id) => s + (parseFloat(exp[id]) || 0), 0);

  const rows = [
    {
      key: "housing",
      ids: [
        "rent-mortgage",
        "electricity",
        "water",
        "gas-heating",
        "home-insurance",
        "housing-others",
      ],
    },
    {
      key: "living",
      ids: [
        "groceries",
        "phone-bills",
        "subscriptions",
        "internet",
        "clothing",
        "living-others",
      ],
    },
    {
      key: "transportation",
      ids: [
        "car-payment",
        "gas-fuel",
        "car-insurance",
        "public-transit",
        "car-maintenance",
        "transport-others",
      ],
    },
    {
      key: "loans",
      ids: [
        "student-loans",
        "credit-cards",
        "personal-loans",
        "life-insurance",
        "line-of-credit",
        "loan-others",
      ],
    },
    {
      key: "children",
      ids: [
        "school-tuition",
        "childcare",
        "school-supplies",
        "kids-activities",
        "education-savings",
        "children-others",
      ],
    },
    {
      key: "miscellaneous",
      ids: [
        "healthcare",
        "entertainment",
        "dining-out",
        "pets",
        "gifts-donations",
        "misc-others",
      ],
    },
  ];

  rows.forEach(({ key, ids }) => {
    const total = sum(ids);
    const pct = mdi > 0 ? (total / mdi) * 100 : 0;

    const pctEl = document.getElementById(`summary-${key}-pct`);
    const amtEl = document.getElementById(`summary-${key}-amt`);
    if (pctEl) pctEl.textContent = `${pct.toFixed(0)}%`;
    if (amtEl) amtEl.textContent = formatCurrency(total);
  });

  const totalExpEl = document.getElementById("summary-total-expenses");
  if (totalExpEl)
    totalExpEl.textContent = formatCurrency(
      budget?.total_monthly_expenses || 0
    );
}

function initDeductionsNav() {
  const nav = document.getElementById("deductions-nav");
  if (!nav) return;

  const tabs = nav.querySelectorAll(".deductions-tab");
  const contents = {
    taxes: document.getElementById("taxes-content"),
    expenses: document.getElementById("expenses-content"),
    save: document.getElementById("save-invest-content"),
  };

  const setActive = (key) => {
    tabs.forEach((btn) => {
      const active = btn.dataset.tab === key;
      btn.classList.toggle("bg-[#dbece6]", active);
      btn.classList.toggle("font-semibold", active);
      btn.classList.remove("font-semibold");
    });
    Object.entries(contents).forEach(([name, el]) => {
      if (!el) return;
      el.classList.toggle("hidden", name !== key);
    });

    // Auto-render charts when switching to save & invest tab
    if (key === "save") {
      // Use a small delay to ensure the tab content is visible before rendering
      setTimeout(() => {
        debouncedChartUpdate();
      }, 50);
    }
  };

  tabs.forEach((btn) =>
    btn.addEventListener("click", () => setActive(btn.dataset.tab))
  );

  // Default active tab
  setActive("taxes");
}

function switchToExpensesTab() {
  const nav = document.getElementById("deductions-nav");
  if (!nav) return;
  const btn = nav.querySelector('.deductions-tab[data-tab="expenses"]');
  if (btn) btn.click();
}

function switchToTaxesTab() {
  const nav = document.getElementById("deductions-nav");
  if (!nav) return;
  const btn = nav.querySelector('.deductions-tab[data-tab="taxes"]');
  if (btn) btn.click();
  expandIncomeSection();
}

function switchToSaveTab() {
  const nav = document.getElementById("deductions-nav");
  if (!nav) return;
  const btn = nav.querySelector('.deductions-tab[data-tab="save"]');
  if (btn) btn.click();
  if (typeof livingExpensesSection !== "undefined" && livingExpensesSection) {
    const rect = livingExpensesSection.getBoundingClientRect();
    const nearThreshold = window.innerHeight * 0.6;
    if (rect.bottom <= nearThreshold || rect.bottom <= 0) {
      collapseAllExpenses();
    }
  }

  // Immediately update charts when switching to save tab
  setTimeout(() => {
    debouncedChartUpdate();
  }, 100);
}

// Start the application once the DOM is fully loaded.
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  initDeductionsNav();

  // Set up visibility observer for save & invest tab to ensure charts render properly
  const saveInvestTab = document.getElementById("save-invest-content");
  if (saveInvestTab) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const isVisible = !saveInvestTab.classList.contains("hidden");
          if (isVisible) {
            // Tab became visible, update charts with a small delay
            setTimeout(() => {
              debouncedChartUpdate();
            }, 100);
          }
        }
      });
    });

    observer.observe(saveInvestTab, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  const printDownloadBtn = document.getElementById("print-download-btn");
  const resultsWrapper = document.getElementById(
    "deductions-disposable-section"
  );
  const taxesContent = document.getElementById("taxes-content");

  function handlePrint() {
    if (resultsWrapper && resultsWrapper.classList.contains("hidden")) {
      resultsWrapper.classList.remove("hidden");
    }

    const expensesContent = document.getElementById("expenses-content");
    const saveInvestContent = document.getElementById("save-invest-content");

    let activeTabKey = "taxes";
    if (saveInvestContent && !saveInvestContent.classList.contains("hidden")) {
      activeTabKey = "save";
    } else if (
      expensesContent &&
      !expensesContent.classList.contains("hidden")
    ) {
      activeTabKey = "expenses";
    } else if (taxesContent && !taxesContent.classList.contains("hidden")) {
      activeTabKey = "taxes";
    }

    const initialStates = {
      taxes: taxesContent ? !taxesContent.classList.contains("hidden") : false,
      expenses: expensesContent
        ? !expensesContent.classList.contains("hidden")
        : false,
      save: saveInvestContent
        ? !saveInvestContent.classList.contains("hidden")
        : false,
    };

    if (taxesContent)
      taxesContent.classList.toggle("hidden", activeTabKey !== "taxes");
    if (expensesContent)
      expensesContent.classList.toggle("hidden", activeTabKey !== "expenses");
    if (saveInvestContent)
      saveInvestContent.classList.toggle("hidden", activeTabKey !== "save");

    const prevPosition = resultsWrapper ? resultsWrapper.style.position : "";
    const prevTop = resultsWrapper ? resultsWrapper.style.top : "";
    if (resultsWrapper) {
      resultsWrapper.style.position = "static";
      resultsWrapper.style.top = "auto";
    }

    const delay = activeTabKey === "save" ? 400 : 200;
    if (activeTabKey === "save") {
      debouncedChartUpdate();
    }
    if (activeTabKey === "expenses") {
      try {
        handleExpenseOrAllocationChange();
      } catch (e) {}
    }

    const restore = () => {
      if (resultsWrapper) {
        resultsWrapper.style.position = prevPosition || "";
        resultsWrapper.style.top = prevTop || "";
      }
      if (taxesContent)
        taxesContent.classList.toggle("hidden", !initialStates.taxes);
      if (expensesContent)
        expensesContent.classList.toggle("hidden", !initialStates.expenses);
      if (saveInvestContent)
        saveInvestContent.classList.toggle("hidden", !initialStates.save);
      window.removeEventListener("afterprint", restore);
    };

    window.addEventListener("beforeprint", () => {
      if (activeTabKey === "save") debouncedChartUpdate();
    });
    window.addEventListener("afterprint", restore);

    setTimeout(() => {
      window.print();
    }, delay);

    setTimeout(restore, delay + 800);
  }

  function handleDirectDownloadPDF() {
    // Ensure results wrapper is visible
    if (resultsWrapper && resultsWrapper.classList.contains("hidden")) {
      resultsWrapper.classList.remove("hidden");
    }

    // Detect which tab is currently active by checking which content is visible
    const expensesContent = document.getElementById("expenses-content");
    const saveInvestContent = document.getElementById("save-invest-content");

    let activeTabKey = "taxes"; // Default to taxes
    if (saveInvestContent && !saveInvestContent.classList.contains("hidden")) {
      activeTabKey = "save";
    } else if (
      expensesContent &&
      !expensesContent.classList.contains("hidden")
    ) {
      activeTabKey = "expenses";
    } else if (taxesContent && !taxesContent.classList.contains("hidden")) {
      activeTabKey = "taxes";
    }

    // Ensure the currently active tab content is visible
    // Capture initial visibility states to restore after export
    const initialTabStates = {
      taxes: taxesContent ? !taxesContent.classList.contains("hidden") : false,
      expenses: expensesContent
        ? !expensesContent.classList.contains("hidden")
        : false,
      save: saveInvestContent
        ? !saveInvestContent.classList.contains("hidden")
        : false,
    };

    // Hide other tabs to ensure only the active one is captured
    if (taxesContent) {
      taxesContent.classList.toggle("hidden", activeTabKey !== "taxes");
    }
    if (expensesContent) {
      expensesContent.classList.toggle("hidden", activeTabKey !== "expenses");
    }
    if (saveInvestContent) {
      saveInvestContent.classList.toggle("hidden", activeTabKey !== "save");
    }

    const target = document.body;

    const prevPosition = resultsWrapper ? resultsWrapper.style.position : "";
    const prevTop = resultsWrapper ? resultsWrapper.style.top : "";
    if (resultsWrapper) {
      resultsWrapper.style.position = "static";
      resultsWrapper.style.top = "auto";
    }

    setTimeout(() => {
      if (activeTabKey === "save" && saveInvestContent) {
        debouncedChartUpdate();
      }
      if (activeTabKey === "expenses") {
        try {
          handleExpenseOrAllocationChange();
        } catch (e) {}
      }

      setTimeout(() => {
        const opt = {
          margin: 10,
          filename: "Steward Well Capital - Budget Results.pdf",
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            scrollY: -window.scrollY,
            windowWidth: document.documentElement.scrollWidth,
            windowHeight: document.documentElement.scrollHeight,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        };

        try {
          const worker = html2pdf().set(opt).from(target).save();
          if (worker && typeof worker.then === "function") {
            worker
              .then(() => {
                if (resultsWrapper) {
                  resultsWrapper.style.position = prevPosition || "";
                  resultsWrapper.style.top = prevTop || "";
                }
                if (taxesContent) {
                  taxesContent.classList.toggle(
                    "hidden",
                    !initialTabStates.taxes
                  );
                }
                if (expensesContent) {
                  expensesContent.classList.toggle(
                    "hidden",
                    !initialTabStates.expenses
                  );
                }
                if (saveInvestContent) {
                  saveInvestContent.classList.toggle(
                    "hidden",
                    !initialTabStates.save
                  );
                }
              })
              .catch((err) => {
                console.error("PDF generation error:", err);
                if (resultsWrapper) {
                  resultsWrapper.style.position = prevPosition || "";
                  resultsWrapper.style.top = prevTop || "";
                }
                saveElementAsPdf(target).then((ok) => {
                  if (!ok) handlePrint();
                });
              });
          } else {
            setTimeout(() => {
              if (resultsWrapper) {
                resultsWrapper.style.position = prevPosition || "";
                resultsWrapper.style.top = prevTop || "";
              }
              saveElementAsPdf(target).then((ok) => {
                if (!ok) handlePrint();
              });
            }, 800);
          }
        } catch (e) {
          console.error("PDF generation error:", e);
          setTimeout(() => {
            saveElementAsPdf(target).then((ok) => {
              if (!ok) handlePrint();
            });
          }, 800);
        }
      }, 500); // Increased delay to ensure charts are fully rendered
    }, 200);
  }

  if (printDownloadBtn) {
    printDownloadBtn.addEventListener("click", (evt) => {
      evt.preventDefault();
      handleDirectDownloadPDF();
    });
  }
});

function saveElementAsPdf(el) {
  const lib = window.jspdf || {};
  const PDF = lib.jsPDF;
  if (!window.html2canvas || !PDF) return Promise.resolve(false);
  const opts = {
    scale: 2,
    useCORS: true,
    logging: false,
    letterRendering: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    scrollY: -window.scrollY,
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: document.documentElement.scrollHeight,
  };
  return window
    .html2canvas(el, opts)
    .then((canvas) => {
      const doc = new PDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const imgWpx = canvas.width;
      const imgHpx = canvas.height;
      const pxPerMm = imgWpx / pageW;
      const sliceHpx = Math.floor(pageH * pxPerMm);
      let y = 0;
      let page = 0;
      while (y < imgHpx) {
        const slice = document.createElement("canvas");
        slice.width = imgWpx;
        slice.height = Math.min(sliceHpx, imgHpx - y);
        const ctx = slice.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          y,
          imgWpx,
          slice.height,
          0,
          0,
          imgWpx,
          slice.height
        );
        const imgData = slice.toDataURL("image/png", 0.95);
        if (page > 0) doc.addPage();
        doc.addImage(imgData, "PNG", 0, 0, pageW, slice.height / pxPerMm);
        y += sliceHpx;
        page += 1;
      }
      doc.save("Steward Well Capital - Budget Results.pdf");
      return true;
    })
    .catch(() => false);
}
function applyDeductionsVisibility() {
  const container = document.getElementById("deduction-inputs-container");
  if (!container) return;
  const expanded = !!calculatorState.deductionsExpanded;
  Array.from(container.children).forEach((row) => {
    const t = row.getAttribute("data-row-type");
    if (t === "deduction") {
      row.classList.toggle("hidden", !expanded);
    } else if (t === "summary") {
      row.classList.remove("hidden");
    }
  });
  const btn = document.getElementById("toggle-deductions-btn");
  if (btn) {
    btn.querySelector("span").textContent = expanded
      ? "Collapse deductions"
      : "Expand deductions";
  }
}
const toggleDeductionsBtn = document.getElementById("toggle-deductions-btn");
if (toggleDeductionsBtn) {
  toggleDeductionsBtn.addEventListener("click", () => {
    calculatorState.deductionsExpanded = !calculatorState.deductionsExpanded;
    applyDeductionsVisibility();
  });
}
