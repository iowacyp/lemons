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

  const example = document.getElementById('pricingExample');
  const note = document.getElementById('pricingExampleNote');
  let savedFields;
  const supplyList = document.getElementById('supplyContainer');
  const addSupply = document.getElementById('addItem');
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
    supplyList.inert = !showingExample;
    addSupply.disabled = !showingExample;
    note.hidden = showingExample;
    example.setAttribute('aria-pressed', String(!showingExample));
    example.textContent = showingExample ? 'Try an example' : 'Back to my pricing plan';
    updateTotals({ persist: false });
  });
});
