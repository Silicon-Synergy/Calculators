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
    compoundFrequency,
    contributionTiming
  ) {
    const PV = parseFloat(startingAmount) || 0;
    const PMT = parseFloat(additionalContribution) || 0;
    const annualRate = parseFloat(returnRate) / 100;
    const n = parseFloat(years) || 0;

    if (PV === 0 && PMT === 0)
      return { endBalance: 0, totalContributions: 0, totalInterest: 0 };

    let FV = 0;
    let totalContributions = 0;

    if (compoundFrequency === "continuous") {
      // Continuous compounding
      FV = PV * Math.exp(annualRate * n);
      if (PMT > 0) {
        FV += (PMT * (Math.exp(annualRate * n) - 1)) / annualRate;
      }
      totalContributions = PMT * n;
    } else {
      // Discrete compounding
      let r, periods, periodicPMT;

      if (
        contributionTiming === "year-beginning" ||
        contributionTiming === "year-end"
      ) {
        // Annual contributions
        r = annualRate;
        periods = n;
        periodicPMT = PMT;
        totalContributions = PMT * n;
      } else {
        // Monthly contributions
        r = annualRate / compoundFrequency;
        periods = n * compoundFrequency;
        periodicPMT = PMT;
        totalContributions = PMT * periods;
      }

      // Future value of present value
      FV = PV * Math.pow(1 + r, periods);

      // Future value of annuity
      if (periodicPMT > 0 && r > 0) {
        const annuityFV = periodicPMT * ((Math.pow(1 + r, periods) - 1) / r);

        if (
          contributionTiming === "beginning" ||
          contributionTiming === "year-beginning"
        ) {
          // Annuity due (beginning of period)
          FV += annuityFV * (1 + r);
        } else {
          // Ordinary annuity (end of period)
          FV += annuityFV;
        }
      } else if (periodicPMT > 0 && r === 0) {
        // No interest case
        FV += periodicPMT * periods;
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
  function updateResults(results, section = 'end') {
    const resultBalance = document.querySelector(`#result-balance-${section}`);
    const resultStart = document.querySelector(`#result-start-${section}`);
    const resultContrib = document.querySelector(`#result-contrib-${section}`);
    const resultInterest = document.querySelector(`#result-interest-${section}`);
  
    // Ensure all elements exist before updating
    if (!resultBalance || !resultStart || !resultContrib || !resultInterest) {
      console.error(`Result elements not found for section: ${section}`);
      return;
    }
  
    // Create safe results object with fallbacks
    const safeResults = {
      endBalance: Number(results?.endBalance) || 0,
      startingAmount: Number(results?.startingAmount) || 0,
      totalContributions: Number(results?.totalContributions) || 0,
      totalInterest: Number(results?.totalInterest) || 0
    };
  
    // Update the display based on section type
    switch(section) {
      case 'end':
        resultBalance.textContent = `$${safeResults.endBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultStart.textContent = `$${safeResults.startingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultContrib.textContent = `$${safeResults.totalContributions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultInterest.textContent = `$${safeResults.totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        break;
      case 'contribution':
        resultBalance.textContent = `$${safeResults.endBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultStart.textContent = `$${safeResults.startingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultContrib.textContent = `$${safeResults.totalContributions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultInterest.textContent = `$${safeResults.totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        break;
      case 'return':
        resultBalance.textContent = `$${safeResults.endBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultStart.textContent = `$${safeResults.startingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultContrib.textContent = `$${safeResults.totalContributions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultInterest.textContent = `${safeResults.totalInterest.toFixed(2)}%`;
        break;
      case 'start':
        resultBalance.textContent = `$${safeResults.endBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultStart.textContent = `$${safeResults.startingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultContrib.textContent = `$${safeResults.totalContributions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultInterest.textContent = `$${safeResults.totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        break;
      case 'investment':
        resultBalance.textContent = `$${safeResults.endBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultStart.textContent = `$${safeResults.startingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultContrib.textContent = `$${safeResults.totalContributions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        resultInterest.textContent = `${safeResults.totalInterest} years`;
        break;
    }
  
    // Update chart for the specific section
    // updateChart(safeResults, section);
  }
  
  // Update the calculateAndUpdateEndAmount function to specify section
  function calculateAndUpdateEndAmount() {
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

    const compoundFrequency = getCompoundFrequency(compoundValue);
    const results = calculateEndAmount(
      startingAmount,
      additionalContribution,
      returnRate,
      years,
      compoundFrequency,
      contributionTiming
    );

    // Ensure results object has all required properties
    const safeResults = {
      endBalance: Number(results.endBalance) || 0,
      startingAmount: Number(results.startingAmount) || 0,
      totalContributions: Number(results.totalContributions) || 0,
      totalInterest: Number(results.totalInterest) || 0,
    };

    updateResults(safeResults, "end");
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

    // defaultSection.classList.remove("hidden");
    // defaultSection.classList.add("block");

    // contributionSection.classList.add("hidden");
    // contributionSection.classList.remove("block");

    // returnRateSection.classList.add("hidden");
    // returnRateSection.classList.remove("block");

    // startingAmountSection.classList.remove("block");
    // startingAmountSection.classList.add("hidden");

    // investmentSection.classList.add("hidden");
    // investmentSection.classList.remove("block");

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

  // Initialize with End Amount tab active and add listeners
  setTimeout(() => {
    endAmountTab.click();
    addCalculationListeners();
  }, 100);
});
