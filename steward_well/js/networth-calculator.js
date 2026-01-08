window.addEventListener("resize", () => {
  document.querySelectorAll(".category-content").forEach(content => {
    if (content.style.maxHeight && content.style.maxHeight !== "0px") {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});

// The toggle function
function toggleCategory(categoryName) {
  const allCategories = document.querySelectorAll(".expense-category");
  let currentCategory = null;

  allCategories.forEach(category => {
    const button = category.querySelector(".category-toggle");
    if (button && button.getAttribute("onclick") && button.getAttribute("onclick").includes(categoryName)) {
      currentCategory = category;
    }
  });

  if (!currentCategory) return;

  const currentContent = currentCategory.querySelector(".category-content");
  const currentArrow = currentCategory.querySelector(".category-arrow");

  // Check if it is currently open
  const wasOpen = currentContent.style.maxHeight && currentContent.style.maxHeight !== "0px";

  // Close all first (Accordion style)
  allCategories.forEach(category => {
    const content = category.querySelector(".category-content");
    const arrow = category.querySelector(".category-arrow");

    if (content) content.style.maxHeight = "0px";
    if (arrow) arrow.style.transform = "rotate(0deg)";
  });

  // Open ONLY if it was previously closed
  if (!wasOpen) {
    currentContent.style.maxHeight = currentContent.scrollHeight + "px";
    if (currentArrow) currentArrow.style.transform = "rotate(180deg)";
  }
}

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // PART 1: NETWORTH CALCULATOR (Accordion)
    // ==========================================

    const expandAllBtn = document.getElementById('toggle-all-expenses');
    const expandAllText = document.getElementById('toggle-all-expenses-text');
    const categoryToggles = document.querySelectorAll('.category-toggle');

    // Track state of "Expand All"
    let isAllExpanded = false;

    // 1. Handle Individual Category Toggles (Exclusive Mode)
    categoryToggles.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop bubbling

            const currentContent = btn.nextElementSibling;
            const currentArrow = btn.querySelector('.category-arrow');

            // Check if the clicked section is currently open
            const isCurrentlyOpen = currentContent.style.maxHeight && currentContent.style.maxHeight !== '0px';

            // -- STEP A: Close ALL sections first (Mutually Exclusive) --
            // This ensures only one stays open at a time
            document.querySelectorAll('.category-content').forEach(c => {
                c.style.maxHeight = '0';
                c.style.opacity = '0';
            });
            document.querySelectorAll('.category-arrow').forEach(a => {
                a.style.transform = 'rotate(0deg)';
            });

            // -- STEP B: If it wasn't open before, open it now --
            if (!isCurrentlyOpen) {
                currentContent.style.maxHeight = currentContent.scrollHeight + "px";
                currentContent.style.opacity = '1';
                if(currentArrow) currentArrow.style.transform = 'rotate(180deg)';
            }

            // Reset "Expand All" state because user manually interacted
            isAllExpanded = false;
            updateExpandButtonUI(false);
        });
    });

    // 2. Handle "Expand/Collapse All" Button
    if (expandAllBtn) {
        expandAllBtn.addEventListener('click', () => {
            isAllExpanded = !isAllExpanded;
            updateExpandButtonUI(isAllExpanded);

            // Loop through all categories and force them to match the state
            categoryToggles.forEach(btn => {
                const content = btn.nextElementSibling;
                const arrow = btn.querySelector('.category-arrow');

                if (isAllExpanded) {
                    // Open everything
                    content.style.maxHeight = content.scrollHeight + "px";
                    content.style.opacity = '1';
                    if(arrow) arrow.style.transform = 'rotate(180deg)';
                } else {
                    // Close everything
                    content.style.maxHeight = '0';
                    content.style.opacity = '0';
                    if(arrow) arrow.style.transform = 'rotate(0deg)';
                }
            });
        });
    }

    function updateExpandButtonUI(expanded) {
        if (!expandAllText) return;

        expandAllText.textContent = expanded ? "Collapse all" : "Expand all";

        // Update the double chevron icon rotation
        const chevronContainer = expandAllBtn.querySelector('span:last-child');
        if(chevronContainer) {
            chevronContainer.style.transform = expanded ? 'rotate(180deg)' : 'rotate(0deg)';
            chevronContainer.style.transition = 'transform 0.3s ease';
        }
    }

// ==========================================
    // PART 2: INVESTMENT CALCULATOR (UI Logic)
    // ==========================================

    const dropdownData = {
        type: ['End amount', 'Additional contribution', 'Return rate', 'Starting amount', 'Investment length'],
        years: ['1 Year', '3 Years', '5 Years', '10 Years', '15 Years', '20 Years', '30 Years'],
        compound: ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually'],
        calcTime: ['Beginning of each month', 'End of each month', 'Beginning of each year', 'End of each year'],
        frequency: ['Month', 'Year']
    };

    const dropdownConfigs = [
        { btnId: 'typeDropdownBtn', listId: 'customTypeOptions', displayId: 'typeDropdownSelected', data: dropdownData.type, onChange: updateCalculatorUI },
        { btnId: 'yearsDropdownBtn', listId: 'customYearsOptions', displayId: 'yearsDropdownSelected', data: dropdownData.years },
        { btnId: 'compoundDropdownBtn', listId: 'customCompoundOptions', displayId: 'compoundDropdownSelected', data: dropdownData.compound },
        { btnId: 'calculateDropdownBtn', listId: 'customCalculationTimeOptions', displayId: 'calculateDropdownSelected', data: dropdownData.calcTime },
        { btnId: 'frequencyDropdownBtn', listId: 'customFrequencyOptions', displayId: 'frequencyDropdownSelected', data: dropdownData.frequency } // New config
    ];

    // Initialize Dropdowns
    dropdownConfigs.forEach(config => {
        const btn = document.getElementById(config.btnId);
        const list = document.getElementById(config.listId);
        const display = document.getElementById(config.displayId);

        if (!btn || !list) return;

        config.data.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            li.className = "px-4 py-2 hover:bg-white/20 cursor-pointer rounded-lg transition-colors text-slate-800 font-medium text-sm";
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                display.textContent = item;
                display.style.color = "#111827";
                closeList(list);
                if (config.onChange) config.onChange(item);
            });
            list.appendChild(li);
        });

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownConfigs.forEach(other => {
                if (other.listId !== config.listId) closeList(document.getElementById(other.listId));
            });
            toggleList(list);
        });
    });

    // Dropdown Helpers
    function toggleList(list) {
        if (!list) return;
        if (list.style.maxHeight && list.style.maxHeight !== "0px") closeList(list);
        else {
            list.style.maxHeight = "300px";
            list.style.opacity = "1";
        }
    }
    function closeList(list) {
        if (!list) return;
        list.style.maxHeight = "0";
        list.style.opacity = "0";
    }
    document.addEventListener('click', () => {
        dropdownConfigs.forEach(c => closeList(document.getElementById(c.listId)));
    });

    // --- LOGIC TO SHOW/HIDE FIELDS ---

    const fields = {
        target: document.getElementById('field-target'),
        starting: document.getElementById('field-starting'),
        years: document.getElementById('field-years'),
        returnRate: document.getElementById('field-return-rate'),
        compound: document.getElementById('field-compound'),
        contribution: document.getElementById('field-contribution'),
        contributeAt: document.getElementById('field-contribute-at'),
        frequency: document.getElementById('field-frequency') // "of each (month, year)"
    };

    function updateCalculatorUI(selectedType) {
        // Helper to show a list of specific fields and hide others
        const showFields = (fieldKeys) => {
            Object.keys(fields).forEach(key => {
                if (fields[key]) {
                    if (fieldKeys.includes(key)) {
                        fields[key].classList.remove('hidden');
                    } else {
                        fields[key].classList.add('hidden');
                    }
                }
            });
        };

        switch (selectedType) {
            case 'End amount':
                // starting amount, after, return rate, compound, additional contribution, contribute at, frequency
                showFields(['starting', 'years', 'returnRate', 'compound', 'contribution', 'contributeAt', 'frequency']);
                break;

            case 'Additional contribution':
                // Your target, starting amount, after, return rate, compound, contribute at, frequency
                showFields(['target', 'starting', 'years', 'returnRate', 'compound', 'contributeAt', 'frequency']);
                break;

            case 'Return rate':
                // Your target, starting amount, after, additional contribution, contribute at, frequency
                // Note: "compound" is hidden here based on your description
                showFields(['target', 'starting', 'years', 'contribution', 'contributeAt', 'frequency']);
                break;

            case 'Starting amount':
                // Your target, after, return rate, compound, additional contribution, contribute at, frequency
                showFields(['target', 'years', 'returnRate', 'compound', 'contribution', 'contributeAt', 'frequency']);
                break;

            case 'Investment length':
                // Your target, starting amount, return rate, compound, additional contribution, contribute at, frequency
                showFields(['target', 'starting', 'returnRate', 'compound', 'contribution', 'contributeAt', 'frequency']);
                break;
        }
    }

    // Initialize Default View
    updateCalculatorUI('End amount');

    // ==========================================
    // PART 3: NETWORTH GROWTH TOGGLE (Checkbox)
    // ==========================================
    const growthToggleInput = document.getElementById('view-projections-toggle');
    const growthLabels = document.querySelectorAll('.yearly-growth-label');

    function applyGrowthVisibility(isEnabled) {
        growthLabels.forEach(label => {
            isEnabled ? label.classList.remove('hidden') : label.classList.add('hidden');
        });
    }

    if (growthToggleInput) {
        applyGrowthVisibility(growthToggleInput.checked);
        growthToggleInput.addEventListener('change', (e) => applyGrowthVisibility(e.target.checked));
    }
});

// Global Chart Instance
let investmentChartInstance = null;

// Configuration Data (Colors match your screenshots)
const CHART_COLORS = {
  starting: '#2563EB',   // Dark Blue
  interest: '#60A5FA',   // Light Blue
  contrib: '#86EFAC'     // Green
};

// Mock Data (Replace this with your actual calculator variables)
const chartData = {
  startAmount: 127633.63,
  totalContrib: 9884.61,
  totalInterest: 9884.61,
  // For the Bar Chart (Yearly projection)
  yearlyData: {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], // Years
    starting: Array(10).fill(127633.63), // Starting amount stays constant usually
    interest: [1000, 2500, 4500, 7000, 9884, 12000, 15000, 19000, 24000, 30000], // Cumulative Interest
    contrib: [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000] // Cumulative Contributions
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Initialize with Pie Chart (Investment Tab Default)
  renderPieChart();
});

// 1. Tab Switching Logic (Networth vs Investment)
function switchResultTab(tabName) {
  const btnNetworth = document.getElementById('tab-networth');
  const btnInvestment = document.getElementById('tab-investment');
  const contentNetworth = document.getElementById('content-networth');
  const contentInvestment = document.getElementById('content-investment');
  const projectionToggle = document.getElementById('projection-toggle-container');

  if (tabName === 'networth') {
    // Style Buttons
    btnNetworth.className = "flex-1 py-2 text-sm font-medium rounded-lg bg-[#DFECE6] text-gray-900 shadow-sm transition-all duration-200";
    btnInvestment.className = "flex-1 py-2 text-sm font-medium rounded-lg text-gray-600 transition-all duration-200 hover:text-gray-900";

    // Show Content
    contentNetworth.classList.remove('hidden');
    contentInvestment.classList.add('hidden');

    // Hide Toggle (Networth summary doesn't have chart toggle)
    projectionToggle.classList.add('invisible');
  } else {
    // Style Buttons
    btnInvestment.className = "flex-1 py-2 text-sm font-medium rounded-lg bg-[#DFECE6] text-gray-900 shadow-sm transition-all duration-200";
    btnNetworth.className = "flex-1 py-2 text-sm font-medium rounded-lg text-gray-600 transition-all duration-200 hover:text-gray-900";

    // Show Content
    contentInvestment.classList.remove('hidden');
    contentNetworth.classList.add('hidden');

    // Show Toggle
    projectionToggle.classList.remove('invisible');

    // Refresh chart to ensure it renders correctly after being hidden
    if(investmentChartInstance) {
        investmentChartInstance.resize();
    }
  }
}

// 2. Chart Toggle Logic (Pie vs Bar)
function toggleChartType(element) {
  const checkbox = element || document.getElementById('view-projections-toggle');

  if (!checkbox) return;

  const isChecked = checkbox.checked;
  const summaryText = document.getElementById('yearly-growth-text-disabled');
  const projectionText = document.getElementById('yearly-growth-text');

  if (isChecked) {
    if(projectionText) projectionText.classList.remove('hidden');
    if(summaryText) summaryText.classList.add('hidden');
  } else {
    if(projectionText) projectionText.classList.add('hidden');
    if(summaryText) summaryText.classList.remove('hidden');
  }

  setTimeout(() => {
    try {
      if (isChecked) {
        if (typeof renderBarChart === 'function') renderBarChart();
      } else {
        if (typeof renderPieChart === 'function') renderPieChart();
      }
    } catch (error) {
      console.error("Error rendering chart:", error);
    }
  }, 0);
}


// 3. Render Pie Chart (Snapshot)
function renderPieChart() {
  const ctx = document.getElementById('investmentChart').getContext('2d');

  if (investmentChartInstance) {
    investmentChartInstance.destroy();
  }

  investmentChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Starting amount', 'Interest earned', 'Total contributions'],
      datasets: [{
        data: [chartData.startAmount, chartData.totalInterest, chartData.totalContrib],
        backgroundColor: [CHART_COLORS.starting, CHART_COLORS.interest, CHART_COLORS.contrib],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }, // We built a custom legend in HTML
        tooltip: {
            callbacks: {
                label: function(context) {
                    let label = context.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed !== null) {
                        label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
                    }
                    return label;
                }
            }
        }
      }
    }
  });
}

// 4. Render Bar Chart (Timeline)
function renderBarChart() {
  const ctx = document.getElementById('investmentChart').getContext('2d');

  if (investmentChartInstance) {
    investmentChartInstance.destroy();
  }

  investmentChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.yearlyData.labels,
      datasets: [
        {
          label: 'Starting amount',
          data: chartData.yearlyData.starting,
          backgroundColor: CHART_COLORS.starting,
          stack: 'Stack 0'
        },
        {
          label: 'Interest earned',
          data: chartData.yearlyData.interest,
          backgroundColor: CHART_COLORS.interest,
          stack: 'Stack 0'
        },
        {
          label: 'Total contributions',
          data: chartData.yearlyData.contrib,
          backgroundColor: CHART_COLORS.contrib,
          stack: 'Stack 0',
          borderRadius: { topLeft: 4, topRight: 4 } // Rounded tops on the highest bar
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          title: { display: true, text: 'Investment timeline', font: { size: 10 } }
        },
        y: {
          border: { display: false },
          grid: { color: '#f3f4f6' },
          ticks: {
            callback: function(value) {
                if(value >= 1000) return '$' + value/1000 + 'k';
                return '$' + value;
            },
            font: { size: 10 }
          }
        }
      },
      plugins: {
        legend: { display: false }, // Custom legend used
        tooltip: {
            mode: 'index',
            intersect: false
        }
      }
    }
  });
}

// Networth Calculator JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Networth calculator state
  const networthState = {
    assets: {},
    liabilities: {},
    totalAssets: 0,
    totalLiabilities: 0,
    networth: 0,
  };

  // Asset and liability categories mapping - Updated to match actual HTML IDs
  const networthCategories = {
    assets: [
      "registered-retirement",
      "tfsa-accounts",
      "non-registered-investments",
      "home-value",
      "other-properties",
      "other-valuables",
    ],
    liabilities: [
      "home-mortgage",
      "other-mortgages",
      "credit-cards",
      "lines-of-credit",
      "loans",
    ],
  };

  // Initialize networth calculator
  function initializeNetworthCalculator() {
    const networthSection = document.getElementById("networth-section");
    if (networthSection) {
      // Remove disabled state
      networthSection.classList.remove("opacity-50", "pointer-events-none");
      networthSection.classList.add("animate-fade-in");
    }

    // Add event listeners to all input fields
    addNetworthEventListeners();

    // Initialize expand/collapse functionality
    initializeToggleButtons();
  }

  // Add event listeners to networth input fields
  function addNetworthEventListeners() {
    const assetInputs = document.querySelectorAll(
      "#networth-section .asset-input"
    );
    const liabilityInputs = document.querySelectorAll(
      "#networth-section .liability-input"
    );

    [...assetInputs, ...liabilityInputs].forEach((input) => {
      input.addEventListener("input", calculateNetworth);
      input.addEventListener("blur", calculateNetworth);
    });
  }

  // Calculate total networth
  function calculateNetworth() {
    // Calculate total assets
    networthState.totalAssets = 0;
    networthState.assets = {};

    networthCategories.assets.forEach((assetId) => {
      const input = document.getElementById(assetId);
      if (input) {
        const value = parseFloat(input.value) || 0;
        networthState.assets[assetId] = value;
        networthState.totalAssets += value;
      }
    });

    // Calculate total liabilities
    networthState.totalLiabilities = 0;
    networthState.liabilities = {};

    networthCategories.liabilities.forEach((liabilityId) => {
      const input = document.getElementById(liabilityId);
      if (input) {
        const value = parseFloat(input.value) || 0;
        networthState.liabilities[liabilityId] = value;
        networthState.totalLiabilities += value;
      }
    });

    // Calculate networth
    networthState.networth =
      networthState.totalAssets - networthState.totalLiabilities;

    // Update display
    updateNetworthDisplay();
    updateCategoryTotals();

    // Update investment calculator starting amounts
    updateInvestmentStartingAmounts();
  }

  // New function to update investment calculator starting amounts
  function updateInvestmentStartingAmounts() {
    // Find all starting amount input fields in the investment calculator
    const startingAmountInputs = document.querySelectorAll(
      "#starting-amount, #target-starting-amount"
    );

    startingAmountInputs.forEach((input) => {
      if (input && networthState.totalAssets > 0) {
        // Set the value to total assets
        input.value = networthState.totalAssets;

        // Trigger input event to update any dependent calculations
        const event = new Event("input", { bubbles: true });
        input.dispatchEvent(event);
      }
    });
  }

  // Update networth display
  function updateNetworthDisplay() {
    const totalAssetsElement = document.getElementById("total-assets");
    const totalLiabilitiesElement =
      document.getElementById("total-liabilities");
    const networthElement = document.getElementById("total-networth");

    if (totalAssetsElement) {
      totalAssetsElement.textContent = formatCurrency(
        networthState.totalAssets
      );
    }
    if (totalLiabilitiesElement) {
      totalLiabilitiesElement.textContent = formatCurrency(
        networthState.totalLiabilities
      );
    }
    if (networthElement) {
      networthElement.textContent = formatCurrency(networthState.networth);
      // Add color coding based on positive/negative networth
      networthElement.className =
        networthState.networth >= 0
          ? "text-2xl font-bold text-green-600"
          : "text-2xl font-bold text-red-600";
    }
  }

  // Update category totals
  function updateCategoryTotals() {
    // Update assets total
    const assetsTotalElement = document.getElementById("assets-total");
    if (assetsTotalElement) {
      assetsTotalElement.textContent = formatCurrency(
        networthState.totalAssets
      );
    }

    // Update liabilities total
    const liabilitiesTotalElement =
      document.getElementById("liabilities-total");
    if (liabilitiesTotalElement) {
      liabilitiesTotalElement.textContent = formatCurrency(
        networthState.totalLiabilities
      );
    }
  }

  // Toggle category visibility
  function toggleNetworthCategory(categoryName) {
    const categoryButton = document.querySelector(
      `[onclick="toggleNetworthCategory('${categoryName}')"]`
    );
    const categoryContent =
      categoryButton?.parentElement?.querySelector(".category-content");
    const arrow = categoryButton?.querySelector(".category-arrow");

    if (categoryContent && arrow) {
      const isExpanded =
        categoryContent.style.maxHeight &&
        categoryContent.style.maxHeight !== "0px";

      // Close all other categories first (accordion behavior)
      const allCategories = ["assets", "liabilities"];
      allCategories.forEach((cat) => {
        if (cat !== categoryName) {
          const otherButton = document.querySelector(
            `[onclick="toggleNetworthCategory('${cat}')"]`
          );
          const otherContent =
            otherButton?.parentElement?.querySelector(".category-content");
          const otherArrow = otherButton?.querySelector(".category-arrow");

          if (otherContent && otherArrow) {
            otherContent.style.maxHeight = "0px";
            otherContent.style.opacity = "0";
            otherArrow.style.transform = "rotate(0deg)";
          }
        }
      });

      if (isExpanded) {
        // Collapse current category
        categoryContent.style.maxHeight = "0px";
        categoryContent.style.opacity = "0";
        arrow.style.transform = "rotate(0deg)";
      } else {
        // Expand current category
        categoryContent.style.maxHeight = categoryContent.scrollHeight + "px";
        categoryContent.style.opacity = "1";
        arrow.style.transform = "rotate(180deg)";
      }
    }
  }

  // Initialize toggle buttons
  function initializeToggleButtons() {
    const toggleAllButton = document.getElementById("toggle-all-networth");
    if (toggleAllButton) {
      toggleAllButton.addEventListener("click", toggleAllNetworthCategories);
    }
  }

  // Toggle all categories
  function toggleAllNetworthCategories() {
    const toggleButton = document.getElementById("toggle-all-networth");
    const allCategories = document.querySelectorAll(
      "#networth-section .category-content"
    );
    const allArrows = document.querySelectorAll(
      "#networth-section .category-arrow"
    );

    const isExpanding = toggleButton.textContent.trim() === "Expand All";

    allCategories.forEach((content, index) => {
      const arrow = allArrows[index];
      if (isExpanding) {
        content.style.maxHeight = content.scrollHeight + "px";
        content.style.opacity = "1";
        if (arrow) arrow.style.transform = "rotate(180deg)";
      } else {
        content.style.maxHeight = "0px";
        content.style.opacity = "0";
        if (arrow) arrow.style.transform = "rotate(0deg)";
      }
    });

    toggleButton.textContent = isExpanding ? "Collapse All" : "Expand All";
  }

  // Format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  // Make functions globally available
  window.toggleNetworthCategory = toggleNetworthCategory;
  window.calculateNetworth = calculateNetworth;

  // Initialize when DOM is ready
  initializeNetworthCalculator();
});

const svgIcon = document.getElementById("tooltipToggle");
const tooltip = document.getElementById("tooltip");

svgIcon.addEventListener("click", () => {
  const isVisible = tooltip.classList.contains("opacity-100");
  tooltip.classList.toggle("opacity-100", !isVisible);
  tooltip.classList.toggle("opacity-0", isVisible);
  tooltip.classList.toggle("pointer-events-none", isVisible);
});

// Optional: hide tooltip when clicking outside
document.addEventListener("click", (e) => {
  if (!svgIcon.contains(e.target) && !tooltip.contains(e.target)) {
    tooltip.classList.add("opacity-0", "pointer-events-none");
    tooltip.classList.remove("opacity-100");
  }
});

const tfsaIcon = document.getElementById("tfsaTooltipToggle");
const tfsaTooltip = document.getElementById("tfsaTooltip");

tfsaIcon.addEventListener("click", () => {
  const isVisible = tfsaTooltip.classList.contains("opacity-100");
  tfsaTooltip.classList.toggle("opacity-100", !isVisible);
  tfsaTooltip.classList.toggle("opacity-0", isVisible);
  tfsaTooltip.classList.toggle("pointer-events-none", isVisible);
});

document.addEventListener("click", (e) => {
  if (!tfsaIcon.contains(e.target) && !tfsaTooltip.contains(e.target)) {
    tfsaTooltip.classList.add("opacity-0", "pointer-events-none");
    tfsaTooltip.classList.remove("opacity-100");
  }
});

const nonRegIcon = document.getElementById("nonRegisteredTooltipToggle");
const nonRegTooltip = document.getElementById("nonRegisteredTooltip");

nonRegIcon.addEventListener("click", () => {
  const isVisible = nonRegTooltip.classList.contains("opacity-100");
  nonRegTooltip.classList.toggle("opacity-100", !isVisible);
  nonRegTooltip.classList.toggle("opacity-0", isVisible);
  nonRegTooltip.classList.toggle("pointer-events-none", isVisible);
});

document.addEventListener("click", (e) => {
  if (!nonRegIcon.contains(e.target) && !nonRegTooltip.contains(e.target)) {
    nonRegTooltip.classList.add("opacity-0", "pointer-events-none");
    nonRegTooltip.classList.remove("opacity-100");
  }
});

const homeIcon = document.getElementById("homeValueTooltipToggle");
const homeTooltip = document.getElementById("homeValueTooltip");

homeIcon.addEventListener("click", () => {
  const isVisible = homeTooltip.classList.contains("opacity-100");
  homeTooltip.classList.toggle("opacity-100", !isVisible);
  homeTooltip.classList.toggle("opacity-0", isVisible);
  homeTooltip.classList.toggle("pointer-events-none", isVisible);
});

document.addEventListener("click", (e) => {
  if (!homeIcon.contains(e.target) && !homeTooltip.contains(e.target)) {
    homeTooltip.classList.add("opacity-0", "pointer-events-none");
    homeTooltip.classList.remove("opacity-100");
  }
});

// Get the toggle icon and tooltip elements
const tooltipToggle = document.getElementById("otherPropertiesTooltipToggle");
const otherPropertiesTooltip = document.getElementById(
  "otherPropertiesTooltip"
);

// Toggle tooltip visibility on click
tooltipToggle.addEventListener("click", () => {
  const isVisible = otherPropertiesTooltip.classList.contains("opacity-100");

  if (isVisible) {
    // Hide tooltip
    otherPropertiesTooltip.classList.remove(
      "opacity-100",
      "pointer-events-auto"
    );
    otherPropertiesTooltip.classList.add("opacity-0", "pointer-events-none");
  } else {
    // Show tooltip
    otherPropertiesTooltip.classList.remove("opacity-0", "pointer-events-none");
    otherPropertiesTooltip.classList.add("opacity-100", "pointer-events-auto");
  }
});

// Optional: Hide tooltip when clicking outside
document.addEventListener("click", (event) => {
  if (
    !otherPropertiesTooltip.contains(event.target) &&
    !tooltipToggle.contains(event.target)
  ) {
    otherPropertiesTooltip.classList.remove(
      "opacity-100",
      "pointer-events-auto"
    );
    otherPropertiesTooltip.classList.add("opacity-0", "pointer-events-none");
  }
});

const valuableTooltipToggle = document.getElementById(
  "otherValueableTooltipToggle"
);
const otherValuableTooltip = document.getElementById("otherValuableTooltip");

// Toggle tooltip visibility on click
valuableTooltipToggle.addEventListener("click", () => {
  const isVisible = otherValuableTooltip.classList.contains("opacity-100");

  if (isVisible) {
    // Hide tooltip
    otherValuableTooltip.classList.remove("opacity-100", "pointer-events-auto");
    otherValuableTooltip.classList.add("opacity-0", "pointer-events-none");
  } else {
    // Show tooltip
    otherValuableTooltip.classList.remove("opacity-0", "pointer-events-none");
    otherValuableTooltip.classList.add("opacity-100", "pointer-events-auto");
  }
});

// Optional: Hide tooltip when clicking outside
document.addEventListener("click", (event) => {
  if (
    !otherValuableTooltip.contains(event.target) &&
    !valuableTooltipToggle.contains(event.target)
  ) {
    otherValuableTooltip.classList.remove("opacity-100", "pointer-events-auto");
    otherValuableTooltip.classList.add("opacity-0", "pointer-events-none");
  }
});

// Get all tooltip toggles and tooltips
// List all toggle-tooltip pairs
const tooltips = [
  {
    toggle: document.getElementById("homeMortgageTooltipToggle"),
    tooltip: document.getElementById("homeMortgageTooltip"),
  },
  {
    toggle: document.getElementById("otherMortgagesTooltipToggle"),
    tooltip: document.getElementById("otherMortgagesTooltip"),
  },
  {
    toggle: document.getElementById("creditCardsTooltipToggle"),
    tooltip: document.getElementById("creditCardsTooltip"),
  },
  {
    toggle: document.getElementById("linesOfCreditTooltipToggle"),
    tooltip: document.getElementById("linesOfCreditTooltip"),
  },
  {
    toggle: document.getElementById("loansTooltipToggle"),
    tooltip: document.getElementById("loansTooltip"),
  },
  {
    toggle: document.getElementById("otherValuableTooltipToggle"),
    tooltip: document.getElementById("otherValuableTooltip"),
  },
].filter(({ toggle, tooltip }) => toggle && tooltip); // remove null entries

// Close all tooltips
function closeAllTooltips() {
  tooltips.forEach(({ tooltip }) => {
    tooltip.classList.remove("opacity-100", "pointer-events-auto");
    tooltip.classList.add("opacity-0", "pointer-events-none");
  });
}

// Toggle on click
tooltips.forEach(({ toggle, tooltip }) => {
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isVisible = tooltip.classList.contains("opacity-100");

    closeAllTooltips();

    if (!isVisible) {
      tooltip.classList.remove("opacity-0", "pointer-events-none");
      tooltip.classList.add("opacity-100", "pointer-events-auto");
    }
  });
});

// Close when clicking outside
document.addEventListener("click", (e) => {
  const clickedInsideAny = tooltips.some(({ tooltip, toggle }) => {
    return tooltip.contains(e.target) || toggle.contains(e.target);
  });

  if (!clickedInsideAny) {
    closeAllTooltips();
  }
});
