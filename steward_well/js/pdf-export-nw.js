/* --------------------------------------------------
   PDF Export  –  Networth & Investment Report
   With Mailchimp email collection
   -------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("print-download-btn");

  // Email modal elements
  const emailModal = document.getElementById("email-modal");
  const emailModalBackdrop = document.getElementById("email-modal-backdrop");
  const userEmailInput = document.getElementById("user-email-input");
  const emailErrorMsg = document.getElementById("email-error-msg");
  const submitEmailBtn = document.getElementById("submit-email-btn");
  const cancelEmailBtn = document.getElementById("cancel-email-btn");
  const loadingOverlay = document.getElementById("capture-loading");

  function showEmailModal() {
    if (emailModal) {
      emailModal.classList.remove("hidden");
      if (userEmailInput) {
        userEmailInput.value = "";
        userEmailInput.focus();
      }
    }
  }

  function hideEmailModal() {
    if (emailModal) emailModal.classList.add("hidden");
    if (emailErrorMsg) emailErrorMsg.classList.add("hidden");
  }

  function showLoading() {
    if (loadingOverlay) loadingOverlay.classList.remove("hidden");
  }

  function hideLoading() {
    if (loadingOverlay) loadingOverlay.classList.add("hidden");
  }

  async function submitToMailchimp(email) {
    const actionUrl =
      "https://stewardwellcapital.us14.list-manage.com/subscribe/post?u=060d01fcccabd39539e51f425&id=f1650c082d&f_id=009a5de1f0";

    try {
      const formData = new FormData();
      formData.append("EMAIL", email);
      formData.append("FNAME", "Subscriber");
      formData.append("LNAME", "Friend");
      formData.append("CALCULATOR", "Networth");
      formData.append("tags", "7016281");
      formData.append("b_060d01fcccabd39539e51f425_f1650c082d", "");
      formData.append("subscribe", "Subscribe");

      await fetch(actionUrl, {
        method: "POST",
        body: formData,
        mode: "no-cors",
      });
      return true;
    } catch (error) {
      console.error("Mailchimp submission error:", error);
      return false;
    }
  }

  // Print button → show email modal
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showEmailModal();
    });
  }

  // Cancel / backdrop → hide modal
  if (cancelEmailBtn) cancelEmailBtn.addEventListener("click", hideEmailModal);
  if (emailModalBackdrop)
    emailModalBackdrop.addEventListener("click", hideEmailModal);

  // Submit email → Mailchimp → PDF download
  if (submitEmailBtn) {
    submitEmailBtn.addEventListener("click", async () => {
      if (!userEmailInput) return;

      const email = userEmailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email || !emailRegex.test(email)) {
        if (emailErrorMsg) {
          emailErrorMsg.classList.remove("hidden");
          emailErrorMsg.textContent = "Please enter a valid email address.";
        }
        return;
      }

      if (emailErrorMsg) emailErrorMsg.classList.add("hidden");

      const originalText = submitEmailBtn.textContent;
      submitEmailBtn.textContent = "Processing...";
      submitEmailBtn.disabled = true;

      try {
        await submitToMailchimp(email);
      } catch (error) {
        console.error("Mailchimp error:", error);
      } finally {
        submitEmailBtn.textContent = originalText;
        submitEmailBtn.disabled = false;
        hideEmailModal();
        showLoading();
        try {
          await generateNetworthReport();
        } finally {
          hideLoading();
        }
      }
    });
  }
});

async function generateNetworthReport() {
  const lib = window.jspdf || {};
  const PDF = lib.jsPDF;
  if (!PDF) {
    alert("PDF library not loaded.");
    return;
  }

  const doc = new PDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const marginX = 48;
  const headerH = 64;
  const topY = headerH + 36;
  const bottomMargin = 60;
  const lineH = 18;
  let y = topY;
  const green = { r: 23, g: 127, b: 91 };
  const blue = { r: 21, g: 77, b: 128 };

  function drawHeader(title) {
    const steps = 10;
    const stepW = pageW / steps;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      doc.setFillColor(
        Math.round(green.r + (blue.r - green.r) * t),
        Math.round(green.g + (blue.g - green.g) * t),
        Math.round(green.b + (blue.b - green.b) * t),
      );
      doc.rect(i * stepW, 0, stepW + 1, headerH, "F");
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Steward Well Capital — " + title, marginX, 36);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Generated: " + new Date().toLocaleString(), marginX, 54);
    doc.setTextColor(0, 0, 0);
  }

  function ensureSpace(lines) {
    if (y + lines * lineH > pageH - bottomMargin) {
      doc.addPage();
      y = topY;
    }
  }

  function sectionTitle(text) {
    ensureSpace(3);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(green.r, green.g, green.b);
    doc.text(text, marginX, y);
    y += 6;
    doc.setDrawColor(green.r, green.g, green.b);
    doc.setLineWidth(0.5);
    doc.line(marginX, y, pageW - marginX, y);
    y += lineH;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  }

  function row(label, value, bold) {
    ensureSpace(1);
    if (bold) doc.setFont("helvetica", "bold");
    doc.text(label, marginX + 8, y);
    doc.text(value, pageW - marginX - 8, y, { align: "right" });
    if (bold) doc.setFont("helvetica", "normal");
    y += lineH;
  }

  function fmt(v) {
    return (
      "$" +
      (parseFloat(v) || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  function getVal(id) {
    return parseFloat(document.getElementById(id)?.value) || 0;
  }
  function getText(id) {
    return document.getElementById(id)?.textContent?.trim() || "";
  }

  // ========== Page 1: Networth Summary ==========
  drawHeader("Networth & Investment Report");

  sectionTitle("Assets");
  const assetItems = [
    ["Registered Retirement Savings", getVal("registered-retirement")],
    ["TFSA Accounts", getVal("tfsa-accounts")],
    ["Non-Registered Investments", getVal("non-registered-investments")],
    ["Home Value", getVal("home-value")],
    ["Other Properties", getVal("other-properties")],
    ["Other Valuables", getVal("other-valuables")],
  ];
  let totalAssets = 0;
  assetItems.forEach(([label, val]) => {
    totalAssets += val;
    row(label, fmt(val));
  });
  y += 4;
  row("Total Assets", fmt(totalAssets), true);
  y += 10;

  sectionTitle("Liabilities");
  const liabItems = [
    ["Home Mortgage", getVal("home-mortgage")],
    ["Other Mortgages", getVal("other-mortgages")],
    ["Credit Cards", getVal("credit-cards")],
    ["Lines of Credit", getVal("lines-of-credit")],
    ["Loans", getVal("loans")],
    ["Other Liabilities", getVal("other-liabilities")],
  ];
  let totalLiab = 0;
  liabItems.forEach(([label, val]) => {
    totalLiab += val;
    row(label, fmt(val));
  });
  y += 4;
  row("Total Liabilities", fmt(totalLiab), true);
  y += 10;

  // Networth
  ensureSpace(2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  const nw = totalAssets - totalLiab;
  doc.setTextColor(
    nw >= 0 ? green.r : 200,
    nw >= 0 ? green.g : 0,
    nw >= 0 ? green.b : 0,
  );
  doc.text("Net Worth: " + fmt(nw), marginX, y);
  doc.setTextColor(0, 0, 0);
  y += lineH * 2;

  // ========== Investment Projection ==========
  sectionTitle("Investment Projection");

  const startAmt = getVal("investment-starting-amount");
  const returnRate = getVal("investment-return-rate");
  const contribution = getVal("investment-contribution");
  const yearsText = getText("yearsDropdownSelected");
  const compoundText = getText("compoundDropdownSelected");
  const freqText = getText("calculateDropdownSelected");

  row("Starting Amount", fmt(startAmt));
  row("Rate of Return", returnRate + "%");
  row("Additional Contribution", fmt(contribution));
  row("Investment Period", yearsText);
  row("Compound", compoundText);
  row("Frequency", freqText);
  y += 8;

  // Results from sidebar
  row("Starting Amount", getText("inv-starting"), false);
  row("Interest Earned", getText("inv-interest"), false);
  row("Total Contributions", getText("inv-contrib"), false);
  y += 4;
  row("Ending Balance", getText("inv-total"), true);

  // ========== Capture chart as image ==========
  const canvas = document.getElementById("investmentChart");
  if (canvas) {
    try {
      ensureSpace(14);
      const imgData = canvas.toDataURL("image/png");
      const chartW = pageW - marginX * 2;
      const chartH = chartW * 0.5;
      doc.addImage(imgData, "PNG", marginX, y, chartW, chartH);
      y += chartH + 16;
    } catch (e) {
      // Chart not available or tainted canvas
    }
  }

  // ========== Footer ==========
  ensureSpace(2);
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    "This report is for informational purposes only and does not constitute financial advice.",
    marginX,
    pageH - 30,
  );
  doc.text(
    "© " + new Date().getFullYear() + " Steward Well Capital",
    marginX,
    pageH - 18,
  );

  // Save
  const ts = new Date().toISOString().slice(0, 10);
  doc.save("StewardWell-Report-" + ts + ".pdf");
}
