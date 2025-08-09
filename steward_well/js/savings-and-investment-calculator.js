document.addEventListener("DOMContentLoaded", function () {
  // --- Global variables and constants ---
  const charts = {};

  // --- DOM element references ---
  // end amount tab references starts here
  const endAmountTab = document.getElementById("end-amount");
  const endAmountSection = document.getElementById("default-input-section");
  const startingAmountInput = document.getElementById("starting-amount");
  const afterInput = document.getElementById("after");
  const returnRateInput = document.getElementById("return-rate");
  const compoundSelect = document.getElementById("compound"); // Kept for future use, though currently fixed to annual
  const additionalContributionInput = document.getElementById(
    "additional-contribution"
  );
  const contributionTimingInputs = document.querySelectorAll(
    'input[name="return-timing"]'
  );
  // end amount tab references ends here

  // SO SEIG THE REMAINING TAB AND INPUT REFERENCES SHOULD BE PUT HERE, TAKE A LOOK AT THE ENDAMOUNT TAB REFERENCES IF YOU ARE LOST

  // additional-contribution amount references starts here
  const additionalContributionTab = document.getElementById(
    "additional-contribution"
  );
  const additionalContributionSection = document.getElementById(
    "additional-contribution-input-section"
  );
  // additional-contribution amount references ends here

  // return-rate references starts here
  const returnRateTab = document.getElementById("return-rate");
  const returnRateSection = document.getElementById("return-rate-section");
  // return-rate references ends here

  // starting amount references starts here
  const startAmountTab = document.getElementById("starting-amount");
  const startAmountSection = document.getElementById("starting-amount-section");
  // starting amount references ends here

  // investment length amount starts here
  const investmentLengthTab = document.getElementById("investment-length");
  const investmentLengthSection = document.getElementById("investment-length-section");
  // investment length ends here

  // --- Result display elements ---
  const resultBalanceEnd = document.getElementById("result-balance-end");
  const resultStartEnd = document.getElementById("result-start-end");
  const resultContribEnd = document.getElementById("result-contrib-end");
  const resultInterestEnd = document.getElementById("result-interest-end");

  // --- Tab elements ---
  const resultsTab = document.getElementById("results-tab");
  const yearlyProjectionTab = document.getElementById("yearly-projection-tab");
  const resultsContent = document.getElementById("results-content");
  const yearlyProjectionContent = document.getElementById(
    "yearly-projection-content"
  );

  // --- Tab functionality ---
  function switchToResultsTab() {
    // Update tab styles
    resultsTab.classList.remove("text-gray-500");
    resultsTab.classList.add(
      "text-green-700",
      "border-b-2",
      "border-green-700"
    );
    yearlyProjectionTab.classList.remove(
      "text-green-700",
      "border-b-2",
      "border-green-700"
    );
    yearlyProjectionTab.classList.add("text-gray-500");

    // Show/hide content
    resultsContent.classList.remove("hidden");
    yearlyProjectionContent.classList.add("hidden");

    // Update the pie chart when switching back to results tab
    updateCalculations();
  }

  function switchToYearlyProjectionTab() {
    // Update tab styles
    yearlyProjectionTab.classList.remove("text-gray-500");
    yearlyProjectionTab.classList.add(
      "text-green-700",
      "border-b-2",
      "border-green-700"
    );
    resultsTab.classList.remove(
      "text-green-700",
      "border-b-2",
      "border-green-700"
    );
    resultsTab.classList.add("text-gray-500");

    // Show/hide content
    yearlyProjectionContent.classList.remove("hidden");
    resultsContent.classList.add("hidden");

    // Update the yearly projection chart when tab is switched
    updateYearlyProjectionChart();
  }

  // Add event listeners for tabs
  if (resultsTab) {
    resultsTab.addEventListener("click", switchToResultsTab);
  }
  if (yearlyProjectionTab) {
    yearlyProjectionTab.addEventListener("click", switchToYearlyProjectionTab);
  }

  function calculateEndAmount(
    startingAmount,
    additionalContribution,
    returnRate,
    years,
    contributionTiming
  ) {
    const PV = parseFloat(startingAmount) || 0;
    // The main contribution input is treated as an ANNUAL amount.
    const annualPMT = parseFloat(additionalContribution) || 0;
    const annualRate = parseFloat(returnRate) / 100;
    const investmentYears = parseFloat(years) || 0;

    // If there's no money invested or contributed, return zeroed-out results.
    if (PV === 0 && annualPMT === 0) {
      return {
        endBalance: 0,
        startingAmount: 0,
        totalContributions: 0,
        totalInterest: 0,
      };
    }

    let r, n, pmt, totalContributions;
    let FV = 0;

    // Determine calculation parameters based on contribution timing
    const isMonthly =
      contributionTiming === "beginning" || contributionTiming === "end";

    if (isMonthly) {
      // Monthly contributions
      r = annualRate / 12; // Monthly interest rate
      n = investmentYears * 12; // Total number of months
      pmt = annualPMT / 12; // Monthly contribution amount
    } else {
      // Annual contributions
      r = annualRate; // Annual interest rate
      n = investmentYears; // Total number of years
      pmt = annualPMT; // Annual contribution amount
    }

    // Total contributions over the investment period
    totalContributions = pmt * n;

    // --- Core Future Value (FV) Calculation ---

    // 1. Calculate the future value of the initial starting amount (PV)
    let fvOfPV = PV * Math.pow(1 + r, n);

    // 2. Calculate the future value of the series of contributions (annuity)
    let fvOfAnnuity = 0;
    if (pmt > 0) {
      if (r > 0) {
        // Standard future value of annuity formula
        fvOfAnnuity = pmt * ((Math.pow(1 + r, n) - 1) / r);

        // If contributions are at the beginning of the period (Annuity Due),
        // it gets one extra period of interest.
        if (
          contributionTiming === "beginning" ||
          contributionTiming === "year-beginning"
        ) {
          fvOfAnnuity *= 1 + r;
        }
      } else {
        // If there's no interest, the future value is just the sum of all contributions.
        fvOfAnnuity = pmt * n;
      }
    }

    // 3. The final End Balance is the sum of both parts.
    FV = fvOfPV + fvOfAnnuity;

    // 4. Calculate total interest earned.
    const totalInterest = FV - PV - totalContributions;

    return {
      endBalance: FV,
      startingAmount: PV,
      totalContributions: totalContributions,
      totalInterest: Math.max(0, totalInterest), // Interest can't be negative
    };
  }

  // --- Yearly Projection Chart Functions ---
  function calculateYearlyProjection() {
    const startingAmount = parseFloat(startingAmountInput?.value) || 0;
    const inputYears = parseFloat(afterInput?.value) || 1;
    const displayYears = Math.min(inputYears, 10); // Cap at 10 years maximum
    const returnRate = parseFloat(returnRateInput?.value) || 0;
    const additionalContribution =
      parseFloat(additionalContributionInput?.value) || 0;

    // Get selected contribution timing
    let contributionTiming = "year-end";
    contributionTimingInputs.forEach((input) => {
      if (input.checked) {
        contributionTiming = input.value;
      }
    });

    const yearlyData = [];

    for (let year = 1; year <= displayYears; year++) {
      const results = calculateEndAmount(
        startingAmount,
        additionalContribution,
        returnRate,
        year,
        contributionTiming
      );

      yearlyData.push({
        year: year,
        startingAmount: results.startingAmount,
        totalContributions: results.totalContributions,
        totalInterest: results.totalInterest,
        endBalance: results.endBalance,
      });
    }

    return yearlyData;
  }

  function createYearlyProjectionChart(yearlyData) {
    if (charts["yearly"]) {
      charts["yearly"].destroy();
    }

    const canvas = document.getElementById("yearlyProjectionChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const labels = yearlyData.map((data) => `Year ${data.year}`);
    const startingAmounts = yearlyData.map((data) => data.startingAmount);
    const contributions = yearlyData.map((data) => data.totalContributions);
    const interests = yearlyData.map((data) => data.totalInterest);

    charts["yearly"] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Starting Amount",
            data: startingAmounts,
            backgroundColor: "#3b82f6",
            borderColor: "#2563eb",
            borderWidth: 1,
          },
          {
            label: "Total Contributions",
            data: contributions,
            backgroundColor: "#22c55e",
            borderColor: "#16a34a",
            borderWidth: 1,
          },
          {
            label: "Interest Earned",
            data: interests,
            backgroundColor: "#ef4444",
            borderColor: "#dc2626",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: "Investment Timeline",
            },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            title: {
              display: true,
              text: "Amount ($)",
            },
            ticks: {
              callback: function (value) {
                return "$" + value.toLocaleString();
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false, // We have custom legend below the chart
          },
          tooltip: {
            callbacks: {
              title: function (context) {
                return context[0].label;
              },
              label: function (context) {
                const value = context.parsed.y;
                return (
                  context.dataset.label +
                  ": $" +
                  value.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                );
              },
              footer: function (context) {
                const dataIndex = context[0].dataIndex;
                const data = yearlyData[dataIndex];
                return (
                  "Total: $" +
                  data.endBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                );
              },
            },
          },
        },
      },
    });
  }

  function updateYearlyProjectionChart() {
    const yearlyData = calculateYearlyProjection();
    createYearlyProjectionChart(yearlyData);
  }

  // --- Real-time calculation and update function ---
  function updateCalculations() {
    const startingAmount = startingAmountInput?.value || 0;
    const years = afterInput?.value || 0;
    const returnRate = returnRateInput?.value || 0;
    const additionalContribution = additionalContributionInput?.value || 0;

    // Get selected contribution timing
    let contributionTiming = "year-end"; // Default value
    contributionTimingInputs.forEach((input) => {
      if (input.checked) {
        contributionTiming = input.value;
      }
    });

    // Calculate results using the updated function
    const results = calculateEndAmount(
      startingAmount,
      additionalContribution,
      returnRate,
      years,
      contributionTiming
    );

    // Update dynamic description
    updateResultDescription(
      startingAmount,
      returnRate,
      years,
      additionalContribution,
      results.endBalance
    );

    // Update result displays with proper formatting
    if (resultBalanceEnd) {
      resultBalanceEnd.textContent = `$${results.endBalance.toLocaleString(
        "en-US",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}`;
    }
    if (resultStartEnd) {
      resultStartEnd.textContent = `$${results.startingAmount.toLocaleString(
        "en-US",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}`;
    }
    if (resultContribEnd) {
      resultContribEnd.textContent = `$${results.totalContributions.toLocaleString(
        "en-US",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}`;
    }
    if (resultInterestEnd) {
      resultInterestEnd.textContent = `$${results.totalInterest.toLocaleString(
        "en-US",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}`;
    }

    // Update the pie chart
    updateChart(results);

    // Update yearly projection chart if it's currently visible
    if (
      yearlyProjectionContent &&
      !yearlyProjectionContent.classList.contains("hidden")
    ) {
      updateYearlyProjectionChart();
    }
  }

  // --- Chart Management Functions ---
  function updateChart(results) {
    const chartData = [
      results.startingAmount,
      results.totalContributions,
      results.totalInterest,
    ];
    // Ensure data is not negative for charting
    const sanitizedData = chartData.map((val) => Math.max(0, val));

    createInvestmentChart("investmentPieChart-end", "end", sanitizedData);
  }

  function createInvestmentChart(canvasId, chartKey, data) {
    if (charts[chartKey]) {
      charts[chartKey].destroy();
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Calculate total for percentage calculation
    const total = data.reduce((sum, value) => sum + value, 0);

    charts[chartKey] = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Starting Amount", "Total Contributions", "Interest"],
        datasets: [
          {
            label: "Investment Breakdown",
            data: data || [0, 0, 0],
            backgroundColor: ["#3b82f6", "#22c55e", "#ef4444"],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false, // This hides the legend
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                if (total === 0) return context.label + ": 0.0%";
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return context.label + ": " + percentage + "%";
              },
            },
          },
        },
        // Custom plugin to draw percentage labels on slices
        animation: {
          onComplete: function (animation) {
            const chart = animation.chart;
            const ctx = chart.ctx;

            ctx.save();
            ctx.font = "bold 14px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            chart.data.datasets.forEach((dataset, datasetIndex) => {
              const meta = chart.getDatasetMeta(datasetIndex);

              meta.data.forEach((element, index) => {
                if (total === 0) return;

                const percentage = (
                  (dataset.data[index] / total) *
                  100
                ).toFixed(1);
                const position = element.tooltipPosition();

                // Only draw if percentage is significant enough to be visible
                if (parseFloat(percentage) > 5) {
                  ctx.fillText(percentage + "%", position.x, position.y);
                }
              });
            });

            ctx.restore();
          },
        },
      },
    });
  }

  // --- UI Management Functions ---
  function setActiveTab(activeTab) {
    const allTabs = [endAmountTab, additionalContributionTab, returnRateTab, startAmountTab, investmentLengthTab];
    const allSections = [endAmountSection, additionalContributionSection, returnRateSection, startAmountSection, investmentLengthSection];

    allTabs.forEach((tab) => {
      if (tab === activeTab) {
        tab.style.opacity = "1";
        tab.style.backgroundColor = "#57f2a9";
        tab.style.color = "#fff";
        tab.style.borderColor = "#57f2a9";
        tab.style.transform = "scale(1.05)";
        tab.style.fontWeight = "600";
        tab.style.boxShadow = "0 4px 12px rgba(87, 242, 169, 0.3)";
      } else {
        tab.style.opacity = "0.5";
        tab.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
        tab.style.color = "#fff";
        tab.style.borderColor = "rgba(255, 255, 255, 0.3)";
        tab.style.transform = "scale(1)";
        tab.style.fontWeight = "400";
        tab.style.boxShadow = "none";
      }
      tab.style.transition = "all 0.3s ease";
    });
  
    // Show/hide sections based on active tab
    allSections.forEach((section) => {
      if (section) {
        if (
          (activeTab === endAmountTab && section === endAmountSection) ||
          (activeTab === additionalContributionTab && section === additionalContributionSection) ||
          (activeTab === returnRateTab && section === returnRateSection) ||
          (activeTab === startAmountTab && section === startAmountSection) ||
          (activeTab === investmentLengthTab && section === investmentLengthSection)) {
          section.classList.remove("hidden");
        } else {
          section.classList.add("hidden");
        }
      }
    });
  }

  // --- Event Listeners for Real-time Calculations ---
  function initializeEventListeners() {
    const inputFields = [
      startingAmountInput,
      afterInput,
      returnRateInput,
      additionalContributionInput,
    ];

    inputFields.forEach((input) => {
      if (input) {
        input.addEventListener("input", updateCalculations);
      }
    });

    if (compoundSelect) {
      compoundSelect.addEventListener("change", updateCalculations);
    }

    contributionTimingInputs.forEach((input) => {
      input.addEventListener("change", updateCalculations);
    });

    if (endAmountTab) {
      endAmountTab.addEventListener("click", function () {
        setActiveTab(endAmountTab);
        updateCalculations();
      });
    }

    // Add event listener for additional contribution tab
    if (additionalContributionTab) {
      additionalContributionTab.addEventListener("click", function () {
        setActiveTab(additionalContributionTab);
        updateCalculations();
      });
    }

    // Add event listener for return rate tab
    if (returnRateTab) {
      returnRateTab.addEventListener("click", function () {
        setActiveTab(returnRateTab);
        updateCalculations();
      });
    }

    // Add event listener for starting amount tab
    if (startAmountTab) {
      startAmountTab.addEventListener("click", function () {
        setActiveTab(startAmountTab);
        updateCalculations();
      });
    }

    // Add event listener for investment length tab
    if (investmentLengthTab) {
      investmentLengthTab.addEventListener("click", function () {
        setActiveTab(investmentLengthTab);
        updateCalculations();
      });
    }
  }

  // --- Initialization ---
  function initialize() {
    initializeEventListeners();

    if (endAmountTab) {
      setActiveTab(endAmountTab);
    }

    // Default to 'End of Each Month'
    if (contributionTimingInputs.length > 1) {
      contributionTimingInputs[1].checked = true;
    }

    // Auto-populate Additional Contribution from budget calculator if available
    const storedAnnualInvestment = localStorage.getItem(
      "budgetAnnualInvestment"
    );
    if (storedAnnualInvestment && additionalContributionInput) {
      const annualAmount = parseFloat(storedAnnualInvestment);
      if (annualAmount > 0) {
        additionalContributionInput.value = Math.round(annualAmount).toString();

        // Add visual indicator that value was auto-populated
        const label =
          additionalContributionInput.parentElement.querySelector("label");
        if (label && !label.querySelector(".auto-populated-indicator")) {
          const indicator = document.createElement("span");
          indicator.className =
            "auto-populated-indicator text-green-600 text-xs ml-2";
          indicator.textContent = "(from budget calculator)";
          label.appendChild(indicator);
        }
      }
    }

    updateCalculations();
  }

  // Start the application
  initialize();
});

// --- Dynamic description update function ---
function updateResultDescription(
  startingAmount,
  returnRate,
  years,
  additionalContribution,
  endBalance
) {
  const descriptionElement = document.getElementById(
    "dynamic-result-description"
  );
  if (!descriptionElement) return;

  const startAmount = parseFloat(startingAmount) || 0;
  const rate = parseFloat(returnRate) || 0;
  const timeYears = parseFloat(years) || 0;
  const contribution = parseFloat(additionalContribution) || 0;

  let description = "";

  if (startAmount === 0 && contribution === 0) {
    description = "Enter your investment details to see your projected results";
  } else if (timeYears === 0) {
    description =
      "Please enter the number of years for your investment timeline";
  } else {
    const formattedEndBalance = endBalance.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    let baseText = "";
    if (startAmount > 0 && contribution > 0) {
      baseText = `Starting with <strong>$${startAmount.toLocaleString(
        "en-US"
      )}</strong> and contributing <strong>$${contribution.toLocaleString(
        "en-US"
      )}</strong> annually`;
    } else if (startAmount > 0) {
      baseText = `Starting with <strong>$${startAmount.toLocaleString(
        "en-US"
      )}</strong>`;
    } else {
      baseText = `Contributing <strong>$${contribution.toLocaleString(
        "en-US"
      )}</strong> annually`;
    }

    description = `${baseText}, your end balance with an interest rate of <strong>${rate}%</strong> over the next <strong>${timeYears} year${
      timeYears !== 1 ? "s" : ""
    }</strong> is <strong>${formattedEndBalance}</strong>.`;
  }

  descriptionElement.innerHTML = description;
}
