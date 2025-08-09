/**
 * End Amount Calculator
 * Handles all calculations related to determining future value of investments
 */

class EndAmountCalculator {
  /**
   * Calculate the future value of an investment with periodic contributions
   * @param {number} startingAmount - The initial investment amount
   * @param {number} additionalContribution - The periodic contribution amount
   * @param {number} returnRate - Annual return rate as percentage
   * @param {number} years - Investment period in years
   * @param {string} contributionTiming - When contributions are made ('beginning', 'end', 'year-beginning', 'year-end')
   * @returns {Object} Calculation results
   */
  static calculateEndAmount(
    startingAmount,
    additionalContribution,
    returnRate,
    years,
    contributionTiming
  ) {
    const PV = parseFloat(startingAmount) || 0;
    const annualPMT = parseFloat(additionalContribution) || 0;
    const annualRate = parseFloat(returnRate) / 100;
    const investmentYears = parseFloat(years) || 0;

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

    const isMonthly =
      contributionTiming === "beginning" || contributionTiming === "end";

    if (isMonthly) {
      r = annualRate / 12;
      n = investmentYears * 12;
      pmt = annualPMT / 12;
    } else {
      r = annualRate;
      n = investmentYears;
      pmt = annualPMT;
    }

    totalContributions = pmt * n;

    let fvOfPV = PV * Math.pow(1 + r, n);
    let fvOfAnnuity = 0;

    if (pmt > 0) {
      if (r > 0) {
        fvOfAnnuity = pmt * ((Math.pow(1 + r, n) - 1) / r);
        if (
          contributionTiming === "beginning" ||
          contributionTiming === "year-beginning"
        ) {
          fvOfAnnuity *= 1 + r;
        }
      } else {
        fvOfAnnuity = pmt * n;
      }
    }

    FV = fvOfPV + fvOfAnnuity;
    const totalInterest = FV - PV - totalContributions;

    return {
      endBalance: FV,
      startingAmount: PV,
      totalContributions: totalContributions,
      totalInterest: Math.max(0, totalInterest),
    };
  }

  /**
   * Calculate yearly projection for end amount scenario
   * @param {number} startingAmount - The initial investment amount
   * @param {number} additionalContribution - The periodic contribution amount
   * @param {number} returnRate - Annual return rate as percentage
   * @param {number} inputYears - Total investment period in years
   * @param {string} contributionTiming - When contributions are made
   * @returns {Array} Array of yearly data
   */
  static calculateYearlyProjection(
    startingAmount,
    additionalContribution,
    returnRate,
    inputYears,
    contributionTiming
  ) {
    const displayYears = Math.min(inputYears, 10);
    const yearlyData = [];

    for (let year = 1; year <= displayYears; year++) {
      const results = this.calculateEndAmount(
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

  /**
   * Generate result description for end amount calculations
   * @param {number} startingAmount - The initial investment amount
   * @param {number} returnRate - Annual return rate as percentage
   * @param {number} years - Investment period in years
   * @param {number} additionalContribution - The periodic contribution amount
   * @param {number} endBalance - The calculated end balance
   * @returns {string} Formatted description
   */
  static generateResultDescription(
    startingAmount,
    returnRate,
    years,
    additionalContribution,
    endBalance
  ) {
    const starting = parseFloat(startingAmount) || 0;
    const rate = parseFloat(returnRate) || 0;
    const period = parseFloat(years) || 0;
    const contribution = parseFloat(additionalContribution) || 0;
    const balance = parseFloat(endBalance) || 0;

    if (starting === 0 && contribution === 0) {
      return "Please enter a starting amount or additional contribution to see your investment projection.";
    }

    if (period === 0) {
      return "Please enter an investment period to see your projection.";
    }

    let description = `Starting with $${starting.toLocaleString()}`;

    if (contribution > 0) {
      description += ` and contributing $${contribution.toLocaleString()} annually`;
    }

    description += ` at ${rate}% annual return for ${period} year${
      period !== 1 ? "s" : ""
    }, your investment will grow to $${balance.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}.`;

    return description;
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = EndAmountCalculator;
}
