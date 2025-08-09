/**
 * Additional Contribution Calculator
 * Handles all calculations related to determining required contributions to reach target amounts
 */

class AdditionalContributionCalculator {
  /**
   * Calculate the required periodic contribution to reach a target amount
   * @param {number} targetAmount - The desired future value
   * @param {number} startingAmount - The initial investment amount
   * @param {number} returnRate - Annual return rate as percentage
   * @param {number} years - Investment period in years
   * @param {string} contributionTiming - When contributions are made ('beginning', 'end', 'year-beginning', 'year-end')
   * @returns {Object} Calculation results
   */
  static calculateRequiredContribution(
    targetAmount,
    startingAmount,
    returnRate,
    years,
    contributionTiming
  ) {
    const FV = parseFloat(targetAmount) || 0;
    const PV = parseFloat(startingAmount) || 0;
    const annualRate = parseFloat(returnRate) / 100;
    const investmentYears = parseFloat(years) || 0;

    if (FV === 0 || investmentYears === 0) {
      return {
        targetAmount: FV,
        startingAmount: PV,
        requiredContribution: 0,
        totalContributions: 0,
        totalInterest: 0,
      };
    }

    let r,
      n,
      requiredPMT = 0;

    // Calculate future value of starting amount
    let fvOfPV;

    if (contributionTiming === "beginning" || contributionTiming === "end") {
      // Monthly contributions
      r = annualRate / 12;
      n = investmentYears * 12;
      fvOfPV = PV * Math.pow(1 + r, n);
    } else {
      // Annual contributions
      r = annualRate;
      n = investmentYears;
      fvOfPV = PV * Math.pow(1 + r, n);
    }

    // Amount needed from contributions
    const amountNeededFromContributions = FV - fvOfPV;

    if (amountNeededFromContributions > 0) {
      if (r > 0) {
        // Calculate required payment using the provided formulas
        if (contributionTiming === "end") {
          // End of Month Contributions (Ordinary Annuity)
          // PMT = (FV - PV×(1+r)^n) / (((1+r)^n - 1) / r)
          requiredPMT =
            amountNeededFromContributions / ((Math.pow(1 + r, n) - 1) / r);
        } else if (contributionTiming === "beginning") {
          // Beginning of Month Contributions (Annuity Due)
          // PMT = (FV - PV×(1+r)^n) / ((((1+r)^n - 1) / r) × (1+r))
          requiredPMT =
            amountNeededFromContributions /
            (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
        } else if (contributionTiming === "year-end") {
          // End of Year Contributions (Ordinary Annuity)
          // PMT = (FV - PV×(1+r)^n) / (((1+r)^n - 1) / r)
          requiredPMT =
            amountNeededFromContributions / ((Math.pow(1 + r, n) - 1) / r);
        } else if (contributionTiming === "year-beginning") {
          // Beginning of Year Contributions (Annuity Due)
          // PMT = (FV - PV×(1+r)^n) / ((((1+r)^n - 1) / r) × (1+r))
          requiredPMT =
            amountNeededFromContributions /
            (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
        }
      } else {
        // No interest case - simple division
        requiredPMT = amountNeededFromContributions / n;
      }
    }

    const totalContributions = requiredPMT * n;
    const totalInterest = FV - PV - totalContributions;

    return {
      targetAmount: FV,
      startingAmount: PV,
      requiredContribution: Math.max(0, requiredPMT),
      totalContributions: Math.max(0, totalContributions),
      totalInterest: Math.max(0, totalInterest),
    };
  }

  /**
   * Calculate yearly projection for additional contribution scenario
   * @param {number} targetAmount - The desired future value
   * @param {number} startingAmount - The initial investment amount
   * @param {number} returnRate - Annual return rate as percentage
   * @param {number} inputYears - Total investment period in years
   * @param {string} contributionTiming - When contributions are made
   * @returns {Array} Array of yearly data
   */
  static calculateYearlyProjectionContrib(
    targetAmount,
    startingAmount,
    returnRate,
    inputYears,
    contributionTiming
  ) {
    const displayYears = Math.min(inputYears, 10);
    const yearlyData = [];

    for (let year = 1; year <= displayYears; year++) {
      const results = this.calculateRequiredContribution(
        targetAmount,
        startingAmount,
        returnRate,
        year,
        contributionTiming
      );

      yearlyData.push({
        year: year,
        startingAmount: results.startingAmount,
        totalContributions: results.totalContributions,
        totalInterest: results.totalInterest,
        requiredContribution: results.requiredContribution,
      });
    }

    return yearlyData;
  }

  /**
   * Generate result description for additional contribution calculations
   * @param {number} targetAmount - The desired future value
   * @param {number} startingAmount - The initial investment amount
   * @param {number} returnRate - Annual return rate as percentage
   * @param {number} years - Investment period in years
   * @param {string} contributionTiming - When contributions are made
   * @param {number} requiredContribution - The calculated required contribution
   * @returns {string} Formatted description
   */
  static generateResultDescription(
    targetAmount,
    startingAmount,
    returnRate,
    years,
    contributionTiming,
    requiredContribution
  ) {
    const target = parseFloat(targetAmount) || 0;
    const starting = parseFloat(startingAmount) || 0;
    const rate = parseFloat(returnRate) || 0;
    const period = parseFloat(years) || 0;
    const contribution = parseFloat(requiredContribution) || 0;

    if (target === 0 || period === 0) {
      return "Please enter a target amount and investment period to see your required contribution.";
    }

    const timingText =
      {
        beginning: "beginning of each month",
        end: "end of each month",
        "year-beginning": "beginning of each year",
        "year-end": "end of each year",
      }[contributionTiming] || "end of each year";

    const periodText =
      contributionTiming === "beginning" || contributionTiming === "end"
        ? "monthly"
        : "annual";

    if (starting >= target) {
      return `Your starting amount of $${starting.toLocaleString()} already meets or exceeds your target of $${target.toLocaleString()}. No additional contributions are needed.`;
    }

    return `To reach your target of $${target.toLocaleString()} in ${period} year${
      period !== 1 ? "s" : ""
    } with a ${rate}% annual return, you need to contribute $${contribution.toLocaleString(
      "en-US",
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )} ${periodText} at the ${timingText}.`;
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = AdditionalContributionCalculator;
}
