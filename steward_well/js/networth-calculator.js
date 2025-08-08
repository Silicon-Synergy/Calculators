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
