class PersonalFinanceCalculator {
    constructor() {
        this.deductionRates = {
            'federal_tax': 0.20,
            'state_tax': 0.08,
            'health_insurance': 0.03,
            'social_security': 0.062,
            'medicare': 0.0145
        };
        this.optionalDeductions = {
            'retirement': 0.10
        };
        this.annualIncome = 0.0;
        this.monthlyDisposableIncome = 0.0;
        this.totalMonthlyExpensesEntered = 0.0;
        this.deductionsBreakdown = {};
        this.annualDisposable = 0.0;
        this.includeRetirement = false;
    }

    calculateDeductions(annualIncome, includeRetirement = false) {
        const deductions = {};
        let totalDeductions = 0;

        // Mandatory deductions
        for (const deductionType in this.deductionRates) {
            const rate = this.deductionRates[deductionType];
            const amount = annualIncome * rate;
            deductions[deductionType] = { amount: amount, percentage: rate * 100 };
            totalDeductions += amount;
        }

        // Optional retirement contribution
        if (includeRetirement) {
            for (const deductionType in this.optionalDeductions) {
                const rate = this.optionalDeductions[deductionType];
                const amount = annualIncome * rate;
                deductions[deductionType] = { amount: amount, percentage: rate * 100 };
                totalDeductions += amount;
            }
        }
        return { deductions, totalDeductions };
    }

    _allocateFunds(monthlyDisposable, totalMonthlyExpenses, savingsPctDesired, investmentsPctDesired) {
        let monthlySavings = 0;
        let monthlyInvestments = 0;
        let monthlyCashflow = 0;

        const remainingAfterExpenses = monthlyDisposable - totalMonthlyExpenses;
        const minCashflowPct = 0.10;
        const minCashflowAmount = monthlyDisposable * minCashflowPct;

        let hasAdequateCashflow = false;

        if (remainingAfterExpenses < minCashflowAmount) {
            monthlyCashflow = remainingAfterExpenses;
            hasAdequateCashflow = false;
            monthlySavings = 0;
            monthlyInvestments = 0;
        } else {
            monthlyCashflow = minCashflowAmount;
            let availableForSI = remainingAfterExpenses - monthlyCashflow;

            // Define minimum 10% for S/I if they are being targeted (desired percentage > 0)
            const minRequiredSavings = (savingsPctDesired > 0) ? (monthlyDisposable * 0.10) : 0;
            const minRequiredInvestments = (investmentsPctDesired > 0) ? (monthlyDisposable * 0.10) : 0;

            const totalMinSIRequired = minRequiredSavings + minRequiredInvestments;

            if (availableForSI >= totalMinSIRequired) {
                monthlySavings = minRequiredSavings;
                monthlyInvestments = minRequiredInvestments;
                availableForSI -= totalMinSIRequired;

                // Now, calculate remaining desired amounts (above minimums)
                let remainingDesiredSavings = (monthlyDisposable * savingsPctDesired / 100) - monthlySavings;
                let remainingDesiredInvestments = (monthlyDisposable * investmentsPctDesired / 100) - monthlyInvestments;

                // Ensure remaining desired are not negative (already allocated more by min)
                remainingDesiredSavings = Math.max(0, remainingDesiredSavings);
                remainingDesiredInvestments = Math.max(0, remainingDesiredInvestments);

                const totalRemainingDesired = remainingDesiredSavings + remainingDesiredInvestments;

                if (totalRemainingDesired > 0 && availableForSI > 0) {
                    // Distribute any remaining available funds proportionally up to desired amounts
                    const scaleFactor = Math.min(1, availableForSI / totalRemainingDesired);
                    monthlySavings += remainingDesiredSavings * scaleFactor;
                    monthlyInvestments += remainingDesiredInvestments * scaleFactor;
                } else if (availableForSI > 0) {
                    monthlyCashflow += availableForSI;
                }

            } else {
                const totalDesiredSIToScale = (monthlyDisposable * savingsPctDesired / 100) + (monthlyDisposable * investmentsPctDesired / 100);
                if (totalDesiredSIToScale > 0) {
                    const scaleFactor = availableForSI / totalDesiredSIToScale;
                    monthlySavings = (monthlyDisposable * savingsPctDesired / 100) * scaleFactor;
                    monthlyInvestments = (monthlyDisposable * investmentsPctDesired / 100) * scaleFactor;
                } else {
                    monthlySavings = 0;
                    monthlyInvestments = 0;
                }
                // Cashflow remains at minCashflowAmount
            }

            // Final check on cashflow to ensure it captures any residual from S/I allocation adjustments
            monthlyCashflow = monthlyDisposable - totalMonthlyExpenses - monthlySavings - monthlyInvestments;
            hasAdequateCashflow = monthlyCashflow >= minCashflowAmount;
        }

        return {
            monthly_savings: Math.max(0, monthlySavings),
            monthly_investments: Math.max(0, monthlyInvestments),
            monthly_cashflow: Math.max(0, monthlyCashflow),
            has_adequate_cashflow: hasAdequateCashflow,
            min_cashflow_amount: minCashflowAmount,
            remaining_unallocated: 0 // Cashflow absorbs all excess
        };
    }

    calculateBudget(annualIncome, livingExpenses, includeRetirement = false, userSavingsPct = null, userInvestmentsPct = null) {
        const { deductions, totalDeductions } = this.calculateDeductions(annualIncome, includeRetirement);
        const annualDisposable = annualIncome - totalDeductions;
        const monthlyDisposable = annualDisposable / 12;
        const totalMonthlyExpenses = Object.values(livingExpenses).reduce((sum, val) => sum + val, 0);

        const expensesPercentage = monthlyDisposable <= 0 ? Infinity : (totalMonthlyExpenses / monthlyDisposable) * 100;
        const [zone, status, savingsAllowed, investmentsAllowed] = this.determineBudgetZoneAndOptions(expensesPercentage);

        const recommendedSavingsPct = 12; // Default recommendation
        const recommendedInvestmentsPct = 15; // Default recommendation

        // Calculate allocation based on recommended percentages (only if allowed in current zone)
        const effectiveRecSavingsPct = savingsAllowed ? recommendedSavingsPct : 0;
        const effectiveRecInvestmentsPct = investmentsAllowed ? recommendedInvestmentsPct : 0;

        const recommendedAllocations = this._allocateFunds(
            monthlyDisposable, totalMonthlyExpenses, effectiveRecSavingsPct, effectiveRecInvestmentsPct
        );

        let customAllocations = null;
        // Only consider custom input if savings/investments are allowed in the current zone
        if ((savingsAllowed && userSavingsPct !== null) || (investmentsAllowed && userInvestmentsPct !== null)) {
            const userSavingsPctValidated = savingsAllowed && userSavingsPct !== null ? this.validateSavingsPercentage(userSavingsPct) : null;
            const userInvestmentsPctValidated = investmentsAllowed && userInvestmentsPct !== null ? this.validateInvestmentsPercentage(userInvestmentsPct) : null;

            // Only create a custom scenario if user provided valid input within the allowed ranges
            // and at least one of the inputs is not null (meaning user actually typed something valid)
            if ( (userSavingsPctValidated !== null && userSavingsPctValidated >= 10 && userSavingsPctValidated <= 15) ||
                (userInvestmentsPctValidated !== null && userInvestmentsPctValidated >= 10 && userInvestmentsPctValidated <= 20) )
            {
                // Use validated percentages, defaulting to 0 if a specific percentage wasn't provided or was invalid for that category
                const finalCustomSavingsPct = userSavingsPctValidated !== null ? userSavingsPctValidated : 0;
                const finalCustomInvestmentsPct = userInvestmentsPctValidated !== null ? userInvestmentsPctValidated : 0;

                // Ensure at least one percentage is positive to create a custom allocation
                if (finalCustomSavingsPct > 0 || finalCustomInvestmentsPct > 0) {
                    customAllocations = this._allocateFunds(
                        monthlyDisposable, totalMonthlyExpenses, finalCustomSavingsPct, finalCustomInvestmentsPct
                    );
                }
            }
        }

        return {
            annual_income: annualIncome,
            deductions: deductions,
            total_deductions: totalDeductions,
            annual_disposable: annualDisposable,
            monthly_disposable: monthlyDisposable,
            living_expenses: livingExpenses,
            total_monthly_expenses: totalMonthlyExpenses,
            expenses_percentage: expensesPercentage,
            budget_zone: zone,
            status_message: status,
            savings_allowed: savingsAllowed,
            investments_allowed: investmentsAllowed,
            recommended_allocations: recommendedAllocations,
            custom_allocations: customAllocations,
            include_retirement: includeRetirement
        };
    }

    determineBudgetZoneAndOptions(expensesPercentage) {
        if (expensesPercentage <= 70) {
            return ["GREEN", "You have good financial flexibility.", true, true]; // Savings and Investments allowed
        } else if (expensesPercentage <= 80) {
            return ["MODERATE", "Focus on savings and maintaining cashflow.", true, false]; // Savings allowed, Investments NOT
        } else {
            return ["RED", "Prioritize cashflow and expense reduction.", false, false]; // Neither allowed
        }
    }

    validateSavingsPercentage(value) {
        const val = parseFloat(value);
        // Returns the value only if it's within 10-15, otherwise null (invalid)
        if (isNaN(val) || val < 10 || val > 15) {
            return null;
        }
        return val;
    }

    validateInvestmentsPercentage(value) {
        const val = parseFloat(value);
        // Returns the value only if it's within 10-20, otherwise null (invalid)
        if (isNaN(val) || val < 10 || val > 20) {
            return null;
        }
        return val;
    }
}

// --- DOM Elements ---
const mainCalculatorCard = document.getElementById('main-calculator-card');
const annualIncomeInput = document.getElementById('annualIncome');
const annualIncomeError = document.getElementById('annualIncomeError');
const includeRetirementCheckbox = document.getElementById('includeRetirement'); // New checkbox

const deductionsDisposableSection = document.getElementById('deductions-disposable-section');
const totalAnnualDeductionsSpan = document.getElementById('totalAnnualDeductions');
const deductionInputsContainer = document.getElementById('deduction-inputs-container'); // New container for deduction fields
const annualDisposableIncomeSpan = document.getElementById('annualDisposableIncome');
const monthlyDisposableIncomeSpan = document.getElementById('monthlyDisposableIncome');

const livingExpensesSection = document.getElementById('living-expenses-section'); // Target for background color change
const expenseInputsContainer = document.getElementById('expense-inputs-container');
const integratedExpenseSummary = document.getElementById('integrated-expense-summary'); // New element for integrated status
const currentTotalExpensesSpan = document.getElementById('currentTotalExpenses');
const currentExpensesPercentageSpan = document.getElementById('currentExpensesPercentage');
const currentBudgetZoneSpan = document.getElementById('currentBudgetZone');
const currentZoneMessageP = document.getElementById('currentZoneMessage');

const savingsInvestmentsSection = document.getElementById('savings-investments-section');
const siGuidanceP = document.getElementById('si-guidance');
const savingsPercentageInput = document.getElementById('savingsPercentage');
const savingsPercentageError = document.getElementById('savingsPercentageError');
const investmentsPercentageInput = document.getElementById('investmentsPercentage');
const investmentsPercentageError = document.getElementById('investmentsPercentageError');
const cashflowAmountInput = document.getElementById('cashflowAmount'); // New cashflow input field

const finalSummarySection = document.getElementById('final-summary-section');
const finalSummaryContentDiv = document.getElementById('final-summary-content');

const calculator = new PersonalFinanceCalculator();
const livingExpenseCategories = [
    'Mortgage/Rent', 'Transport', 'Insurance', 'Utilities', 'Groceries',
    'Entertainment', 'Phone Bill', 'Internet Bill', 'Home Maintenance', 'Miscellaneous'
];
const livingExpenses = {}; // Object to store current living expense values

// --- Dynamic Expense Input Generation ---
function createExpenseInputs() {
    expenseInputsContainer.innerHTML = ''; // Clear existing
    livingExpenseCategories.forEach(category => {
        const id = category.toLowerCase().replace(/[\s/]/g, '_');
        const div = document.createElement('div');
        div.className = 'input-group';
        div.innerHTML = `
            <label for="${id}">${category} ($)</label>
            <input type="number" id="${id}" class="input-field expense-input" placeholder="0" min="0">
            <p id="${id}Error" class="error-message"></p>
            <p class="text-xs text-gray-500 mt-1">
                <span id="${id}Percentage" class="font-medium">0.0%</span> of disposable income
            </p>
        `;
        expenseInputsContainer.appendChild(div);
        livingExpenses[id] = 0; // Initialize expense to 0
    });

    // Add event listeners to newly created expense inputs
    document.querySelectorAll('.expense-input').forEach(input => {
        input.addEventListener('input', handleExpenseInput);
    });
}

// --- Event Handlers ---
annualIncomeInput.addEventListener('input', handleAnnualIncomeInput);
includeRetirementCheckbox.addEventListener('change', handleAnnualIncomeInput); // Listen for checkbox change

savingsPercentageInput.addEventListener('input', handleSavingsInvestmentsInput);
investmentsPercentageInput.addEventListener('input', handleSavingsInvestmentsInput);

function handleAnnualIncomeInput() {
    const incomeValue = parseFloat(annualIncomeInput.value);
    annualIncomeError.textContent = '';

    // Update retirement flag
    calculator.includeRetirement = includeRetirementCheckbox.checked;

    if (isNaN(incomeValue) || incomeValue < 0) {
        annualIncomeError.textContent = 'Please enter a valid positive number.';
        // Hide/reset sections if income is invalid
        deductionsDisposableSection.classList.add('hidden');
        livingExpensesSection.classList.add('opacity-50', 'pointer-events-none');
        integratedExpenseSummary.classList.add('hidden'); // Hide integrated status box
        savingsInvestmentsSection.classList.add('opacity-50', 'pointer-events-none');
        finalSummarySection.classList.add('hidden');

        // Ensure living expenses section background is reset if income becomes invalid
        livingExpensesSection.classList.remove('green-zone-bg', 'moderate-zone-bg', 'red-zone-bg');


        calculator.annualIncome = 0;
        calculator.monthlyDisposableIncome = 0;
        calculator.totalMonthlyExpensesEntered = 0;
        // Reset all expense inputs and values
        document.querySelectorAll('.expense-input').forEach(input => {
            input.value = '';
            document.getElementById(`${input.id}Percentage`).textContent = `0.0%`;
            input.classList.remove('green-border', 'moderate-border', 'red-border'); // Remove colored borders
            input.style.borderColor = ''; // Reset to default Tailwind border color
            input.style.boxShadow = ''; // Reset focus shadow
        });
        for (const key in livingExpenses) {
            livingExpenses[key] = 0;
        }
        // Also reset cashflow input
        cashflowAmountInput.value = '';

        updateDeductionsDisplay(0, false); // Clear deductions display
        updateRealtimeStatusDisplay(); // This will help reset other elements
        return;
    }

    calculator.annualIncome = incomeValue;
    const { deductions, totalDeductions } = calculator.calculateDeductions(incomeValue, calculator.includeRetirement);
    calculator.deductionsBreakdown = deductions;
    calculator.totalDeductions = totalDeductions;
    calculator.annualDisposable = incomeValue - totalDeductions;
    calculator.monthlyDisposableIncome = calculator.annualDisposable / 12;

    totalAnnualDeductionsSpan.textContent = `$${totalDeductions.toFixed(2)}`;
    annualDisposableIncomeSpan.textContent = `$${calculator.annualDisposable.toFixed(2)}`;
    monthlyDisposableIncomeSpan.textContent = `$${calculator.monthlyDisposableIncome.toFixed(2)}`;

    deductionsDisposableSection.classList.remove('hidden');
    livingExpensesSection.classList.remove('opacity-50', 'pointer-events-none');
    integratedExpenseSummary.classList.remove('hidden'); // Show integrated status box

    // Update deductions display
    updateDeductionsDisplay(incomeValue, calculator.includeRetirement);
    // Update real-time status with current (zero) expenses and update card/input colors
    updateRealtimeStatusDisplay();
}

function updateDeductionsDisplay(annualIncome, includeRetirement) {
    const { deductions, totalDeductions } = calculator.calculateDeductions(annualIncome, includeRetirement);
    deductionInputsContainer.innerHTML = ''; // Clear previous deductions

    const deductionOrder = [
        'federal_tax', 'state_tax', 'health_insurance',
        'social_security', 'medicare'
    ];
    // Add retirement to order if included
    if (includeRetirement) {
        deductionOrder.push('retirement');
    }

    deductionOrder.forEach(type => {
        if (deductions[type]) {
            const deduction = deductions[type];
            const id = type.replace('_', '-'); // e.g., federal-tax
            const div = document.createElement('div');
            div.className = 'input-group';
            div.innerHTML = `
                <label for="deduction-${id}">${type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} ($)</label>
                <input type="text" id="deduction-${id}" class="input-field" value="$${deduction.amount.toFixed(2)} (${deduction.percentage.toFixed(1)}%)" readonly>
            `;
            deductionInputsContainer.appendChild(div);
        }
    });
}


function handleExpenseInput(event) {
    const inputId = event.target.id;
    const expenseError = document.getElementById(`${inputId}Error`);
    const expensePercentageSpan = document.getElementById(`${inputId}Percentage`);
    const expenseValue = parseFloat(event.target.value);

    if (isNaN(expenseValue) || expenseValue < 0) {
        expenseError.textContent = 'Enter a valid positive number.';
        livingExpenses[inputId] = 0;
        expensePercentageSpan.textContent = `0.0%`;
    } else {
        expenseError.textContent = '';
        livingExpenses[inputId] = expenseValue;
        if (calculator.monthlyDisposableIncome > 0) {
            const pct = (expenseValue / calculator.monthlyDisposableIncome) * 100;
            expensePercentageSpan.textContent = `${pct.toFixed(1)}%`;
        } else {
            expensePercentageSpan.textContent = `N/A`;
        }
    }

    calculator.totalMonthlyExpensesEntered = Object.values(livingExpenses).reduce((sum, val) => sum + val, 0);
    updateRealtimeStatusDisplay(); // This also triggers final summary update
}

function handleSavingsInvestmentsInput(event) {
    const inputId = event.target.id;
    const errorElement = document.getElementById(`${inputId}Error`);
    let value = event.target.value;

    const isSavingsInput = (inputId === 'savingsPercentage');
    const minVal = isSavingsInput ? 10 : 10;
    const maxVal = isSavingsInput ? 15 : 20;

    if (value === '') { // Allow empty string for clearing input (means use default for custom scenario)
        errorElement.textContent = '';
    } else {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < minVal || numValue > maxVal) {
            errorElement.textContent = `Percentage must be between ${minVal}% and ${maxVal}%.`;
        } else {
            errorElement.textContent = '';
        }
    }

    updateRealtimeStatusDisplay(); // Now correctly calls this which handles cashflow update
    updateFinalSummaryDisplay(); // Trigger final summary update on S/I input
}

function updateRealtimeStatusDisplay() {
    const currentTotalExpenses = calculator.totalMonthlyExpensesEntered;
    const monthlyDisposable = calculator.monthlyDisposableIncome;

    currentTotalExpensesSpan.textContent = `$${currentTotalExpenses.toFixed(2)}`;

    let currentExpensesPercentage = 0;
    if (monthlyDisposable > 0) {
        currentExpensesPercentage = (currentTotalExpenses / monthlyDisposable) * 100;
    } else if (monthlyDisposable === 0 && currentTotalExpenses > 0) {
        currentExpensesPercentage = Infinity; // Infinite if expenses exist with no disposable income
    }
    currentExpensesPercentageSpan.textContent = `${currentExpensesPercentage.toFixed(1)}%`;

    const [zone, statusMessage, savingsAllowed, investmentsAllowed] = calculator.determineBudgetZoneAndOptions(currentExpensesPercentage);
    currentBudgetZoneSpan.textContent = zone;
    currentBudgetZoneSpan.className = `status-badge ${zone.toLowerCase()}-zone`;
    currentZoneMessageP.textContent = statusMessage;

    // Update ONLY the living expenses section background color based on zone
    livingExpensesSection.classList.remove('green-zone-bg', 'moderate-zone-bg', 'red-zone-bg');
    livingExpensesSection.classList.add(`${zone.toLowerCase()}-zone-bg`);


    // Update individual expense input field colors and percentages
    document.querySelectorAll('.expense-input').forEach(input => {
        input.classList.remove('green-border', 'moderate-border', 'red-border');
        input.style.borderColor = ''; // Reset border for default
        input.style.boxShadow = ''; // Reset box-shadow for focus

        // Apply new border color class based on zone
        if (zone === "GREEN") {
            input.classList.add('green-border');
        } else if (zone === "MODERATE") {
            input.classList.add('moderate-border');
        } else { // RED
            input.classList.add('red-border');
        }

        // Update individual expense percentage display
        const expensePercentageSpan = document.getElementById(`${input.id}Percentage`);
        const expenseValue = parseFloat(input.value);
        if (!isNaN(expenseValue) && expenseValue >= 0 && monthlyDisposable > 0) {
            const pct = (expenseValue / monthlyDisposable) * 100;
            expensePercentageSpan.textContent = `${pct.toFixed(1)}%`;
        } else {
            expensePercentageSpan.textContent = `0.0%`;
        }
    });

    // --- Update cashflow input field dynamically based on current user inputs ---
    // Get current values from S/I inputs
    const userSavingsPct = savingsPercentageInput.value === '' ? null : parseFloat(savingsPercentageInput.value);
    const userInvestmentsPct = investmentsPercentageInput.value === '' ? null : parseFloat(investmentsPercentageInput.value);

    // Calculate budget with current user S/I inputs to get the resulting cashflow
    const currentBudgetResult = calculator.calculateBudget(
        calculator.annualIncome,
        livingExpenses,
        calculator.includeRetirement,
        userSavingsPct, // Pass current user S/I values
        userInvestmentsPct
    );

    // Determine which allocation (custom or recommended) to use for the cashflow display
    let currentCashflowAllocation;
    if (currentBudgetResult.custom_allocations) { // If custom allocation was successfully generated
        currentCashflowAllocation = currentBudgetResult.custom_allocations;
    } else { // Fallback to recommended allocation
        currentCashflowAllocation = currentBudgetResult.recommended_allocations;
    }

    const cashflowAmount = currentCashflowAllocation.monthly_cashflow;
    const cashflowPct = (cashflowAmount / monthlyDisposable) * 100 || 0;
    cashflowAmountInput.value = `$${cashflowAmount.toFixed(2)} (${cashflowPct.toFixed(1)}%)`;


    // Enable/disable savings/investments section and update guidance based on zone
    if (calculator.annualIncome > 0 && monthlyDisposable > 0) { // Only enable if income is valid
        savingsInvestmentsSection.classList.remove('opacity-50', 'pointer-events-none');
        if (savingsAllowed) {
            savingsPercentageInput.disabled = false;
        } else {
            savingsPercentageInput.disabled = true;
            savingsPercentageInput.value = ''; // Clear input if disabled
            savingsPercentageError.textContent = '';
        }
        if (investmentsAllowed) {
            investmentsPercentageInput.disabled = false;
        } else {
            investmentsPercentageInput.disabled = true;
            investmentsPercentageInput.value = ''; // Clear input if disabled
            investmentsPercentageError.textContent = '';
        }

        if (zone === "GREEN") {
            siGuidanceP.innerHTML = "As you are in the <strong class='green-status-text'>Green Zone</strong>, you can set custom percentages for savings (10-15%) and investments (10-20%). Leave blank to use our recommendations.<br>We will ensure your 10% cash flow target is met regardless of your inputs.";
        } else if (zone === "MODERATE") {
            siGuidanceP.innerHTML = "You are in the <strong class='moderate-status-text'>Moderate Zone</strong>. You can set custom savings (10-15%), but investments are restricted due to current spending levels.<br>Focus on maintaining cashflow and optimizing expenses.";
        } else { // RED Zone
            siGuidanceP.innerHTML = "You are in the <strong class='red-status-text'>Red Zone</strong>. Both savings and investments are restricted due to high spending.<br>Urgent action is needed to free up funds and prioritize cashflow!";
        }
    } else { // If no valid income, keep S/I section disabled
        savingsInvestmentsSection.classList.add('opacity-50', 'pointer-events-none');
        savingsPercentageInput.disabled = true;
        investmentsPercentageInput.disabled = true;
        savingsPercentageInput.value = '';
        investmentsPercentageInput.value = '';
        savingsPercentageError.textContent = '';
        siGuidanceP.textContent = "Please enter your annual income to unlock financial allocation goals.";
    }

    // Always trigger final summary update, it handles visibility
    updateFinalSummaryDisplay();
}

function updateFinalSummaryDisplay() {
    // Only show summary if annual income is valid and disposable income is positive
    if (calculator.annualIncome <= 0 || calculator.monthlyDisposableIncome <= 0) {
        finalSummarySection.classList.add('hidden');
        return;
    }

    const userSavingsPct = savingsPercentageInput.value === '' ? null : parseFloat(savingsPercentageInput.value);
    const userInvestmentsPct = investmentsPercentageInput.value === '' ? null : parseFloat(investmentsPercentageInput.value);

    const result = calculator.calculateBudget(
        calculator.annualIncome,
        livingExpenses,
        calculator.includeRetirement,
        userSavingsPct,
        userInvestmentsPct
    );

    let htmlContent = ``; // Start with empty content

    // --- Allocations Section (Side-by-Side or Cashflow Focus) ---
    // This section only appears if savings OR investments are allowed in the current zone
    if (result.savings_allowed || result.investments_allowed) {
        let recommendedHtml = '';
        let customHtml = '';

        // Recommended Allocation Content
        const recAlloc = result.recommended_allocations;
        const recSavingsPct = (recAlloc.monthly_savings / result.monthly_disposable) * 100;
        const recInvestmentsPct = (recAlloc.monthly_investments / result.monthly_disposable) * 100;
        const recCashflowPct = (recAlloc.monthly_cashflow / result.monthly_disposable) * 100;

        recommendedHtml = `
            <div class="allocation-box">
                <h4 class="text-base font-semibold text-gray-800 mb-2">Our Recommended Allocation:</h4>
                ${result.savings_allowed ? `<p class="mb-1"><strong>Savings (${recSavingsPct.toFixed(1)}%):</strong> $${recAlloc.monthly_savings.toFixed(2)}</p>` : '<p class="mb-1 text-gray-500">Savings: <span class="red-status-text">N/A (Restricted)</span></p>'}
                ${result.investments_allowed ? `<p class="mb-1"><strong>Investments (${recInvestmentsPct.toFixed(1)}%):</strong> $${recAlloc.monthly_investments.toFixed(2)}</p>` : '<p class="mb-1 text-gray-500">Investments: <span class="red-status-text">N/A (Restricted)</span></p>'}
                <p class="mb-3"><strong>Cashflow Buffer (${recCashflowPct.toFixed(1)}%):</strong> $${recAlloc.monthly_cashflow.toFixed(2)}</p>
                ${recAlloc.has_adequate_cashflow ?
            `<p class="text-green-700 text-sm">✅ Adequate cashflow maintained (min: $${recAlloc.min_cashflow_amount.toFixed(2)})</p>` :
            `<p class="text-red-700 text-sm">❌ Inadequate cashflow! Min needed: $${recAlloc.min_cashflow_amount.toFixed(2)}</p>`
        }
            </div>
        `;

        // Custom Allocation Content (if applicable)
        if (result.custom_allocations) {
            const customAlloc = result.custom_allocations;
            const customSavingsPct = (customAlloc.monthly_savings / result.monthly_disposable) * 100;
            const customInvestmentsPct = (customAlloc.monthly_investments / result.monthly_disposable) * 100;
            const customCashflowPct = (customAlloc.monthly_cashflow / result.monthly_disposable) * 100;

            customHtml = `
                <div class="allocation-box">
                    <h4 class="text-base font-semibold text-gray-800 mb-2">Your Custom Allocation Strategy:</h4>
                    ${result.savings_allowed && customAlloc.monthly_savings > 0 ? `<p class="mb-1"><strong>Savings (${customSavingsPct.toFixed(1)}%):</strong> $${customAlloc.monthly_savings.toFixed(2)}</p>` : '<p class="mb-1 text-gray-500">Savings: <span class="red-status-text">N/A (Restricted or Zero)</span></p>'}
                    ${result.investments_allowed && customAlloc.monthly_investments > 0 ? `<p class="mb-1"><strong>Investments (${customInvestmentsPct.toFixed(1)}%):</strong> $${customAlloc.monthly_investments.toFixed(2)}</p>` : '<p class="mb-1 text-gray-500">Investments: <span class="red-status-text">N/A (Restricted or Zero)</span></p>'}
                    <p class="mb-3"><strong>Cashflow Buffer (${customCashflowPct.toFixed(1)}%):</strong> $${customAlloc.monthly_cashflow.toFixed(2)}</p>
                    ${customAlloc.has_adequate_cashflow ?
                `<p class="text-green-700 text-sm">✅ Your strategy maintains adequate cashflow (min: $${customAlloc.min_cashflow_amount.toFixed(2)}).</p>` :
                `<p class="text-red-700 text-sm">❌ Your strategy results in inadequate cashflow!</p>`
            }
                </div>
            `;
        } else if (result.budget_zone === "GREEN") { // If in GREEN but no custom input (or invalid), show a message
            customHtml = `
                <div class="allocation-box">
                    <h4 class="text-base font-semibold text-gray-800 mb-2">Your Custom Allocation Strategy:</h4>
                    <p class="text-gray-600 text-sm">Enter your desired percentages above to see your custom allocation strategy.</p>
                </div>
             `;
        }


        htmlContent += `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                ${recommendedHtml}
                ${customHtml}
            </div>
        `;
    } else { // Neither savings nor investments allowed (RED Zone)
        const currentZoneResult = calculator.calculateBudget(calculator.annualIncome, livingExpenses, calculator.includeRetirement, 0, 0); // Get result without S/I
        const remainingAfterExpenses = currentZoneResult.monthly_disposable - currentZoneResult.total_monthly_expenses;
        const cashflowPct = (remainingAfterExpenses / currentZoneResult.monthly_disposable) * 100;

        htmlContent += `
            <div class="border-t pt-4 mt-4">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Cashflow Allocation:</h3>
                <p class="mb-3">All remaining funds go to Cashflow (${cashflowPct.toFixed(1)}% of disposable): <strong>$${remainingAfterExpenses.toFixed(2)}</strong></p>
                <p class="red-status-text text-base">💡 Focus on reducing your monthly living expenses to unlock savings and investment opportunities!</p>
            </div>
        `;
    }

    finalSummaryContentDiv.innerHTML = htmlContent;
    finalSummarySection.classList.remove('hidden');
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    createExpenseInputs();
});