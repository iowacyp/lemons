document.addEventListener('DOMContentLoaded', () => {
  const normalizeNumber = (value, fallback) => {
    const parsed = parseFloat(String(value || '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? String(parsed) : fallback;
  };

  const setDefault = (id, value) => {
    const field = document.getElementById(id);
    if (!field) return;
    const saved = localStorage.getItem(id);
    if (saved !== null && saved !== '') {
      field.value = field.type === 'number' ? normalizeNumber(saved, value) : saved;
    } else if (!field.value) {
      field.value = value;
      localStorage.setItem(id, field.value);
    }
  };

  setDefault('cupsMade', '10');
  const cupsMadeField = document.getElementById('cupsMade');
  setDefault('cupsSold', cupsMadeField?.value || '10');
  setDefault('pricePerCup', '1.50');

  updateTotals();
});
