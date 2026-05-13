function formatMoney(value) {
  const amount = Number(value) || 0;
  return `$${amount.toFixed(2)}`;
}

function parseMoney(value) {
  return parseFloat(String(value || '').replace(/[^0-9.-]/g, '')) || 0;
}

function readNumber(id, fallback = 0) {
  const field = document.getElementById(id);
  const raw = field?.value ?? localStorage.getItem(id) ?? '';
  const value = parseFloat(String(raw).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(value) ? value : fallback;
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
  const quantityOptions = [...Array(21).keys()].slice(1).map((n) => `<option value="${n}">${n}</option>`).join('');
  const itemOptions = SUPPLY_ITEM_OPTIONS.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');

  return `
    <label>
      Item
      <select class="item-select">
        ${itemOptions}
      </select>
    </label>

    <label>
      Custom Item
      <input type="text" class="custom-item hidden" placeholder="Custom Item">
    </label>

    <label>
      Quantity used
      <select class="quantity">
        ${quantityOptions}
      </select>
    </label>

    <label>
      Cost each
      <input type="text" class="cost-each" inputmode="decimal" placeholder="0.00">
    </label>

    <label>
      Total cost
      <input type="text" class="total-cost" placeholder="$0.00" readonly>
    </label>

    <button type="button" class="remove-row-btn" aria-label="Remove supply line">Remove line</button>
  `;
}

function updateTotals() {
  const itemRows = document.querySelectorAll('.item-row');
  let batchCost = 0;

  itemRows.forEach((row) => {
    const qty = parseFloat(row.querySelector('.quantity')?.value) || 0;
    const costEach = parseMoney(row.querySelector('.cost-each')?.value);
    const total = qty * costEach;
    const totalField = row.querySelector('.total-cost');
    if (totalField) {
      totalField.value = formatMoney(total);
    }
    batchCost += total;
  });

  const cupsMade = Math.max(readNumber('cupsMade', 1), 1);
  const pricePerCup = Math.max(readNumber('pricePerCup', 0), 0);
  const cupsSold = Math.max(readNumber('cupsSold', 0), 0);
  const costPerCup = batchCost / cupsMade;
  const profitPerCup = pricePerCup - costPerCup;
  const totalIncome = pricePerCup * cupsSold;
  const totalProfit = profitPerCup * cupsSold;

  setOutputValue('batchCostReadout', formatMoney(batchCost));
  setOutputValue('costPerCupReadout', formatMoney(costPerCup));
  setOutputValue('pricePerCupReadout', formatMoney(pricePerCup));
  setOutputValue('totalIncomeReadout', formatMoney(totalIncome));
  setOutputValue('finalProfitReadout', formatMoney(totalProfit));
  setOutputValue('profitPerCup', formatMoney(profitPerCup));
  setOutputValue('finalProfit', formatMoney(totalProfit));
  setOutputValue('totalIncome', formatMoney(totalIncome));
  setOutputValue('totalExpenses', formatMoney(batchCost));
  setOutputValue('finalSuppliesCost', formatMoney(batchCost));

  const formulaField = document.getElementById('calculatorFormula');
  if (formulaField) {
    formulaField.innerHTML = `Cost per cup = <strong>${formatMoney(batchCost)}</strong> batch cost &divide; <strong>${cupsMade} cups made</strong><br>Profit per cup = <strong>${formatMoney(pricePerCup)}</strong> price - <strong>${formatMoney(costPerCup)}</strong> cost = <strong>${formatMoney(profitPerCup)}</strong>`;
  }

  localStorage.setItem('batchCost', formatMoney(batchCost));
  localStorage.setItem('costPerCup', formatMoney(costPerCup));
  localStorage.setItem('profitPerCup', formatMoney(profitPerCup));
  localStorage.setItem('totalExpenses', formatMoney(batchCost));
  localStorage.setItem('finalSuppliesCost', formatMoney(batchCost));
  localStorage.setItem('cupsMade', String(cupsMade));
  localStorage.setItem('cupsSold', String(cupsSold));
  localStorage.setItem('pricePerCup', String(document.getElementById('pricePerCup')?.value || ''));
  localStorage.setItem('totalIncome', formatMoney(totalIncome));
  localStorage.setItem('finalProfit', formatMoney(totalProfit));

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

  const addItemBtn = document.getElementById('addItem');
  if (addItemBtn) {
    addItemBtn.addEventListener('click', () => {
      const container = document.createElement('div');
      container.className = 'item-row';
      container.innerHTML = buildSupplyRowHTML();
      document.getElementById('supplyContainer').appendChild(container);
      attachListeners(container);
    });
  }

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

  // Attach listeners to initial rows
  document.querySelectorAll('.item-row').forEach(attachListeners);
  
  document.querySelectorAll('.quantity, .cost-each').forEach(el => {
    el.addEventListener('input', updateTotals);
    el.addEventListener('change', updateTotals);
  });

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

  let restored = false;
  ['cupsMade', 'cupsSold', 'pricePerCup', 'totalExpenses', 'totalIncome', 'finalProfit', 'finalSuppliesCost'].forEach(id => {
    const field = document.getElementById(id);
    const saved = localStorage.getItem(id);
    if (field && saved !== null) {
      field.value = saved;
      restored = true;
    }
  });

  const savedRows = JSON.parse(localStorage.getItem('supplyRows') || '[]');
  savedRows.filter(data =>
    data.item || data.customItem || data.quantity || data.costEach
  ).forEach(data => {
    const container = document.createElement('div');
    container.className = 'item-row';
    container.innerHTML = buildSupplyRowHTML();
    supplyContainer.appendChild(container);
    attachListeners(container);
    container.querySelector('.item-select').value = data.item;
    container.querySelector('.custom-item').value = data.customItem;
    container.querySelector('.custom-item').classList.toggle('hidden', data.item !== 'Other');
    container.querySelector('.quantity').value = data.quantity;
    container.querySelector('.cost-each').value = data.costEach;
    container.querySelector('.total-cost').value = data.totalCost;
  });

  if (restored) updateTotals();

  // Keep one starter row visible; only clear empty restored rows when there is more than one
  const renderedRows = Array.from(document.querySelectorAll('.item-row'));
  if (renderedRows.length > 1) {
    renderedRows.forEach(row => {
      const costEach = parseFloat(row.querySelector('.cost-each')?.value.replace(/[^0-9.]/g, '')) || 0;
      if (costEach === 0) {
        row.remove();
      }
    });
  }
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
  row.querySelector('.quantity').addEventListener('change', updateTotals);
  row.querySelector('.cost-each').addEventListener('input', updateTotals);

  const removeBtn = row.querySelector('.remove-row-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      const rows = document.querySelectorAll('.item-row');
      if (rows.length > 1) {
        row.remove();
        updateTotals();
      } else {
        row.querySelector('.item-select').value = 'Lemons';
        row.querySelector('.custom-item').value = '';
        row.querySelector('.custom-item').classList.add('hidden');
        row.querySelector('.quantity').value = '1';
        row.querySelector('.cost-each').value = '';
        row.querySelector('.total-cost').value = '$0.00';
        updateTotals();
      }
    });
  }

  const select = row.querySelector('.item-select');
  const customInput = row.querySelector('.custom-item');

  if (select && customInput) {
    select.addEventListener('change', () => {
      if (select.value === 'Other') {
        customInput.classList.remove('hidden');
      } else {
        customInput.classList.add('hidden');
        customInput.value = '';
      }
    });
  }
}

function downloadReport() {
  const batchCost = document.getElementById('batchCostReadout')?.textContent || '';
  const costPerCup = document.getElementById('costPerCupReadout')?.textContent || '';
  const pricePerCup = document.getElementById('pricePerCup')?.value || '';
  const cupsSold = document.getElementById('cupsSold')?.value || '';
  const cupsMade = document.getElementById('cupsMade')?.value || '';
  const totalIncome = document.getElementById('totalIncomeReadout')?.textContent || '';
  const profitPerCup = document.getElementById('profitPerCup')?.value || '';
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
