document.addEventListener("DOMContentLoaded", function () {
  const charts = {};
  const defaultSection = document.getElementById("default-input-section");
  const contributionSection = document.getElementById(
    "contribution-input-section"
  );
  const returnRateSection = document.getElementById("return-rate-section");
  const endAmountTab = document.getElementById("end-amount");
  const contributionTab = document.getElementById(
    "additional-contribution-tab"
  );
  const returnRateTab = document.getElementById("return-rate-tab");
  const startingAmountTab = document.getElementById("starting-amount-tab");
  const endAmountSection = document.getElementById("default-input-section");
  const startingAmountSection = document.getElementById(
    "starting-amount-section"
  );
  const investmentLengthTab = document.getElementById("investment-length-tab");
  const investmentSection = document.getElementById(
    "investment-length-section"
  );

  const body = document.body;

  // Calculation Functions
  function getCompoundFrequency(compoundValue) {
    const frequencies = {
      annually: 1,
      semiannually: 2,
      quarterly: 4,
      monthly: 12,
      semimonthly: 24,
      biweekly: 26,
      weekly: 52,
      daily: 365,
      continuously: "continuous",
    };
    return frequencies[compoundValue] || 12;
  }

  function calculateEndAmount(
    startingAmount,
    additionalContribution,
    returnRate,
    years,
    contributionTiming
  ) {
    console.log('=== calculateEndAmount called ===');
    console.log('Parameters:', {
      startingAmount,
      additionalContribution,
      returnRate,
      years,
      contributionTiming
    });
    const PV = parseFloat(startingAmount) || 0;
    const PMT = parseFloat(additionalContribution) || 0;
    const r = parseFloat(returnRate) / 100; // Annual interest rate
    const n = parseFloat(years) || 0;

    if (PV === 0 && PMT === 0)
      return { endBalance: 0, totalContributions: 0, totalInterest: 0 };

    let FV = 0;
    let totalContributions = 0;

    // Future value of present value (starting amount)
    const futureValueOfPV = PV * Math.pow(1 + r, n);

    // Calculate based on contribution timing
    if (contributionTiming === "end" || contributionTiming === "year-end") {
      // End of Each Month (Ordinary Annuity) or End of Each Year
      if (contributionTiming === "end") {
        // Monthly contributions, annual compounding
        const monthlyRate = r / 12;
        const monthlyPeriods = n * 12;
        totalContributions = PMT * monthlyPeriods;

        if (r > 0) {
          // Convert to effective annual rate for monthly contributions
          const effectiveRate = Math.pow(1 + monthlyRate, 12) - 1;
          FV =
            futureValueOfPV +
            PMT * 12 * ((Math.pow(1 + effectiveRate, n) - 1) / effectiveRate);
        } else {
          FV = futureValueOfPV + totalContributions;
        }
      } else {
        // Annual contributions at year end
        totalContributions = PMT * n;
        if (r > 0) {
          FV = futureValueOfPV + PMT * ((Math.pow(1 + r, n) - 1) / r);
        } else {
          FV = futureValueOfPV + totalContributions;
        }
      }
    } else if (
      contributionTiming === "beginning" ||
      contributionTiming === "year-beginning"
    ) {
      // Beginning of Each Month (Annuity Due) or Beginning of Each Year
      if (contributionTiming === "beginning") {
        // Monthly contributions, annual compounding
        const monthlyRate = r / 12;
        const monthlyPeriods = n * 12;
        totalContributions = PMT * monthlyPeriods;

        if (r > 0) {
          // Convert to effective annual rate for monthly contributions
          const effectiveRate = Math.pow(1 + monthlyRate, 12) - 1;
          FV =
            futureValueOfPV +
            PMT *
              12 *
              ((Math.pow(1 + effectiveRate, n) - 1) / effectiveRate) *
              (1 + effectiveRate);
        } else {
          FV = futureValueOfPV + totalContributions;
        }
      } else {
        // Annual contributions at year beginning
        totalContributions = PMT * n;
        if (r > 0) {
          FV = futureValueOfPV + PMT * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        } else {
          FV = futureValueOfPV + totalContributions;
        }
      }
    }

    const totalInterest = FV - PV - totalContributions;

    return {
      endBalance: FV,
      startingAmount: PV,
      totalContributions: totalContributions,
      totalInterest: Math.max(0, totalInterest),
    };
  }

  // Update the result element references to be section-specific
  function updateResults(results, section = "end") {
    console.log('=== updateResults called ===');
    console.log('Section:', section);
    console.log('Results received:', results);
    
    const resultBalance = document.querySelector(`#result-balance-${section}`);
    const resultStart = document.querySelector(`#result-start-${section}`);
    const resultContrib = document.querySelector(`#result-contrib-${section}`);
    const resultInterest = document.querySelector(
      `#result-interest-${section}`
    );

    console.log('Result elements found:', {
      resultBalance: !!resultBalance,
      resultStart: !!resultStart,
      resultContrib: !!resultContrib,
      resultInterest: !!resultInterest
    });

    // Ensure all elements exist before updating
    if (!resultBalance || !resultStart || !resultContrib || !resultInterest) {
      console.error(`Result elements not found for section: ${section}`);
      console.error('Missing elements:', {
        resultBalance: !resultBalance,
        resultStart: !resultStart,
        resultContrib: !resultContrib,
        resultInterest: !resultInterest
      });
      return;
    }

    // Create safe results object with fallbacks
    const safeResults = {
      endBalance: Number(results?.endBalance) || 0,
      startingAmount: Number(results?.startingAmount) || 0,
      totalContributions: Number(results?.totalContributions) || 0,
      totalInterest: Number(results?.totalInterest) || 0,
    };

    // Update the display based on section type
    switch (section) {
      case "end":
        resultBalance.textContent = `$${safeResults.endBalance.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        resultStart.textContent = `$${safeResults.startingAmount.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        resultContrib.textContent = `$${safeResults.totalContributions.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        resultInterest.textContent = `$${safeResults.totalInterest.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        break;
      case "contribution":
        resultBalance.textContent = `$${safeResults.endBalance.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        resultStart.textContent = `$${safeResults.startingAmount.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        resultContrib.textContent = `$${safeResults.totalContributions.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        resultInterest.textContent = `$${safeResults.totalInterest.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        break;
      case "return":
        resultBalance.textContent = `$${safeResults.endBalance.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        resultStart.textContent = `$${safeResults.startingAmount.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        resultContrib.textContent = `$${safeResults.totalContributions.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        resultInterest.textContent = `${safeResults.totalInterest.toFixed(2)}%`;
        break;
      case "start":
        resultBalance.textContent = `$${safeResults.endBalance.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        resultStart.textContent = `$${safeResults.startingAmount.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        resultContrib.textContent = `$${safeResults.totalContributions.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        resultInterest.textContent = `$${safeResults.totalInterest.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        break;
      case "investment":
        resultBalance.textContent = `$${safeResults.endBalance.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        resultStart.textContent = `$${safeResults.startingAmount.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        resultContrib.textContent = `$${safeResults.totalContributions.toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}`;
        resultInterest.textContent = `${safeResults.totalInterest} years`;
        break;
    }

    // Update chart for the specific section
    updateChart(safeResults, section);
  }

  // Update the calculateAndUpdateEndAmount function to specify section
  function calculateAndUpdateEndAmount() {
    console.log('=== calculateAndUpdateEndAmount called ===');
    
    // Get form values from End Amount section with better error handling
    const startingAmountInput = document.querySelector(
      '#default-input-section input[placeholder="$20,000"]'
    );
    const yearsInput = document.querySelector(
      '#default-input-section input[placeholder="10"]'
    );
    const returnRateInput = document.querySelector(
      '#default-input-section input[placeholder="6"]'
    );
    const additionalContributionInput = document.querySelector(
      '#default-input-section input[placeholder="Enter amount"]'
    );
    const compoundSelect = document.querySelector(
      "#default-input-section select"
    );
    const contributionTimingInput = document.querySelector(
      '#default-input-section input[name="return-timing"]:checked'
    );

    console.log('Input elements found:', {
      startingAmountInput: !!startingAmountInput,
      yearsInput: !!yearsInput,
      returnRateInput: !!returnRateInput,
      additionalContributionInput: !!additionalContributionInput,
      compoundSelect: !!compoundSelect,
      contributionTimingInput: !!contributionTimingInput
    });

    const startingAmount = startingAmountInput
      ? parseFloat(startingAmountInput.value) || 0
      : 0;
    const years = yearsInput ? parseFloat(yearsInput.value) || 0 : 0;
    const returnRate = returnRateInput
      ? parseFloat(returnRateInput.value) || 0
      : 0;
    const additionalContribution = additionalContributionInput
      ? parseFloat(additionalContributionInput.value) || 0
      : 0;
    const compoundValue = compoundSelect
      ? compoundSelect.value || "monthly"
      : "monthly";
    const contributionTiming = contributionTimingInput
      ? contributionTimingInput.value || "end"
      : "end";

    console.log('Parsed input values:', {
      startingAmount,
      years,
      returnRate,
      additionalContribution,
      compoundValue,
      contributionTiming
    });

    const compoundFrequency = getCompoundFrequency(compoundValue);
    console.log('Compound frequency:', compoundFrequency);
    
    const results = calculateEndAmount(
      startingAmount,
      additionalContribution,
      returnRate,
      years,
      contributionTiming
    );

    console.log('Raw calculation results:', results);

    // Ensure results object has all required properties
    const safeResults = {
      endBalance: Number(results.endBalance) || 0,
      startingAmount: Number(results.startingAmount) || 0,
      totalContributions: Number(results.totalContributions) || 0,
      totalInterest: Number(results.totalInterest) || 0,
    };

    console.log('Safe results object:', safeResults);
    console.log('Calling updateResults with section: "end"');
    
    updateResults(safeResults, "end");
    
    console.log('=== calculateAndUpdateEndAmount completed ===');
  }

  // Array of all tabs for easy management
  const allTabs = [
    endAmountTab,
    contributionTab,
    returnRateTab,
    startingAmountTab,
    investmentLengthTab,
  ];

  // Function to set active tab styling
  function setActiveTab(activeTab) {
    allTabs.forEach((tab) => {
      if (tab === activeTab) {
        // Active tab styling
        tab.style.opacity = "1";
        tab.style.backgroundColor = "#57f2a9";
        tab.style.color = "#fff";
        tab.style.borderColor = "#57f2a9";
        tab.style.transform = "scale(1.05)";
        tab.style.fontWeight = "600";
        tab.style.boxShadow = "0 4px 12px rgba(87, 242, 169, 0.3)";
      } else {
        // Inactive tab styling - faded colors
        tab.style.opacity = "0.5";
        tab.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
        tab.style.color = "#fff";
        tab.style.borderColor = "rgba(255, 255, 255, 0.3)";
        tab.style.transform = "scale(1)";
        tab.style.fontWeight = "400";
        tab.style.boxShadow = "none";
      }
      // Add transition for smooth effect
      tab.style.transition = "all 0.3s ease";
    });
  }

  // Set End Amount as active by default
  setActiveTab(endAmountTab);

  endAmountTab.addEventListener("click", function () {
    setActiveTab(endAmountTab);

    defaultSection.classList.remove("hidden");
    defaultSection.classList.add("block");

    contributionSection.classList.add("hidden");
    contributionSection.classList.remove("block");

    returnRateSection.classList.add("hidden");
    returnRateSection.classList.remove("block");

    startingAmountSection.classList.remove("block");
    startingAmountSection.classList.add("hidden");

    investmentSection.classList.add("hidden");
    investmentSection.classList.remove("block");

    setTimeout(() => {
      if (charts["end"]) {
        charts["end"].destroy();
      }

      const canvas = document.getElementById("investmentPieChart-end");
      if (!canvas) return;

      const ctx = canvas.getContext("2d");

      charts["end"] = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Starting Amount", "Total Contributions", "Interest"],
          datasets: [
            {
              label: "Investment Breakdown",
              data: [20000, 120000, 58290.4],
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
              position: "bottom",
              labels: {
                color: "#0f172a",
                font: {
                  weight: "500",
                },
              },
            },
          },
        },
      });

      // Calculate initial values
      calculateAndUpdateEndAmount();
    }, 50);
  });

  // Add event listeners for real-time calculation
  function addCalculationListeners() {
    const endAmountInputs = defaultSection.querySelectorAll("input, select");
    endAmountInputs.forEach((input) => {
      input.addEventListener("input", calculateAndUpdateEndAmount);
      input.addEventListener("change", calculateAndUpdateEndAmount);
    });
  }

  contributionTab.addEventListener("click", function () {
    setActiveTab(contributionTab);

    const ctx = document
      .getElementById("investmentPieChart-contribution")
      .getContext("2d");

    if (charts["contribution"]) {
      charts["contribution"].destroy();
    }

    defaultSection.classList.add("hidden");
    defaultSection.classList.remove("block");

    // Show contribution section
    contributionSection.classList.remove("hidden");
    contributionSection.classList.add("block");

    charts["contribution"] = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Starting Amount", "Total Contributions", "Interest"],
        datasets: [
          {
            label: "Investment Breakdown",
            data: [20000, 120000, 58290.4],
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
            position: "bottom",
            labels: {
              color: "#0f172a",
              font: {
                weight: "500",
              },
            },
          },
        },
      },
    });
  });

  returnRateTab.addEventListener("click", function () {
    setActiveTab(returnRateTab);

    const ctx = document
      .getElementById("investmentPieChart-return")
      .getContext("2d");

    if (charts["return"]) {
      charts["return"].destroy();
    }

    defaultSection.classList.add("hidden");
    defaultSection.classList.remove("block");

    contributionSection.classList.add("hidden");
    contributionSection.classList.remove("block");

    returnRateSection.classList.remove("hidden");
    returnRateSection.classList.add("block");

    charts["return"] = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Starting Amount", "Total Contributions", "Interest"],
        datasets: [
          {
            label: "Investment Breakdown",
            data: [20000, 120000, 58290.4],
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
            position: "bottom",
            labels: {
              color: "#0f172a",
              font: {
                weight: "500",
              },
            },
          },
        },
      },
    });
  });

  investmentLengthTab.addEventListener("click", function () {
    setActiveTab(investmentLengthTab);

    // Step 1: Show the section
    investmentSection.classList.add("block");
    investmentSection.classList.remove("hidden");

    // Hide all other sections
    defaultSection.classList.add("hidden");
    contributionSection.classList.add("hidden");
    returnRateSection.classList.add("hidden");
    startingAmountSection.classList.add("hidden");
    endAmountSection.classList.add("hidden");

    // Step 2: Delay the chart creation to allow the DOM to update

    const canvas = document.getElementById("investmentPieChart-investment");

    const ctx = canvas.getContext("2d");

    if (charts["investment"]) {
      charts["investment"].destroy();
    }

    charts["investment"] = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Starting Amount", "Total Contributions", "Interest"],
        datasets: [
          {
            label: "Investment Breakdown",
            data: [20000, 120000, 58290.4],
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
            position: "bottom",
            labels: {
              color: "#0f172a",
              font: {
                weight: "500",
              },
            },
          },
        },
      },
    });
  });

  startingAmountTab.addEventListener("click", function () {
    setActiveTab(startingAmountTab);

    startingAmountSection.classList.add("block");
    startingAmountSection.classList.remove("hidden");

    defaultSection.classList.add("hidden");
    contributionSection.classList.add("hidden");
    returnRateSection.classList.add("hidden");
    investmentSection.classList.add("hidden");
    endAmountSection.classList.add("hidden");

    setTimeout(() => {
      const canvas = document.getElementById("investmentPieChart-start");
      if (!canvas) {
        console.error("Canvas not found: #investmentPieChart-start");
        return;
      }

      const ctx = canvas.getContext("2d");

      if (charts["start"]) {
        charts["start"].destroy();
      }

      charts["start"] = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Starting Amount", "Total Contributions", "Interest"],
          datasets: [
            {
              label: "Investment Breakdown",
              data: [20000, 120000, 58290.4],
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
              position: "bottom",
              labels: {
                color: "#0f172a",
                font: {
                  weight: "500",
                },
              },
            },
          },
        },
      });
    }, 50);
  });

  // Move this function inside the DOMContentLoaded event listener
  function updateChart(results, section) {
    const chartId = `investmentPieChart-${section}`;
    const canvas = document.getElementById(chartId);

    if (!canvas || !charts[section]) {
      return; // Chart doesn't exist for this section
    }

    // Update chart data
    const chartData = [
      results.startingAmount || 0,
      results.totalContributions || 0,
      results.totalInterest || 0,
    ];

    charts[section].data.datasets[0].data = chartData;
    charts[section].update();
  }

  // Initialize with End Amount tab active and add listeners
  setTimeout(() => {
    endAmountTab.click();
    addCalculationListeners();
  }, 100);
});
