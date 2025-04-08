function updateTotals() {
  const itemRows = document.querySelectorAll('.item-row');
  let totalExpenses = 0;

  itemRows.forEach(row => {
    const qty = parseFloat(row.querySelector('.quantity')?.value) || 0;
    const costEach = parseFloat(row.querySelector('.cost-each')?.value.replace(/[^0-9.]/g, '')) || 0;
    const total = qty * costEach;
    row.querySelector('.total-cost').value = `$${total.toFixed(2)}`;
    totalExpenses += total;
  });

  const totalExpensesField = document.getElementById('totalExpenses');
  const pricePerCupField = document.getElementById('pricePerCup');
  const finalSuppliesCost = document.getElementById('finalSuppliesCost');
  const cupsSold = parseFloat(document.getElementById('cupsSold')?.value) || 0;

  totalExpensesField.value = `$${totalExpenses.toFixed(2)}`;
  finalSuppliesCost.value = `$${totalExpenses.toFixed(2)}`;

  let pricePerCup = parseFloat(pricePerCupField.value.replace(/[^0-9.]/g, '')) || 0;

  pricePerCupField.value = `$${pricePerCup.toFixed(2)}`;

  const totalIncome = pricePerCup * cupsSold;
  const totalIncomeField = document.getElementById('totalIncome');
  totalIncomeField.value = `$${totalIncome.toFixed(2)}`;

  const profitField = document.getElementById('finalProfit');
  profitField.value = `$${(totalIncome - totalExpenses).toFixed(2)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const supplyContainer = document.getElementById('supplyContainer');

  document.getElementById('addItem').addEventListener('click', () => {
    const container = document.createElement('div');
    container.className = 'item-row';
    container.innerHTML = `
      <label>
        Item
        <select class="item-select">
          <option value="Lemons">Lemons (each)</option>
          <option value="Lemonade Mix">Lemonade Mix (powdered)</option>
          <option value="Sugar">Sugar (5 lb bag)</option>
          <option value="Cups">Cups (pk)</option>
          <option value="Pitcher">Pitcher</option>
          <option value="Poster/Signs">Poster/Signs</option>
          <option value="Napkins">Napkins</option>
          <option value="Ice">Ice (bag)</option>
          <option value="Stirrer/Spoon">Stirrer/Spoon</option>
          <option value="Powdered Mix">Powdered Mix</option>
          <option value="Labeled Packaging">Labeled Packaging</option>
          <option value="Other">Other (type below)</option>
        </select>
      </label>
  
      <label>
        Custom Item
        <input type="text" class="custom-item" placeholder="Custom Item" style="display:none">
      </label>
  
      <label>
        Quantity
        <select class="quantity">
          ${[...Array(21).keys()].slice(1).map(n => `<option value="${n}">${n}</option>`).join('')}
        </select>
      </label>
  
      <label>
        Cost Each ($)
        <input type="text" class="cost-each" placeholder="0.00">
      </label>
  
      <label>
        Total Cost
        <input type="text" class="total-cost" placeholder="$0.00" readonly>
      </label>
    `;
    document.getElementById('supplyContainer').appendChild(container);
    attachListeners(container);
  });

  document.getElementById('cupsSold').addEventListener('change', updateTotals);

  // Attach listeners to initial rows
  document.querySelectorAll('.item-row').forEach(attachListeners);

  const downloadButton = document.getElementById('downloadReport');
  if (downloadButton) {
    downloadButton.addEventListener('click', downloadReport);
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
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);

  if (allChecked) {
    document.body.classList.add('celebrate');
    if (!document.getElementById('checklistDownloadBtn')) {
      const btn = document.createElement('button');
      btn.id = 'checklistDownloadBtn';
      btn.textContent = '🎉 Download My Checklist Summary';
      btn.style.marginTop = '1.5rem';
      btn.onclick = () => generatePDFSummary('checklistContainer', 'checklist-summary.pdf');
      document.querySelector('.container')?.appendChild(btn);
    }
  } else {
    document.body.classList.remove('celebrate');
    const btn = document.getElementById('checklistDownloadBtn');
    if (btn) btn.remove();
  }
}

// 3. Attach listener to all checklist checkboxes
document.addEventListener('DOMContentLoaded', () => {
  const checklistBoxes = document.querySelectorAll('input[type="checkbox"]');
  checklistBoxes.forEach(cb => cb.addEventListener('change', checkChecklistCompletion));
});

// 4. Open Google Drive folder for photo uploads
function goToDriveFolder() {
  window.open('https://drive.google.com/drive/folders/1kFxkIXOyD0U3c0BEAb4ED7eOpujh92zk', '_blank');
}

// 5. Final report PDF export (now generates a certificate)
function generateFinalReportPDF() {
  const doc = new jsPDF();
  const studentName = prompt("Enter your name for the certificate:");

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
  doc.text(`Presented with pride by Lemons Inc.`, 105, 180, null, null, 'center');

  doc.save('lemonade-boss-certificate.pdf');
}

function attachListeners(row) {
  row.querySelector('.quantity').addEventListener('change', updateTotals);
  row.querySelector('.cost-each').addEventListener('input', updateTotals);

  const select = row.querySelector('.item-select');
  const customInput = row.querySelector('.custom-item');

  if (select && customInput) {
    select.addEventListener('change', () => {
      if (select.value === 'Other') {
        customInput.style.display = 'inline-block';
      } else {
        customInput.style.display = 'none';
        customInput.value = '';
      }
    });
  }
}

function downloadReport() {
  const totalExpenses = document.getElementById('totalExpenses')?.value || '';
  const pricePerCup = document.getElementById('pricePerCup')?.value || '';
  const cupsSold = document.getElementById('cupsSold')?.value || '';
  const totalIncome = document.getElementById('totalIncome')?.value || '';
  const finalProfit = document.getElementById('finalProfit')?.value || '';

  let content = `🍋 Lemonade Stand Summary 🍋\n\n`;
  content += `Total Expenses: ${totalExpenses}\n`;
  content += `Price Per Cup: ${pricePerCup}\n`;
  content += `Cups Sold: ${cupsSold}\n`;
  content += `Total Income: ${totalIncome}\n`;
  content += `Final Profit: ${finalProfit}\n`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'lemonade-stand-summary.txt';
  a.click();

  URL.revokeObjectURL(url);
}
