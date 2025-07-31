document.addEventListener("DOMContentLoaded", function () {
  const ctx = document.getElementById("investmentPieChart").getContext("2d");
  new Chart(ctx, {
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

  const defaultSection = document.getElementById("default-input-section");
  const contributionSection = document.getElementById("contribution-input-section");
  const returnRateSection = document.getElementById("return-rate-section");
  const endAmountTab = document.getElementById("end-amount");
  const contributionTab = document.getElementById("additional-contribution-tab");
  const returnRateTab = document.getElementById("return-rate-tab");
  const startingAmountTab = document.getElementById("starting-amount-tab");
  const endAmountSection = document.getElementById("end-amount-section");
  const startingAmountSection = document.getElementById("starting-amount-section");
  const investmentLengthTab= document.getElementById("investment-length-tab");
  const investmentSection=document.getElementById("investment-length-section");
  const body = document.body;

  contributionTab.addEventListener("click", function () {
    // Hide default section
    defaultSection.classList.add("hidden");
    defaultSection.classList.remove("block");

    // Show contribution section
    contributionSection.classList.remove("hidden");
    contributionSection.classList.add("block");

    // Make sure the body and html elements can scroll
    document.documentElement.style.overflow = "auto";
    body.style.overflow = "auto";

    // Reset any possible fixed height
    document.documentElement.style.height = "auto";
    body.style.height = "auto";

    // Optional: Recalculate layout if navbar was sticky
    window.scrollTo(0, 0);
  });

  returnRateTab.addEventListener("click", function () {
    defaultSection.classList.add("hidden");
    defaultSection.classList.remove("block");

    contributionSection.classList.add("hidden");
    contributionSection.classList.remove("block");

    returnRateSection.classList.remove("hidden");
    returnRateSection.classList.add("block");
  });

  endAmountTab.addEventListener("click", function () {
    defaultSection.classList.remove("hidden");
    defaultSection.classList.add("block");

    contributionSection.classList.add("hidden");
    contributionSection.classList.remove("block");
  });

  startingAmountTab.addEventListener("click", function () {
    // Hide other sections
    defaultSection.classList.add("hidden");
    defaultSection.classList.remove("block");

    contributionSection.classList.add("hidden");
    contributionSection.classList.remove("block");

    returnRateSection.classList.add("hidden");
    returnRateSection.classList.remove("block");

    // endAmountSection.classList.add("hidden");
    // endAmountSection.classList.remove("block");

    // Show the starting amount section
    startingAmountSection.classList.remove("hidden");
    startingAmountSection.classList.add("block");
  });
  investmentLengthTab.addEventListener("click", function () {
    // Hide other sections
    defaultSection.classList.add("hidden");
    defaultSection.classList.remove("block");

    contributionSection.classList.add("hidden");
    contributionSection.classList.remove("block");

    returnRateSection.classList.add("hidden");
    returnRateSection.classList.remove("block");
    startingAmountSection.classList.add("hidden");
    startingAmountSection.classList.remove("block");

    investmentSection.classList.add("block")
    investmentSection.classList.remove("hidden")
  });
});
