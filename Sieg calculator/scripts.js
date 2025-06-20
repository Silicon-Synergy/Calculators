// Calculator logic
// const calculator = {
//   deductionRates: {
//     federal_tax: 0.2,
//     state_tax: 0.08,
//     retirement: 0.1,
//     health_insurance: 0.03,
//     social_security: 0.062,
//     medicare: 0.0145,
//   },

//   calculateDeductions(annualIncome) {
//     const deductions = {};
//     let totalDeductions = 0;

//     for (const deductionType in this.deductionRates) {
//       const rate = this.deductionRates[deductionType];
//       const amount = annualIncome * rate;
//       deductions[deductionType] = amount;
//       totalDeductions += amount;
//     }
//     return { deductions, totalDeductions };
//   },

//   determineBudgetZone(expensesPercentage) {
//     if (expensesPercentage <= 59) {
//       return ["GREEN", "Healthy spending range", "bg-green-500"];
//     } else if (expensesPercentage <= 70) {
//       return ["MODERATE", "Manageable but close to limit", "bg-yellow-500"];
//     } else {
//       return ["RED", "Spending too high", "bg-red-500"];
//     }
//   },

//   allocateFunds(
//     monthlyDisposable,
//     totalMonthlyExpenses,
//     savingsPct,
//     investmentsPct
//   ) {
//     savingsPct = savingsPct || 0;
//     investmentsPct = investmentsPct || 0;

//     const remainingAfterExpenses = monthlyDisposable - totalMonthlyExpenses;
//     const targetCashflow = monthlyDisposable * 0.1;

//     let monthlySavings = 0;
//     let monthlyInvestments = 0;
//     let monthlyCashflow = 0;

//     if (remainingAfterExpenses < targetCashflow) {
//       monthlyCashflow = remainingAfterExpenses;
//     } else {
//       monthlyCashflow = targetCashflow;
//       const remainingForAllocation = remainingAfterExpenses - targetCashflow;

//       const totalDesired =
//         ((savingsPct + investmentsPct) / 100) * monthlyDisposable;

//       if (totalDesired <= remainingForAllocation) {
//         monthlySavings = (savingsPct / 100) * monthlyDisposable;
//         monthlyInvestments = (investmentsPct / 100) * monthlyDisposable;
//       } else {
//         const scale = remainingForAllocation / totalDesired;
//         monthlySavings = (savingsPct / 100) * monthlyDisposable * scale;
//         monthlyInvestments = (investmentsPct / 100) * monthlyDisposable * scale;
//       }
//     }

//     const unallocated =
//       monthlyDisposable -
//       totalMonthlyExpenses -
//       monthlySavings -
//       monthlyInvestments -
//       monthlyCashflow;

//     return {
//       savings: Math.max(0, monthlySavings).toFixed(2),
//       investments: Math.max(0, monthlyInvestments).toFixed(2),
//       cashflow: Math.max(0, monthlyCashflow).toFixed(2),
//       unallocated: Math.max(0, unallocated).toFixed(2),
//     };
//   },
// };

// // UI Update functions
// function updateUI() {
//   console.log("helo");
//   const annualIncome =
//     parseFloat(document.getElementById("annualIncome").value) || 0;
//   const housing = parseFloat(document.getElementById("housing").value) || 0;
//   const transportation =
//     parseFloat(document.getElementById("transportation").value) || 0;
//   const food = parseFloat(document.getElementById("food").value) || 0;
//   const utilities = parseFloat(document.getElementById("utilities").value) || 0;
//   const insurance = parseFloat(document.getElementById("insurance").value) || 0;
//   const other = parseFloat(document.getElementById("other").value) || 0;

//   const totalExpenses =
//     housing + transportation + food + utilities + insurance + other;
//   document.getElementById(
//     "total-expenses"
//   ).textContent = `$${totalExpenses.toFixed(2)}`;

//   // Update chart
//   expenseChart.data.datasets[0].data = [
//     housing,
//     transportation,
//     food,
//     utilities,
//     insurance,
//     other,
//   ];
//   expenseChart.update();

//   // Calculate deductions
//   const { deductions, totalDeductions } =
//     calculator.calculateDeductions(annualIncome);
//   const annualDisposable = annualIncome - totalDeductions;
//   const monthlyDisposable = annualDisposable / 12;

//   // Update deduction displays
//   document.getElementById(
//     "federal-tax"
//   ).textContent = `$${deductions.federal_tax.toFixed(2)}`;
//   document.getElementById(
//     "state-tax"
//   ).textContent = `$${deductions.state_tax.toFixed(2)}`;
//   document.getElementById(
//     "social-security"
//   ).textContent = `$${deductions.social_security.toFixed(2)}`;
//   document.getElementById(
//     "medicare"
//   ).textContent = `$${deductions.medicare.toFixed(2)}`;
//   document.getElementById(
//     "retirement"
//   ).textContent = `$${deductions.retirement.toFixed(2)}`;
//   document.getElementById(
//     "health-insurance"
//   ).textContent = `$${deductions.health_insurance.toFixed(2)}`;
//   document.getElementById(
//     "total-deductions"
//   ).textContent = `$${totalDeductions.toFixed(2)}`;

//   // Update income displays
//   document.getElementById(
//     "monthly-net"
//   ).textContent = `$${monthlyDisposable.toFixed(2)}`;
//   const taxRate = ((totalDeductions / annualIncome) * 100).toFixed(1);
//   document.getElementById("tax-rate").textContent = `${taxRate}%`;

//   // Update budget status
//   const expenseRatio =
//     monthlyDisposable > 0 ? (totalExpenses / monthlyDisposable) * 100 : 0;
//   document.getElementById(
//     "expense-ratio"
//   ).textContent = `${expenseRatio.toFixed(1)}%`;
//   document.getElementById("expense-ratio-bar").style.width = `${Math.min(
//     100,
//     expenseRatio
//   )}%`;

//   const [zone, message, zoneColor] =
//     calculator.determineBudgetZone(expenseRatio);
//   const zoneElement = document.getElementById("budget-zone");
//   zoneElement.textContent = zone;
//   zoneElement.className = `px-2 py-1 rounded-full text-xs font-medium ${zoneColor}`;
//   document.getElementById("budget-message").textContent = message;

//   // Update remaining
//   const remaining = monthlyDisposable - totalExpenses;
//   document.getElementById("remaining").textContent = `$${remaining.toFixed(2)}`;

//   // Update sidebar
//   document.getElementById(
//     "sidebar-net-monthly"
//   ).textContent = `$${monthlyDisposable.toFixed(2)}`;
//   document.getElementById(
//     "sidebar-expenses"
//   ).textContent = `$${totalExpenses.toFixed(2)}`;
//   document.getElementById("sidebar-zone").textContent = zone;
//   document.getElementById(
//     "sidebar-zone"
//   ).className = `inline-block px-2 py-1 rounded-full text-xs font-medium ${zoneColor}`;
//   document.getElementById("sidebar-zone-message").textContent = message;

//   // Update allocations
//   const savingsPercent =
//     parseFloat(document.getElementById("savings-percent").value) || 0;
//   const investmentsPercent =
//     parseFloat(document.getElementById("investments-percent").value) || 0;

//   const allocations = calculator.allocateFunds(
//     monthlyDisposable,
//     totalExpenses,
//     savingsPercent,
//     investmentsPercent
//   );

//   document.getElementById(
//     "savings-amount"
//   ).textContent = `$${allocations.savings}`;
//   document.getElementById(
//     "investments-amount"
//   ).textContent = `$${allocations.investments}`;
//   document.getElementById(
//     "cashflow-amount"
//   ).textContent = `$${allocations.cashflow}`;
//   document.getElementById(
//     "unallocated-amount"
//   ).textContent = `$${allocations.unallocated}`;

//   // Update savings rate in sidebar
//   const savingsRate = (
//     (parseFloat(allocations.savings) / monthlyDisposable) *
//     100
//   ).toFixed(1);
//   document.getElementById(
//     "sidebar-savings-rate"
//   ).textContent = `${savingsRate}%`;

//   // Update recommendations
//   const recommendations = [];
//   if (expenseRatio > 70) {
//     recommendations.push("Reduce expenses to improve financial health");
//   } else if (expenseRatio > 59) {
//     recommendations.push("Monitor spending to stay in green zone");
//   } else {
//     recommendations.push("Consider increasing savings/investments");
//   }

//   const recommendationsList = document.getElementById(
//     "sidebar-recommendations"
//   );
//   recommendationsList.innerHTML = recommendations
//     .map((rec) => `<li>${rec}</li>`)
//     .join("");
// }

// function calculateBudget() {
//   updateUI();

//   // Animate the update
//   const elements = document.querySelectorAll(
//     ".income-card, .expenses-card, .deductions-card, .status-card, .chart-card, .allocations-card"
//   );
//   elements.forEach((el, i) => {
//     el.classList.remove("animate-fade-in");
//     setTimeout(() => {
//       el.classList.add("animate-fade-in");
//     }, i * 100);
//   });
// }

// Set up event listeners
// document.getElementById("annualIncome").addEventListener("input", updateUI);
// document.getElementById("housing").addEventListener("input", updateUI);
// document.getElementById("transportation").addEventListener("input", updateUI);
// document.getElementById("food").addEventListener("input", updateUI);
// document.getElementById("utilities").addEventListener("input", updateUI);
// document.getElementById("insurance").addEventListener("input", updateUI);
// document.getElementById("other").addEventListener("input", updateUI);
// document.getElementById("savings-percent").addEventListener("input", updateUI);
// document
//   .getElementById("investments-percent")
//   .addEventListener("input", updateUI);

// // Initialize with some demo values
// document.getElementById("annualIncome").value = "75000";
// document.getElementById("housing").value = "1200";
// document.getElementById("transportation").value = "300";
// document.getElementById("food").value = "500";
// document.getElementById("utilities").value = "200";
// document.getElementById("insurance").value = "150";
// document.getElementById("other").value = "200";
// document.getElementById("savings-percent").value = "12";
// document.getElementById("investments-percent").value = "15";

// Calculate initial budget
// calculateBudget();

const includeRetirementCheckbox = document.getElementById("includeRetirement");
const retirementInput = document.getElementById("retireqment-input");
const annualIncomeInput = document.getElementById("annualIncome");
const provinceSelect = document.getElementById("dropdownList");

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

const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownList = document.getElementById("dropdownList");
const dropdownSelected = document.getElementById("dropdownSelected");

dropdownBtn.addEventListener("click", () => {
  dropdownList.classList.toggle("hidden");
});

// Populate dropdown list
// FIXED: Populate dropdown list with provinces
function initializeProvinceDropdown() {
  const provinces = TAX_CONFIG.canada.provinces;
  const dropdownList = document.getElementById("dropdownList");

  Object.keys(provinces).forEach((code) => {
    const li = document.createElement("li");
    li.textContent = provinces[code].name;
    li.dataset.value = code;
    li.className = "py-2 px-4 hover:bg-white/10 cursor-pointer";

    li.addEventListener("click", () => {
      document.getElementById("dropdownSelected").textContent =
        provinces[code].name;
      // Store selected value somewhere, maybe in a hidden input:
      document.getElementById("selectedProvince").value = code;
      dropdownList.classList.add("hidden");
    });

    dropdownList.appendChild(li);
  });
}

document.addEventListener("click", (e) => {
  if (!dropdownBtn.contains(e.target) && !dropdownList.contains(e.target)) {
    dropdownList.classList.add("hidden");
  }
});

const radios = document.getElementsByName("retirementOption");
const retirement = document.getElementById("retirementInput");
const inputField = document.getElementById("retirementPercent");

radios.forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.value === "yes") {
      retirement.classList.remove("max-h-0", "opacity-0");
      retirement.classList.add("max-h-40", "opacity-100");
    } else {
      retirement.classList.add("max-h-0", "opacity-0");
      retirement.classList.remove("max-h-40", "opacity-100");
      inputField.value = "";
    }
  });
});

inputField.addEventListener("input", () => {
  const value = parseFloat(inputField.value);
  if (value > 0.1) {
    inputField.value = "0.1";
  }
});

// const annualIncomeInput = document.getElementById("annualIncome").;
annualIncomeInput.value = "";

let annualIncome = 0;
let monthlyDisposableIncome = 0;
let totalMonthlyExpenses = 0;

// Income calculation with modern tax brackets (simplified)
function calculateDeductions(income) {
  const deductionRates = {
    federal_tax: 0.2,
    state_tax: 0.08,
    health_insurance: 0.03,
    social_security: 0.062,
    medicare: 0.015,
    retirement: 0.1,
  };
  const federalTax = income * deductionRates.federal_tax; // Simplified federal tax rate
  const stateTax = income * deductionRates.state_tax; // Simplified state tax rate
  const socialSecurity = Math.min(
    income * deductionRates.social_security,
    160200 * 0.062
  );

  const medicare = income * deductionRates.medicare;
  const healthInsurance = income * deductionRates.health_insurance;
  const retirement = income * deductionRates.retirement;
  const totalDeductions = includeRetirementCheckbox.checked
    ? federalTax +
      stateTax +
      socialSecurity +
      medicare +
      healthInsurance +
      retirement
    : federalTax + stateTax + socialSecurity + medicare + healthInsurance;

  return {
    federal: federalTax,
    state: stateTax,
    socialSecurity: socialSecurity,
    medicare: medicare,
    healthInsurance,
    retirement,
    total: totalDeductions,
  };
}

// Federal Tax
// Provincial Tax (State Tax)
// CPP (Canada Pension Plan)
// Employment Retirement Account (ERA)

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Enable section with animation
function enableSection(sectionId) {
  const section = document.getElementById(sectionId);
  section.classList.remove("opacity-50", "pointer-events-none");
  section.classList.add("animate-slide-up");
}

// Show section with animation
function showSection(sectionId) {
  const section = document.getElementById(sectionId);
  section.classList.remove("hidden");
  section.classList.add("animate-fade-in");
}

function fetchDeductionOverview(e) {
  annualIncome = parseFloat(e.target.value) || 0;
  // const annualIncome = annualIncomeValue;

  if (annualIncome > 0) {
    const deductions = calculateDeductions(annualIncome);
    const disposableIncome = annualIncome - deductions.total;
    monthlyDisposableIncome = disposableIncome / 12;

    document.getElementById("federal-tax").value =
      deductions.federal.toFixed(2) || 0;
    document.getElementById("state-tax").value =
      deductions.state.toFixed(2) || 0;
    document.getElementById("medicare").value =
      deductions.medicare.toFixed(2) || 0;
    document.getElementById("social-security").value =
      deductions.socialSecurity.toFixed(2) || 0;
    document.getElementById("health-insurance").value =
      deductions.healthInsurance.toFixed(2) || 0;
    document.getElementById("retirement").value =
      deductions.retirement.toFixed(2) || 0;

    // Update deductions display
    document.getElementById("totalDeductions").textContent = formatCurrency(
      deductions.total
    );
    document.getElementById("annualDisposable").textContent =
      formatCurrency(disposableIncome);
    document.getElementById("monthlyDisposable").textContent = formatCurrency(
      monthlyDisposableIncome
    );

    // Show deductions section and enable expenses
    showSection("deductions-section");
    enableSection("expenses-section");
  } else {
    document.getElementById("federal-tax").value = "00";
    document.getElementById("state-tax").value = "00";
    document.getElementById("medicare").value = "00";
    document.getElementById("social-security").value = "00";
    document.getElementById("health-insurance").value = "00";
    document.getElementById("retirement").value = "00";
  }
}

// Handle income input
document
  .getElementById("annualIncome")
  .addEventListener("input", fetchDeductionOverview);

// Handle expense inputs
document.querySelectorAll(".expense-field").forEach((input) => {
  input.addEventListener("input", updateExpenses);
});

function updateExpenses() {
  totalMonthlyExpenses = 0;
  document.querySelectorAll(".expense-field").forEach((input) => {
    totalMonthlyExpenses += parseFloat(input.value) || 0;
  });

  if (monthlyDisposableIncome > 0) {
    const percentage = (
      (totalMonthlyExpenses / monthlyDisposableIncome) *
      100
    ).toFixed(1);
    const remaining = monthlyDisposableIncome - totalMonthlyExpenses;

    // Update status display
    document.getElementById("totalExpenses").textContent =
      formatCurrency(totalMonthlyExpenses);
    document.getElementById("expensePercentage").textContent = percentage + "%";
    document.getElementById("remaining").textContent =
      formatCurrency(remaining);

    // Update budget zone
    updateBudgetZone(percentage);

    // Show status section and enable savings
    showSection("status-section");
    enableSection("savings-section");
  }
}

function updateBudgetZone(percentage) {
  const zoneElement = document.getElementById("budgetZone");
  let zoneClass = "";
  let zoneText = "";

  if (percentage <= 50) {
    zoneClass = "bg-green-500";
    zoneText = "Excellent";
  } else if (percentage <= 70) {
    zoneClass = "bg-blue-500";
    zoneText = "Good";
  } else if (percentage <= 90) {
    zoneClass = "bg-yellow-500";
    zoneText = "Caution";
  } else {
    zoneClass = "bg-red-500";
    zoneText = "Danger";
  }

  zoneElement.className = `inline-flex px-3 py-1 rounded-full text-sm font-medium text-white ${zoneClass}`;
  zoneElement.textContent = zoneText;
}

// Handle savings and investment inputs
document
  .getElementById("savingsPercent")
  .addEventListener("input", updateSummary);
document
  .getElementById("investmentPercent")
  .addEventListener("input", updateSummary);

function updateSummary() {
  const savingsPercent =
    parseFloat(document.getElementById("savingsPercent").value) || 10;
  const investmentPercent =
    parseFloat(document.getElementById("investmentPercent").value) || 15;

  const monthlySavings = monthlyDisposableIncome * (savingsPercent / 100);
  const monthlyInvestments =
    monthlyDisposableIncome * (investmentPercent / 100);
  const totalAllocated =
    totalMonthlyExpenses + monthlySavings + monthlyInvestments;
  const cashFlow = monthlyDisposableIncome - totalAllocated;

  // Create comprehensive summary
  const summaryHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
                        <h4 class="text-green-400 font-semibold mb-2">Monthly Income</h4>
                        <p class="text-2xl font-bold text-white">${formatCurrency(
                          monthlyDisposableIncome
                        )}</p>
                    </div>
                    <div class="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/30">
                        <h4 class="text-orange-400 font-semibold mb-2">Monthly Expenses</h4>
                        <p class="text-2xl font-bold text-white">${formatCurrency(
                          totalMonthlyExpenses
                        )}</p>
                    </div>
                    <div class="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-500/30">
                        <h4 class="text-blue-400 font-semibold mb-2">Savings & Investments</h4>
                        <p class="text-2xl font-bold text-white">${formatCurrency(
                          monthlySavings + monthlyInvestments
                        )}</p>
                    </div>
                    <div class="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-6 border border-primary/30">
                        <h4 class="text-primary font-semibold mb-2">Cash Flow</h4>
                        <p class="text-2xl font-bold ${
                          cashFlow >= 0 ? "text-green-400" : "text-red-400"
                        }">${formatCurrency(cashFlow)}</p>
                    </div>
                </div>
                <div class="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                    <h4 class="text-xl font-bold text-white mb-4">Financial Health Score</h4>
                    <div class="flex items-center space-x-4">
                        <div class="flex-1 bg-gray-700 rounded-full h-4">
                            <div class="bg-gradient-to-r from-primary to-secondary h-4 rounded-full transition-all duration-500"
                                 style="width: ${Math.min(
                                   100,
                                   Math.max(
                                     0,
                                     (cashFlow / monthlyDisposableIncome) *
                                       100 +
                                       50
                                   )
                                 )}%"></div>
                        </div>
                        <span class="text-white font-semibold">${Math.round(
                          Math.min(
                            100,
                            Math.max(
                              0,
                              (cashFlow / monthlyDisposableIncome) * 100 + 50
                            )
                          )
                        )}%</span>
                    </div>
                    <p class="text-gray-300 mt-2 text-sm">
                        ${
                          cashFlow >= 0
                            ? "Great job! You have positive cash flow."
                            : "Consider reducing expenses or increasing income."
                        }
                    </p>
                </div>
            `;

  document.getElementById("summaryContent").innerHTML = summaryHTML;
  showSection("summary-section");
}

// ✅ Declare your DOM elements at the top (or inside a startup/init function)
// const includeRetirementCheckbox = document.getElementById("includeRetirementCheckbox");
// const retirementInput = document.getElementById("retirementInput");
// const annualIncomeInput = document.getElementById("annualIncomeInput");

// ✅ Now use them
const handleDisplayRetirementInput = () => {
  const checked = includeRetirementCheckbox.checked;
  // retirementInput.style.display = checked ? "block" : "none";
};

includeRetirementCheckbox.addEventListener(
  "click",
  handleDisplayRetirementInput
);

const startUp = () => {
  const annualIncomeValue = annualIncomeInput.value;

  if (annualIncomeValue > 0) {
    showSection("deductions-section");
  }

  handleDisplayRetirementInput(); // will now work because variables are defined
};

// ✅ Wait for the DOM to be fully loaded before running this
document.addEventListener("DOMContentLoaded", startUp);

function initializeApp() {
  initializeProvinceDropdown();
  // createExpenseInputs();
}

// Start the application once the script loads.
initializeApp();
