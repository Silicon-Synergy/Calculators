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

  endAmountTab.addEventListener("click", function () {
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
      if (charts['end']) {
        charts['end'].destroy();
      }

      const canvas = document.getElementById("investmentPieChart-end");
      if (!canvas) return;

      const ctx = canvas.getContext("2d");

      charts['end'] = new Chart(ctx, {
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

  contributionTab.addEventListener("click", function () {
    const ctx = document
      .getElementById("investmentPieChart-contribution")
      .getContext("2d");

    if (charts['contribution']) {
      charts['contribution'].destroy();
    }

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

    charts['contribution'] = new Chart(ctx, {
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
    const ctx = document
      .getElementById("investmentPieChart-return")
      .getContext("2d");

    if (charts['return']) {
      charts['return'].destroy();
    }

    defaultSection.classList.add("hidden");
    defaultSection.classList.remove("block");

    contributionSection.classList.add("hidden");
    contributionSection.classList.remove("block");

    returnRateSection.classList.remove("hidden");
    returnRateSection.classList.add("block");

    charts['return'] = new Chart(ctx, {
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

      if (charts['investment']) {
        charts['investment'].destroy();
      }

      charts['investment'] = new Chart(ctx, {
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

      if (charts['start']) {
        charts['start'].destroy();
      }

      charts['start'] = new Chart(ctx, {
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

  endAmountTab.click();
});
