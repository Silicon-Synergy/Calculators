const ctx = document.getElementById("expenseChart").getContext("2d");
const expenseChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: [
      "Housing",
      "Transportation",
      "Food",
      "Utilities",
      "Insurance",
      "Other",
    ],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: [
          "#6366F1",
          "#8B5CF6",
          "#EC4899",
          "#F43F5E",
          "#F59E0B",
          "#10B981",
        ],
        borderWidth: 0,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#E5E7EB",
          font: {
            size: 12,
          },
        },
      },
    },
    cutout: "70%",
  },
});

// Calculator logic
const calculator = {
  deductionRates: {
    federal_tax: 0.2,
    state_tax: 0.08,
    retirement: 0.1,
    health_insurance: 0.03,
    social_security: 0.062,
    medicare: 0.0145,
  },

  calculateDeductions(annualIncome) {
    const deductions = {};
    let totalDeductions = 0;

    for (const deductionType in this.deductionRates) {
      const rate = this.deductionRates[deductionType];
      const amount = annualIncome * rate;
      deductions[deductionType] = amount;
      totalDeductions += amount;
    }
    return { deductions, totalDeductions };
  },

  determineBudgetZone(expensesPercentage) {
    if (expensesPercentage <= 59) {
      return ["GREEN", "Healthy spending range", "bg-green-500"];
    } else if (expensesPercentage <= 70) {
      return ["MODERATE", "Manageable but close to limit", "bg-yellow-500"];
    } else {
      return ["RED", "Spending too high", "bg-red-500"];
    }
  },

  allocateFunds(
    monthlyDisposable,
    totalMonthlyExpenses,
    savingsPct,
    investmentsPct
  ) {
    savingsPct = savingsPct || 0;
    investmentsPct = investmentsPct || 0;

    const remainingAfterExpenses = monthlyDisposable - totalMonthlyExpenses;
    const targetCashflow = monthlyDisposable * 0.1;

    let monthlySavings = 0;
    let monthlyInvestments = 0;
    let monthlyCashflow = 0;

    if (remainingAfterExpenses < targetCashflow) {
      monthlyCashflow = remainingAfterExpenses;
    } else {
      monthlyCashflow = targetCashflow;
      const remainingForAllocation = remainingAfterExpenses - targetCashflow;

      const totalDesired =
        ((savingsPct + investmentsPct) / 100) * monthlyDisposable;

      if (totalDesired <= remainingForAllocation) {
        monthlySavings = (savingsPct / 100) * monthlyDisposable;
        monthlyInvestments = (investmentsPct / 100) * monthlyDisposable;
      } else {
        const scale = remainingForAllocation / totalDesired;
        monthlySavings = (savingsPct / 100) * monthlyDisposable * scale;
        monthlyInvestments = (investmentsPct / 100) * monthlyDisposable * scale;
      }
    }

    const unallocated =
      monthlyDisposable -
      totalMonthlyExpenses -
      monthlySavings -
      monthlyInvestments -
      monthlyCashflow;

    return {
      savings: Math.max(0, monthlySavings).toFixed(2),
      investments: Math.max(0, monthlyInvestments).toFixed(2),
      cashflow: Math.max(0, monthlyCashflow).toFixed(2),
      unallocated: Math.max(0, unallocated).toFixed(2),
    };
  },
};

// UI Update functions
function updateUI() {
  const annualIncome =
    parseFloat(document.getElementById("annualIncome").value) || 0;
  const housing = parseFloat(document.getElementById("housing").value) || 0;
  const transportation =
    parseFloat(document.getElementById("transportation").value) || 0;
  const food = parseFloat(document.getElementById("food").value) || 0;
  const utilities = parseFloat(document.getElementById("utilities").value) || 0;
  const insurance = parseFloat(document.getElementById("insurance").value) || 0;
  const other = parseFloat(document.getElementById("other").value) || 0;

  const totalExpenses =
    housing + transportation + food + utilities + insurance + other;
  document.getElementById(
    "total-expenses"
  ).textContent = `$${totalExpenses.toFixed(2)}`;

  // Update chart
  expenseChart.data.datasets[0].data = [
    housing,
    transportation,
    food,
    utilities,
    insurance,
    other,
  ];
  expenseChart.update();

  // Calculate deductions
  const { deductions, totalDeductions } =
    calculator.calculateDeductions(annualIncome);
  const annualDisposable = annualIncome - totalDeductions;
  const monthlyDisposable = annualDisposable / 12;

  // Update deduction displays
  document.getElementById(
    "federal-tax"
  ).textContent = `$${deductions.federal_tax.toFixed(2)}`;
  document.getElementById(
    "state-tax"
  ).textContent = `$${deductions.state_tax.toFixed(2)}`;
  document.getElementById(
    "social-security"
  ).textContent = `$${deductions.social_security.toFixed(2)}`;
  document.getElementById(
    "medicare"
  ).textContent = `$${deductions.medicare.toFixed(2)}`;
  document.getElementById(
    "retirement"
  ).textContent = `$${deductions.retirement.toFixed(2)}`;
  document.getElementById(
    "health-insurance"
  ).textContent = `$${deductions.health_insurance.toFixed(2)}`;
  document.getElementById(
    "total-deductions"
  ).textContent = `$${totalDeductions.toFixed(2)}`;

  // Update income displays
  document.getElementById(
    "monthly-net"
  ).textContent = `$${monthlyDisposable.toFixed(2)}`;
  const taxRate = ((totalDeductions / annualIncome) * 100).toFixed(1);
  document.getElementById("tax-rate").textContent = `${taxRate}%`;

  // Update budget status
  const expenseRatio =
    monthlyDisposable > 0 ? (totalExpenses / monthlyDisposable) * 100 : 0;
  document.getElementById(
    "expense-ratio"
  ).textContent = `${expenseRatio.toFixed(1)}%`;
  document.getElementById("expense-ratio-bar").style.width = `${Math.min(
    100,
    expenseRatio
  )}%`;

  const [zone, message, zoneColor] =
    calculator.determineBudgetZone(expenseRatio);
  const zoneElement = document.getElementById("budget-zone");
  zoneElement.textContent = zone;
  zoneElement.className = `px-2 py-1 rounded-full text-xs font-medium ${zoneColor}`;
  document.getElementById("budget-message").textContent = message;

  // Update remaining
  const remaining = monthlyDisposable - totalExpenses;
  document.getElementById("remaining").textContent = `$${remaining.toFixed(2)}`;

  // Update sidebar
  document.getElementById(
    "sidebar-net-monthly"
  ).textContent = `$${monthlyDisposable.toFixed(2)}`;
  document.getElementById(
    "sidebar-expenses"
  ).textContent = `$${totalExpenses.toFixed(2)}`;
  document.getElementById("sidebar-zone").textContent = zone;
  document.getElementById(
    "sidebar-zone"
  ).className = `inline-block px-2 py-1 rounded-full text-xs font-medium ${zoneColor}`;
  document.getElementById("sidebar-zone-message").textContent = message;

  // Update allocations
  const savingsPercent =
    parseFloat(document.getElementById("savings-percent").value) || 0;
  const investmentsPercent =
    parseFloat(document.getElementById("investments-percent").value) || 0;

  const allocations = calculator.allocateFunds(
    monthlyDisposable,
    totalExpenses,
    savingsPercent,
    investmentsPercent
  );

  document.getElementById(
    "savings-amount"
  ).textContent = `$${allocations.savings}`;
  document.getElementById(
    "investments-amount"
  ).textContent = `$${allocations.investments}`;
  document.getElementById(
    "cashflow-amount"
  ).textContent = `$${allocations.cashflow}`;
  document.getElementById(
    "unallocated-amount"
  ).textContent = `$${allocations.unallocated}`;

  // Update savings rate in sidebar
  const savingsRate = (
    (parseFloat(allocations.savings) / monthlyDisposable) *
    100
  ).toFixed(1);
  document.getElementById(
    "sidebar-savings-rate"
  ).textContent = `${savingsRate}%`;

  // Update recommendations
  const recommendations = [];
  if (expenseRatio > 70) {
    recommendations.push("Reduce expenses to improve financial health");
  } else if (expenseRatio > 59) {
    recommendations.push("Monitor spending to stay in green zone");
  } else {
    recommendations.push("Consider increasing savings/investments");
  }

  const recommendationsList = document.getElementById(
    "sidebar-recommendations"
  );
  recommendationsList.innerHTML = recommendations
    .map((rec) => `<li>${rec}</li>`)
    .join("");
}

function calculateBudget() {
  updateUI();

  // Animate the update
  const elements = document.querySelectorAll(
    ".income-card, .expenses-card, .deductions-card, .status-card, .chart-card, .allocations-card"
  );
  elements.forEach((el, i) => {
    el.classList.remove("animate-fade-in");
    setTimeout(() => {
      el.classList.add("animate-fade-in");
    }, i * 100);
  });
}

// Set up event listeners
document.getElementById("annualIncome").addEventListener("input", updateUI);
document.getElementById("housing").addEventListener("input", updateUI);
document.getElementById("transportation").addEventListener("input", updateUI);
document.getElementById("food").addEventListener("input", updateUI);
document.getElementById("utilities").addEventListener("input", updateUI);
document.getElementById("insurance").addEventListener("input", updateUI);
document.getElementById("other").addEventListener("input", updateUI);
document.getElementById("savings-percent").addEventListener("input", updateUI);
document
  .getElementById("investments-percent")
  .addEventListener("input", updateUI);

// Initialize with some demo values
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
calculateBudget();
