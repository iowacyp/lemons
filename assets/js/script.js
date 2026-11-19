function formatMoney(value) {
  const amount = Number(value) || 0;
  return `${amount < 0 ? "-" : ""}$${Math.abs(amount).toFixed(2)}`;
}

function parseMoney(value) {
  return parseFloat(String(value || '').replace(/[^0-9.-]/g, '')) || 0;
}

function setOutputValue(id, value) {
  const field = document.getElementById(id);
  if (!field) return;
  if ('value' in field) {
    field.value = value;
  } else {
    field.textContent = value;
  }
}

const SUPPLY_ITEM_OPTIONS = [
  ['Lemons', 'Lemons (each)'],
  ['Lemonade Mix', 'Lemonade Mix (powdered)'],
  ['Sugar', 'Sugar (5 lb bag)'],
  ['Cups', 'Cups (pk)'],
  ['Ice', 'Ice (bag)'],
  ['Water', 'Water'],
  ['Mint/Fruit', 'Mint or Fruit'],
  ['Napkins', 'Napkins'],
  ['Stirrer/Spoon', 'Stirrer/Spoon'],
  ['Other', 'Other (type below)']
];

function buildSupplyRowHTML() {
  const itemOptions = SUPPLY_ITEM_OPTIONS.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');

  return `
    <label>
      Item
      <select class="item-select">
        ${itemOptions}
      </select>
    </label>

    <label hidden>
      Item name
      <input type="text" class="custom-item" placeholder="e.g. Strawberries">
    </label>

    <label>
      Quantity used
      <input class="quantity" type="number" min="1" step="1" inputmode="numeric" value="1">
    </label>

    <label>
      Cost each ($)
      <input type="text" class="cost-each" inputmode="decimal" placeholder="0.00">
    </label>

    <label>
      Total cost
      <input type="text" class="total-cost" placeholder="$0.00" readonly>
    </label>

    <button type="button" class="remove-row-btn" aria-label="Remove supply line">Remove line</button>
  `;
}

function addSupplyRow(container, data = {}) {
  const row = document.createElement('div');
  row.className = 'item-row';
  row.innerHTML = buildSupplyRowHTML();
  const select = row.querySelector('.item-select');
  const item = data.item || 'Other';
  if (!Array.from(select.options).some(option => option.value === item)) {
    select.add(new Option(item, item));
  }
  select.value = item;
  const customItem = row.querySelector('.custom-item');
  customItem.value = data.customItem || '';
  customItem.closest('label').hidden = item !== 'Other';
  row.querySelector('.quantity').value = data.quantity || '1';
  row.querySelector('.cost-each').value = data.costEach || '';
  container.append(row);
  attachListeners(row);
  return row;
}

function renderBatchBreakdown(entries, total) {
  const bar = document.getElementById('batchShareBar');
  const legend = document.getElementById('batchShareLegend');
  const empty = document.getElementById('batchBreakdownEmpty');
  if (!bar || !legend || !empty) return;
  const visible = total > 0;
  bar.hidden = !visible;
  legend.hidden = !visible;
  empty.hidden = visible;
  bar.replaceChildren();
  legend.replaceChildren();
  entries.filter(entry => entry.amount > 0).forEach(({ name, amount }, index) => {
    const segment = document.createElement('span');
    segment.style.flexBasis = `${100 * amount / total}%`;
    const item = document.createElement('li');
    const swatch = document.createElement('span');
    swatch.setAttribute('aria-hidden', 'true');
    const color = ['#287452', '#f0bd37', '#b75841', '#426c99', '#8a67a8', '#46787c'][index % 6];
    segment.style.backgroundColor = color;
    swatch.style.backgroundColor = color;
    const label = document.createElement('span');
    label.textContent = name;
    const value = document.createElement('strong');
    value.textContent = formatMoney(amount);
    item.append(swatch, label, value);
    legend.append(item);
    bar.append(segment);
  });
  setOutputValue('ingredientTotal', formatMoney(total));
}

function updateTotals({ persist = true } = {}) {
  const itemRows = Array.from(document.querySelectorAll('.item-row'));
  const entries = itemRows.map(row => {
    const quantity = row.querySelector('.quantity');
    const cost = row.querySelector('.cost-each').value.trim();
    const hasCost = /^\$?\d*\.?\d+$/.test(cost) && Number.isFinite(parseFloat(cost.replace('$', '')));
    const hasAmount = quantity.validity.valid && Number(quantity.value) > 0 && hasCost;
    const amount = hasAmount ? Math.round(Number(quantity.value) * parseMoney(cost) * 100) / 100 : 0;
    const item = row.querySelector('.item-select').value;
    const name = item === 'Other' ? row.querySelector('.custom-item').value.trim() || 'Other' : item;
    row.querySelector('.total-cost').value = hasAmount ? formatMoney(amount) : '—';
    return { name, amount, hasAmount };
  });
  let batchCost = entries.reduce((sum, entry) => sum + entry.amount, 0);

  const fields = Object.fromEntries(['batchCostInput', 'cupsMade', 'pricePerCup', 'cupsSold']
    .map(id => [id, document.getElementById(id)]));
  if (!fields.batchCostInput) return;
  const hasValue = field => field.value !== '' && field.validity.valid;
  const hasSupplyCost = entries.some(entry => entry.hasAmount);
  const hasManualCost = hasValue(fields.batchCostInput);
  const hasBatchCost = hasManualCost || (fields.batchCostInput.validity.valid && !fields.batchCostInput.value && hasSupplyCost);
  renderBatchBreakdown(entries, batchCost);
  const override = document.getElementById('batchOverride');
  if (override) override.hidden = !hasManualCost || !hasSupplyCost || document.body.hasAttribute('data-pricing-example');
  if (hasManualCost) batchCost = Number(fields.batchCostInput.value);
  const ready = hasBatchCost && hasValue(fields.cupsMade) && hasValue(fields.pricePerCup);
  const cupsMade = Number(fields.cupsMade.value);
  const pricePerCup = Number(fields.pricePerCup.value);
  const cupsSold = fields.cupsSold.value === '' ? cupsMade : Number(fields.cupsSold.value);
  const validSales = ready && fields.cupsSold.validity.valid && cupsSold <= cupsMade;
  const costPerCup = ready ? batchCost / cupsMade : 0;
  const profitPerCup = pricePerCup - costPerCup;
  const totalIncome = pricePerCup * cupsSold;
  const totalProfit = totalIncome - batchCost;
  const show = (value, available) => available ? formatMoney(value) : '—';

  setOutputValue('batchCostReadout', show(batchCost, hasBatchCost));
  setOutputValue('pricingCostLabel', show(costPerCup, ready));
  setOutputValue('totalIncomeReadout', show(totalIncome, validSales));
  setOutputValue('finalProfitReadout', show(totalProfit, validSales));
  setOutputValue('pricingProfitLabel', show(profitPerCup, ready));

  const formulaField = document.getElementById('calculatorFormula');
  if (formulaField) {
    const outcome = profitPerCup < 0 ? 'lose' : 'earn';
    formulaField.textContent = ready
      ? `You spend ${formatMoney(costPerCup)} to make a cup. At ${formatMoney(pricePerCup)}, you ${outcome} ${formatMoney(Math.abs(profitPerCup))} per cup.`
      : 'Enter your batch cost, cups made, and price per cup to see what each cup earns.';
    if (ready && !validSales) {
      formulaField.textContent += ' Enter a whole number of expected sales up to the number of cups made.';
    }
  }

  const chart = document.getElementById('pricingChart');
  if (chart) {
    document.getElementById('pricingChartDetails').hidden = !ready;
    setOutputValue('pricingChartExplanation', 'Enter your numbers or try the example to see what each cup earns.');
    if (ready) {
      const scale = Math.max(costPerCup, pricePerCup, 0.01);
      const setBar = (id, amount) => {
        document.getElementById(id).style.width = `${100 * amount / scale}%`;
      };
      setBar('pricingCostBar', costPerCup);
      setBar('pricingCoveredBar', Math.min(costPerCup, pricePerCup));
      setBar('pricingProfitBar', Math.max(0, profitPerCup));
      setOutputValue('pricingPriceLabel', formatMoney(pricePerCup));
      const breakEven = formatMoney(Math.ceil((costPerCup - 1e-10) * 100) / 100);
      const outcome = profitPerCup >= 0
        ? `The green part shows the ${formatMoney(profitPerCup)} you keep per cup.`
        : `The price falls short by ${formatMoney(-profitPerCup)} per cup.`;
      setOutputValue('pricingChartExplanation', `Each cup costs ${formatMoney(costPerCup)} to make and sells for ${formatMoney(pricePerCup)}. ${outcome} Charge at least ${breakEven} to cover the cost of one cup.`);
      const lower = document.getElementById('pricingLower');
      lower.setAttribute('aria-disabled', String(pricePerCup < 0.25));
    }
  }

  const batchChart = document.getElementById('batchChart');
  if (batchChart) {
    batchChart.hidden = !validSales;
    if (validSales) {
      const scale = Math.max(batchCost, totalIncome, 0.01);
      document.getElementById('batchCostBar').style.width = `${100 * batchCost / scale}%`;
      document.getElementById('batchSalesBar').style.width = `${100 * totalIncome / scale}%`;
      setOutputValue('batchCostLabel', formatMoney(batchCost));
    }
  }

  if (!persist || document.body.hasAttribute('data-pricing-example')) return;
  Object.entries(fields).forEach(([id, field]) => localStorage.setItem(id, field.value));
  localStorage.setItem('pricingPlanComplete', String(validSales));
  const totals = {
    batchCost: [batchCost, hasBatchCost],
    costPerCup: [costPerCup, ready],
    profitPerCup: [profitPerCup, ready],
    totalExpenses: [batchCost, hasBatchCost],
    finalSuppliesCost: [batchCost, hasBatchCost],
    totalIncome: [totalIncome, validSales],
    finalProfit: [totalProfit, validSales]
  };
  Object.entries(totals).forEach(([id, [value, available]]) => {
    localStorage.setItem(id, available ? formatMoney(value) : '');
  });

  const supplyData = [];
  itemRows.forEach((row) => {
    supplyData.push({
      item: row.querySelector('.item-select')?.value || '',
      customItem: row.querySelector('.custom-item')?.value || '',
      quantity: row.querySelector('.quantity')?.value || '',
      costEach: row.querySelector('.cost-each')?.value || '',
      totalCost: row.querySelector('.total-cost')?.value || ''
    });
  });
  localStorage.setItem('supplyRows', JSON.stringify(supplyData));
}

document.addEventListener("DOMContentLoaded", () => {
  const supplyContainer = document.getElementById('supplyContainer');

  const batchCostInput = document.getElementById('batchCostInput');
  batchCostInput?.addEventListener('input', updateTotals);

  document.querySelectorAll('[data-supply], #addItem').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.dataset.supply || 'Other';
      const existing = item === 'Other' ? null : Array.from(supplyContainer.children)
        .find(row => row.querySelector('.item-select').value === item);
      const row = existing || addSupplyRow(supplyContainer, { item });
      row.querySelector(item === 'Other' ? '.custom-item' : '.cost-each').focus();
      updateTotals();
    });
  });
  document.getElementById('useIngredientTotal')?.addEventListener('click', () => {
    batchCostInput.value = '';
    updateTotals();
    document.getElementById('pricingTitle').scrollIntoView({ block: 'start' });
    batchCostInput.focus({ preventScroll: true });
  });

  const cupsMadeField = document.getElementById('cupsMade');
  if (cupsMadeField) {
    cupsMadeField.addEventListener('input', updateTotals);
    cupsMadeField.addEventListener('change', updateTotals);
  }

  const cupsSold = document.getElementById('cupsSold');
  if (cupsSold) {
    cupsSold.addEventListener('input', updateTotals);
    cupsSold.addEventListener('change', updateTotals);
  }

  const pricePerCupField = document.getElementById('pricePerCup');
  if (pricePerCupField) {
    pricePerCupField.addEventListener('input', updateTotals);
    pricePerCupField.addEventListener('change', updateTotals);
  }

  const downloadButton = document.getElementById('downloadReport');
  if (downloadButton) {
    downloadButton.addEventListener('click', downloadReport);
  }

  const clearCacheBtn = document.getElementById('clearCache');
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', () => {
      localStorage.clear();
      document.querySelectorAll('.item-row').forEach(row => row.remove());
      updateTotals();
    });
  }

  if (!supplyContainer) return;
  let savedRows = [];
  try {
    const rows = JSON.parse(localStorage.getItem('supplyRows') || '[]');
    if (Array.isArray(rows)) savedRows = rows.filter(Boolean);
  } catch {
    // An unreadable supply list should not block the calculator.
  }
  savedRows.filter(data => data.item || data.customItem || data.quantity || data.costEach)
    .forEach(data => addSupplyRow(supplyContainer, data));
});

// 1. Generate PDF from visible content (requires html2pdf library)
function generatePDFSummary(targetId = 'supplyContainer', filename = 'lemonade-summary.pdf') {
  const element = document.getElementById(targetId);
  if (!element) return;

  const opt = {
    margin:       0.5,
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}

// 2. Checklist animation on completion
function checkChecklistCompletion() {
  const checkboxes = document.querySelectorAll('#checklistContainer input[type="checkbox"]');
  if (!checkboxes.length) return;
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);

  if (allChecked) {
    document.body.classList.add('celebrate');
  } else {
    document.body.classList.remove('celebrate');
  }

  localStorage.setItem('checklistComplete', String(allChecked));
}

// 3. Attach listener to all checklist checkboxes
document.addEventListener('DOMContentLoaded', () => {
  const checklistBoxes = document.querySelectorAll('#checklistContainer input[type="checkbox"]');
  if (!checklistBoxes.length) return;
  checklistBoxes.forEach(cb => cb.addEventListener('change', checkChecklistCompletion));
  checkChecklistCompletion();
});

// 4. Open Google Drive folder for photo uploads
function goToDriveFolder() {
  window.open('https://drive.google.com/drive/folders/1kFxkIXOyD0U3c0BEAb4ED7eOpujh92zk', '_blank');
}

// 5. Final report PDF export (now generates a certificate)
function generateFinalReportPDF() {
  const doc = new jsPDF();
  const studentName = prompt("Enter your name for the certificate:");
  if (studentName && studentName.trim() !== "") {
    localStorage.setItem('studentName', studentName.trim());
  }

  doc.setFillColor(255, 249, 215);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setFontSize(22);
  doc.setTextColor(244, 180, 0);
  doc.text('🎉 Certificate of Completion 🎉', 105, 50, null, null, 'center');

  doc.setFontSize(16);
  doc.setTextColor(80, 80, 80);
  doc.text(`This certifies that`, 105, 80, null, null, 'center');

  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text(studentName || "________________", 105, 100, null, null, 'center');

  doc.setFontSize(16);
  doc.setTextColor(80, 80, 80);
  doc.text(`completed the Lemonade Boss program`, 105, 120, null, null, 'center');

  doc.setFontSize(14);
  doc.text(`and is officially a Lemonade Boss!`, 105, 135, null, null, 'center');

  doc.setFontSize(12);
  doc.text(`🏆`, 105, 155, null, null, 'center');
  doc.setFontSize(10);
  doc.text(`Presented with pride by Lemonade Boss`, 105, 180, null, null, 'center');

  doc.save('lemonade-boss-certificate.pdf');
}

/**
 * Alias for certificate creation button
 */
function generateCertificate() {
  // Call the existing PDF generation logic
  generateFinalReportPDF();
}

function attachListeners(row) {
  row.querySelector('.quantity').addEventListener('input', updateTotals);
  row.querySelector('.cost-each').addEventListener('input', updateTotals);
  const select = row.querySelector('.item-select');
  const customInput = row.querySelector('.custom-item');
  customInput.addEventListener('input', updateTotals);
  select.addEventListener('change', () => {
    customInput.closest('label').hidden = select.value !== 'Other';
    updateTotals();
  });
  row.querySelector('.remove-row-btn').addEventListener('click', () => {
    const next = row.nextElementSibling || row.previousElementSibling;
    row.remove();
    (next?.querySelector('.remove-row-btn') || document.getElementById('addItem')).focus();
    updateTotals();
  });
}

function downloadReport() {
  const batchCost = document.getElementById('batchCostInput')?.value
    ? document.getElementById('batchCostReadout').textContent
    : document.getElementById('ingredientTotal')?.textContent || '';
  const costPerCup = document.getElementById('pricingCostLabel')?.textContent || '';
  const pricePerCup = document.getElementById('pricePerCup')?.value || '';
  const cupsSold = document.getElementById('cupsSold')?.value || document.getElementById('cupsMade')?.value || '';
  const cupsMade = document.getElementById('cupsMade')?.value || '';
  const totalIncome = document.getElementById('totalIncomeReadout')?.textContent || '';
  const profitPerCup = document.getElementById('pricingProfitLabel')?.textContent || '';
  const finalProfit = document.getElementById('finalProfitReadout')?.textContent || '';

  let content = `🍋 Lemonade Cup Profit Summary 🍋\n\n`;
  content += `Batch Cost: ${batchCost}\n`;
  content += `Cups Made: ${cupsMade}\n`;
  content += `Cost Per Cup: ${costPerCup}\n`;
  content += `Price Per Cup: $${parseFloat(pricePerCup || '0').toFixed(2)}\n`;
  content += `Profit Per Cup: ${profitPerCup}\n`;
  content += `Cups Sold: ${cupsSold}\n`;
  content += `Total Sales: ${totalIncome}\n`;
  content += `Total Profit: ${finalProfit}\n`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'lemonade-stand-summary.txt';
  a.click();

  URL.revokeObjectURL(url);
}
