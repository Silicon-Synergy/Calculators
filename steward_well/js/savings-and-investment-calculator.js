document.addEventListener("DOMContentLoaded", function () {
  // --- Global variables and constants ---
  const charts = {};
  let currentTab = "end-amount";

  // --- DOM element references ---
  const endAmountTab = document.getElementById("end-amount");
  const additionalContributionTab = document.getElementById(
    "additional-contribution-tab"
  );

  // End Amount tab elements
  const startingAmountInput = document.getElementById("starting-amount");
  const afterInput = document.getElementById("after");
  const returnRateInput = document.getElementById("return-rate");
  const compoundSelect = document.getElementById("compound");
  const additionalContributionInput = document.getElementById(
    "additional-contribution"
  );
  const contributionTimingInputs = document.querySelectorAll(
    'input[name="return-timing"]'
  );

  // Additional Contribution tab elements
  const targetAmountInput = document.getElementById("target-amount");
  const startingAmountContribInput = document.getElementById(
    "starting-amount-contrib"
  );
  const afterContribInput = document.getElementById("after-contrib");
  const returnRateContribInput = document.getElementById("return-rate-contrib");
  const compoundContribSelect = document.getElementById("compound-contrib");
  const contributionTimingContribInputs = document.querySelectorAll(
    'input[name="return-timing-contrib"]'
  );

  // Content containers
  const endAmountContent = document.getElementById("end-amount-content");
  const additionalContributionContent = document.getElementById(
    "additional-contribution-content"
  );

  // --- Result display elements ---
  // End Amount results
  const resultBalanceEnd = document.getElementById("result-balance-end");
  const resultStartEnd = document.getElementById("result-start-end");
  const resultContribEnd = document.getElementById("result-contrib-end");
  const resultInterestEnd = document.getElementById("result-interest-end");

  // Additional Contribution results
  const resultTargetContrib = document.getElementById("result-target-contrib");
  const resultStartContrib = document.getElementById("result-start-contrib");
  const resultRequiredContrib = document.getElementById(
    "result-required-contrib"
  );
  const resultInterestContrib = document.getElementById(
    "result-interest-contrib"
  );

  // --- Tab elements ---
  const resultsTab = document.getElementById("results-tab");
  const yearlyProjectionTab = document.getElementById("yearly-projection-tab");
  const resultsContent = document.getElementById("results-content");
  const yearlyProjectionContent = document.getElementById(
    "yearly-projection-content"
  );

  // Additional Contribution tab elements
  const resultsTabContrib = document.getElementById("results-tab-contrib");
  const yearlyProjectionTabContrib = document.getElementById(
    "yearly-projection-tab-contrib"
  );
  const resultsContentContrib = document.getElementById(
    "results-content-contrib"
  );
  const yearlyProjectionContentContrib = document.getElementById(
    "yearly-projection-content-contrib"
  );

  // --- Main Tab functionality ---
  function switchToEndAmountTab() {
    currentTab = "end-amount";

    // Update main tab styles
    endAmountTab.style.opacity = "1";
    endAmountTab.style.backgroundColor = "#57f2a9";
    endAmountTab.style.transform = "scale(1.05)";
    endAmountTab.style.fontWeight = "600";
    endAmountTab.style.boxShadow = "0 4px 12px rgba(87, 242, 169, 0.3)";

    additionalContributionTab.style.opacity = "0.5";
    additionalContributionTab.style.backgroundColor =
      "rgba(255, 255, 255, 0.1)";
    additionalContributionTab.style.transform = "scale(1)";
    additionalContributionTab.style.fontWeight = "400";
    additionalContributionTab.style.boxShadow = "none";

    // Show/hide content
    endAmountContent.classList.remove("hidden");
    additionalContributionContent.classList.add("hidden");

    // Update calculations
    updateCalculations();
  }

  function switchToAdditionalContributionTab() {
    currentTab = "additional-contribution";

    // Update main tab styles
    additionalContributionTab.style.opacity = "1";
    additionalContributionTab.style.backgroundColor = "#57f2a9";
    additionalContributionTab.style.transform = "scale(1.05)";
    additionalContributionTab.style.fontWeight = "600";
    additionalContributionTab.style.boxShadow =
      "0 4px 12px rgba(87, 242, 169, 0.3)";

    endAmountTab.style.opacity = "0.5";
    endAmountTab.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    endAmountTab.style.transform = "scale(1)";
    endAmountTab.style.fontWeight = "400";
    endAmountTab.style.boxShadow = "none";

    // Show/hide content
    additionalContributionContent.classList.remove("hidden");
    endAmountContent.classList.add("hidden");

    // Update calculations
    updateContributionCalculations();
  }

  // --- Sub-tab functionality for End Amount ---
  function switchToResultsTab() {
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

    resultsContent.classList.remove("hidden");
    yearlyProjectionContent.classList.add("hidden");

    updateCalculations();
  }

  function switchToYearlyProjectionTab() {
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

    yearlyProjectionContent.classList.remove("hidden");
    resultsContent.classList.add("hidden");

    updateYearlyProjectionChart();
  }

  // --- Sub-tab functionality for Additional Contribution ---
  function switchToResultsTabContrib() {
    resultsTabContrib.classList.remove("text-gray-500");
    resultsTabContrib.classList.add(
      "text-green-700",
      "border-b-2",
      "border-green-700"
    );
    yearlyProjectionTabContrib.classList.remove(
      "text-green-700",
      "border-b-2",
      "border-green-700"
    );
    yearlyProjectionTabContrib.classList.add("text-gray-500");

    resultsContentContrib.classList.remove("hidden");
    yearlyProjectionContentContrib.classList.add("hidden");

    updateContributionCalculations();
  }

  function switchToYearlyProjectionTabContrib() {
    yearlyProjectionTabContrib.classList.remove("text-gray-500");
    yearlyProjectionTabContrib.classList.add(
      "text-green-700",
      "border-b-2",
      "border-green-700"
    );
    resultsTabContrib.classList.remove(
      "text-green-700",
      "border-b-2",
      "border-green-700"
    );
    resultsTabContrib.classList.add("text-gray-500");

    yearlyProjectionContentContrib.classList.remove("hidden");
    resultsContentContrib.classList.add("hidden");

    updateYearlyProjectionChartContrib();
  }

  // Add event listeners for main tabs
  if (endAmountTab) {
    endAmountTab.addEventListener("click", switchToEndAmountTab);
  }
  if (additionalContributionTab) {
    additionalContributionTab.addEventListener(
      "click",
      switchToAdditionalContributionTab
    );
  }

  // Add event listeners for sub-tabs
  if (resultsTab) {
    resultsTab.addEventListener("click", switchToResultsTab);
  }
  if (yearlyProjectionTab) {
    yearlyProjectionTab.addEventListener("click", switchToYearlyProjectionTab);
  }
  if (resultsTabContrib) {
    resultsTabContrib.addEventListener("click", switchToResultsTabContrib);
  }
  if (yearlyProjectionTabContrib) {
    yearlyProjectionTabContrib.addEventListener(
      "click",
      switchToYearlyProjectionTabContrib
    );
  }

  // --- Calculation Functions ---
  function calculateEndAmount(
    startingAmount,
    additionalContribution,
    returnRate,
    years,
    contributionTiming
  ) {
    return EndAmountCalculator.calculateEndAmount(
      startingAmount,
      additionalContribution,
      returnRate,
      years,
      contributionTiming
    );
  }

  function calculateRequiredContribution(
    targetAmount,
    startingAmount,
    returnRate,
    years,
    contributionTiming
  ) {
    return AdditionalContributionCalculator.calculateRequiredContribution(
      targetAmount,
      startingAmount,
      returnRate,
      years,
      contributionTiming
    );
  }

  // --- Update Functions ---
  function updateCalculations() {
    if (currentTab !== "end-amount") return;

    const startingAmount = startingAmountInput?.value || 0;
    const years = afterInput?.value || 0;
    const returnRate = returnRateInput?.value || 0;
    const additionalContribution = additionalContributionInput?.value || 0;

    let contributionTiming = "year-end";
    contributionTimingInputs.forEach((input) => {
      if (input.checked) {
        contributionTiming = input.value;
      }
    });

    const results = calculateEndAmount(
      startingAmount,
      additionalContribution,
      returnRate,
      years,
      contributionTiming
    );

    updateResultDescription(
      startingAmount,
      returnRate,
      years,
      additionalContribution,
      results.endBalance
    );

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

    updateChart(results, "end");

    if (
      yearlyProjectionContent &&
      !yearlyProjectionContent.classList.contains("hidden")
    ) {
      updateYearlyProjectionChart();
    }
  }

  function updateContributionCalculations() {
    if (currentTab !== "additional-contribution") return;

    const targetAmount = targetAmountInput?.value || 0;
    const startingAmount = startingAmountContribInput?.value || 0;
    const years = afterContribInput?.value || 0;
    const returnRate = returnRateContribInput?.value || 0;

    let contributionTiming = "year-end";
    contributionTimingContribInputs.forEach((input) => {
      if (input.checked) {
        contributionTiming = input.value;
      }
    });

    const results = calculateRequiredContribution(
      targetAmount,
      startingAmount,
      returnRate,
      years,
      contributionTiming
    );

    updateContributionResultDescription(
      targetAmount,
      startingAmount,
      returnRate,
      years,
      contributionTiming,
      results.requiredContribution
    );

    if (resultTargetContrib) {
      resultTargetContrib.textContent = `$${results.targetAmount.toLocaleString(
        "en-US",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}`;
    }
    if (resultStartContrib) {
      resultStartContrib.textContent = `$${results.startingAmount.toLocaleString(
        "en-US",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}`;
    }
    if (resultRequiredContrib) {
      resultRequiredContrib.textContent = `$${results.requiredContribution.toLocaleString(
        "en-US",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}`;
    }
    if (resultInterestContrib) {
      resultInterestContrib.textContent = `$${results.totalInterest.toLocaleString(
        "en-US",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}`;
    }

    updateChart(
      {
        startingAmount: results.startingAmount,
        totalContributions: results.totalContributions,
        totalInterest: results.totalInterest,
      },
      "contrib"
    );

    if (
      yearlyProjectionContentContrib &&
      !yearlyProjectionContentContrib.classList.contains("hidden")
    ) {
      updateYearlyProjectionChartContrib();
    }
  }

  // --- Chart Functions ---
  function updateChart(results, chartType) {
    const chartData = [
      results.startingAmount,
      results.totalContributions,
      results.totalInterest,
    ];
    const sanitizedData = chartData.map((val) => Math.max(0, val));
    const canvasId =
      chartType === "end"
        ? "investmentPieChart-end"
        : "investmentPieChart-contrib";

    createInvestmentChart(canvasId, chartType, sanitizedData);
  }

  function createInvestmentChart(canvasId, chartKey, data) {
    if (charts[chartKey]) {
      charts[chartKey].destroy();
    }

    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

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
            display: false,
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

  // --- Yearly Projection Functions ---
  function calculateYearlyProjection() {
    const startingAmount = parseFloat(startingAmountInput?.value) || 0;
    const inputYears = parseFloat(afterInput?.value) || 1;
    const returnRate = parseFloat(returnRateInput?.value) || 0;
    const additionalContribution =
      parseFloat(additionalContributionInput?.value) || 0;

    let contributionTiming = "year-end";
    contributionTimingInputs.forEach((input) => {
      if (input.checked) {
        contributionTiming = input.value;
      }
    });

    // Use the external calculator
    return EndAmountCalculator.calculateYearlyProjection(
      startingAmount,
      additionalContribution,
      returnRate,
      inputYears,
      contributionTiming
    );
  }

  function updateResultDescription(
    startingAmount,
    returnRate,
    years,
    additionalContribution,
    endBalance
  ) {
    const resultDescriptionElement =
      document.getElementById("result-description");
    if (resultDescriptionElement) {
      const description = EndAmountCalculator.generateResultDescription(
        startingAmount,
        returnRate,
        years,
        additionalContribution,
        endBalance
      );
      resultDescriptionElement.textContent = description;
    }
  }

  function createYearlyProjectionChart(yearlyData, chartId) {
    const chartKey =
      chartId === "yearlyProjectionChart" ? "yearly" : "yearly-contrib";

    if (charts[chartKey]) {
      charts[chartKey].destroy();
    }

    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const labels = yearlyData.map((data) => `Year ${data.year}`);
    const startingAmounts = yearlyData.map((data) => data.startingAmount);
    const contributions = yearlyData.map((data) => data.totalContributions);
    const interests = yearlyData.map((data) => data.totalInterest);

    charts[chartKey] = new Chart(ctx, {
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
            display: false,
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
                const total =
                  data.endBalance ||
                  data.startingAmount +
                    data.totalContributions +
                    data.totalInterest;
                return (
                  "Total: $" +
                  total.toLocaleString("en-US", {
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
    createYearlyProjectionChart(yearlyData, "yearlyProjectionChart");
  }

  function updateYearlyProjectionChartContrib() {
    const yearlyData = calculateYearlyProjectionContrib();
    createYearlyProjectionChart(yearlyData, "yearlyProjectionChart-contrib");
  }

  // --- Description Functions ---
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
      description =
        "Enter your investment details to see your projected results";
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

  function updateContributionResultDescription(
    targetAmount,
    startingAmount,
    returnRate,
    years,
    contributionTiming,
    requiredContribution
  ) {
    const descriptionElement = document.getElementById(
      "dynamic-result-description-contrib"
    );
    if (!descriptionElement) return;

    const target = parseFloat(targetAmount) || 0;
    const startAmount = parseFloat(startingAmount) || 0;
    const rate = parseFloat(returnRate) || 0;
    const timeYears = parseFloat(years) || 0;
    const contribution = parseFloat(requiredContribution) || 0;

    let description = "";

    if (target === 0) {
      description = "Enter your target amount to see required contributions";
    } else if (timeYears === 0) {
      description =
        "Please enter the number of years for your investment timeline";
    } else {
      const formattedTarget = target.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      const formattedContribution = contribution.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      let timingText = "";
      switch (contributionTiming) {
        case "beginning":
          timingText = "at the beginning of each month";
          break;
        case "end":
          timingText = "at the end of each month";
          break;
        case "year-beginning":
          timingText = "at the beginning of each year";
          break;
        case "year-end":
          timingText = "at the end of each year";
          break;
        default:
          timingText = "at the end of each year";
      }

      if (startAmount > 0) {
        description = `Starting with <strong>$${startAmount.toLocaleString(
          "en-US"
        )}</strong>, you will need to contribute <strong>${formattedContribution}</strong> ${timingText} to reach your target of <strong>${formattedTarget}</strong> in <strong>${timeYears} year${
          timeYears !== 1 ? "s" : ""
        }</strong> with a <strong>${rate}%</strong> return rate.`;
      } else {
        description = `You will need to contribute <strong>${formattedContribution}</strong> ${timingText} to reach your target of <strong>${formattedTarget}</strong> in <strong>${timeYears} year${
          timeYears !== 1 ? "s" : ""
        }</strong> with a <strong>${rate}%</strong> return rate.`;
      }
    }

    descriptionElement.innerHTML = description;
  }

  // --- Event Listeners ---
  function initializeEventListeners() {
    // End Amount tab inputs
    const endAmountInputs = [
      startingAmountInput,
      afterInput,
      returnRateInput,
      additionalContributionInput,
    ];

    endAmountInputs.forEach((input) => {
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

    // Additional Contribution tab inputs
    const contribInputs = [
      targetAmountInput,
      startingAmountContribInput,
      afterContribInput,
      returnRateContribInput,
    ];

    contribInputs.forEach((input) => {
      if (input) {
        input.addEventListener("input", updateContributionCalculations);
      }
    });

    if (compoundContribSelect) {
      compoundContribSelect.addEventListener(
        "change",
        updateContributionCalculations
      );
    }

    contributionTimingContribInputs.forEach((input) => {
      input.addEventListener("change", updateContributionCalculations);
    });
  }

  // --- Initialization ---
  function initialize() {
    initializeEventListeners();

    // Set default active tab
    switchToEndAmountTab();

    // Default to 'End of Each Month' for both tabs
    if (contributionTimingInputs.length > 1) {
      contributionTimingInputs[1].checked = true;
    }
    if (contributionTimingContribInputs.length > 1) {
      contributionTimingContribInputs[1].checked = true;
    }

    // Auto-populate Additional Contribution from budget calculator if available
    const storedAnnualInvestment = localStorage.getItem(
      "budgetAnnualInvestment"
    );
    if (storedAnnualInvestment && additionalContributionInput) {
      const annualAmount = parseFloat(storedAnnualInvestment);
      if (annualAmount > 0) {
        additionalContributionInput.value = Math.round(annualAmount).toString();

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
