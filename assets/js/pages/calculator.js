document.addEventListener('DOMContentLoaded', () => {
  const fields = ['batchCostInput', 'cupsMade', 'pricePerCup', 'cupsSold']
    .map(id => document.getElementById(id));
  const hasSavedPlan = localStorage.getItem('pricingPlanComplete') !== null;
  const hasSavedCosts = Number((localStorage.getItem('totalExpenses') || '').replace(/[^0-9.]/g, '')) > 0;
  fields.forEach(field => {
    const saved = localStorage.getItem(field.id);
    if (saved !== null && (hasSavedPlan || hasSavedCosts)) {
      field.value = saved.replace(/^\$/, '');
    }
  });
  updateTotals({ persist: false });

  const price = document.getElementById('pricePerCup');
  [['pricingLower', -25], ['pricingRaise', 25]].forEach(([id, change]) => {
    const button = document.getElementById(id);
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-disabled') === 'true') return;
      price.value = ((Math.round(Number(price.value) * 100) + change) / 100).toFixed(2);
      updateTotals();
    });
  });

  const example = document.getElementById('pricingExample');
  const note = document.getElementById('pricingExampleNote');
  let savedFields;
  const builder = document.getElementById('batchBuilderControls');
  example.addEventListener('click', () => {
    const showingExample = Boolean(savedFields);
    if (showingExample) {
      fields.forEach((field, index) => { field.value = savedFields[index]; });
      savedFields = undefined;
    } else {
      savedFields = fields.map(field => field.value);
      ['6', '10', '1.50', '10'].forEach((value, index) => { fields[index].value = value; });
    }
    document.body.toggleAttribute('data-pricing-example', !showingExample);
    builder.inert = !showingExample;
    note.hidden = showingExample;
    example.setAttribute('aria-pressed', String(!showingExample));
    example.textContent = showingExample ? 'Try an example' : 'Back to my pricing plan';
    updateTotals({ persist: false });
  });
});
