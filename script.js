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
      <select class="item-select">
        <option value="Lemons">Lemons</option>
        <option value="Sugar">Sugar</option>
        <option value="Cups">Cups</option>
        <option value="Pitcher">Pitcher</option>
        <option value="Poster/Signs">Poster/Signs</option>
        <option value="Other">Other (type below)</option>
      </select>
      <input type="text" class="custom-item" placeholder="Custom Item" style="display:none">
      <select class="quantity">${[...Array(21).keys()].slice(1).map(n => `<option value="${n}">${n}</option>`).join('')}</select>
      <input type="text" class="cost-each" placeholder="$0.00">
      <input type="text" class="total-cost" placeholder="$0.00" readonly>
    `;
    supplyContainer.appendChild(container);
    attachListeners(container);
  });

  document.getElementById('cupsSold').addEventListener('change', updateTotals);

  // Attach listeners to initial rows
  document.querySelectorAll('.item-row').forEach(attachListeners);
});

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
