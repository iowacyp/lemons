(function () {
  const FIELD_IDS = ["borrower", "lender", "amount", "purpose", "plan", "interest", "deadline"];
  const LEGACY_KEYS = {
    amount: ["loanAmount"],
    plan: ["repaymentPlan"]
  };

  function getStoredValue(id) {
    const value = localStorage.getItem(id);
    if (value) return value;

    const legacyKeys = LEGACY_KEYS[id] || [];
    for (const key of legacyKeys) {
      const legacyValue = localStorage.getItem(key);
      if (legacyValue) return legacyValue;
    }
    return "";
  }

  function setStoredValue(id, value) {
    localStorage.setItem(id, value);
    (LEGACY_KEYS[id] || []).forEach((key) => localStorage.setItem(key, value));
  }

  function formatMoney(value) {
    const amount = Number.parseFloat(value);
    if (!Number.isFinite(amount) || amount <= 0) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    }).format(amount);
  }

  function formatPercent(value) {
    const rate = Number.parseFloat(value);
    if (!Number.isFinite(rate)) return "0%";
    return `${rate % 1 === 0 ? rate.toFixed(0) : rate.toFixed(1)}%`;
  }

  function formatDate(value) {
    if (!value) return "Not set yet";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return "Not set yet";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(date);
  }

  function fillText(id, value, fallback) {
    const element = document.getElementById(id);
    if (element) element.textContent = value || fallback;
  }

  function updatePreview() {
    const borrower = document.getElementById("borrower").value.trim();
    const lender = document.getElementById("lender").value.trim();
    const amount = document.getElementById("amount").value;
    const purpose = document.getElementById("purpose").value.trim();
    const plan = document.getElementById("plan").value.trim();
    const interest = document.getElementById("interest").value;
    const deadline = document.getElementById("deadline").value;

    fillText("borrowerPreview", borrower, "your name");
    fillText("lenderPreview", lender, "a parent or helper");
    fillText("amountPreview", formatMoney(amount), "$0.00");
    fillText("purposePreview", purpose, "What the money will be used for");
    fillText("planPreview", plan, "How the loan will be paid back");
    fillText("interestPreview", formatPercent(interest), "0%");
    fillText("deadlinePreview", formatDate(deadline), "Not set yet");

    const statusChip = document.getElementById("loanStatusChip");
    const isReady = borrower && lender && Number.parseFloat(amount) > 0 && purpose && plan && deadline;

    if (statusChip) {
      statusChip.textContent = isReady ? "Ready to sign" : "In progress";
      statusChip.classList.toggle("complete", isReady);
    }
  }

  function bindFieldPersistence() {
    FIELD_IDS.forEach((id) => {
      const input = document.getElementById(id);
      if (!input) return;

      input.addEventListener("input", () => {
        setStoredValue(id, input.value);
        updatePreview();
      });
    });
  }

  function hydrateFields() {
    FIELD_IDS.forEach((id) => {
      const input = document.getElementById(id);
      if (!input) return;
      input.value = getStoredValue(id);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    hydrateFields();
    bindFieldPersistence();
    updatePreview();
  });
})();
