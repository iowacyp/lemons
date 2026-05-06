function setFieldValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || '';
}

function setText(id, value, fallback) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || fallback || '';
}

function formatDate(value) {
  if (!value) return 'Not set yet';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function syncPreview() {
  const standName = document.getElementById('stand-name')?.value.trim() || 'Sunny Sips';
  const slogan = document.getElementById('slogan')?.value.trim() || 'Cold drinks, warm smiles.';
  const date = document.getElementById('date')?.value || '';
  const time = document.getElementById('time')?.value || '';

  setText('standPreviewName', standName, 'Sunny Sips');
  setText('standPreviewSlogan', slogan, 'Cold drinks, warm smiles.');
  setText('standPreviewDate', formatDate(date));
  setText('standPreviewTime', time || 'Not set yet');

  localStorage.setItem('stand-name', standName);
  localStorage.setItem('standName', standName);
  localStorage.setItem('slogan', slogan);
  localStorage.setItem('flavors', document.getElementById('flavors')?.value || '');
  localStorage.setItem('date', date);
  localStorage.setItem('time', time);
}

document.addEventListener('DOMContentLoaded', () => {
  setFieldValue('stand-name', localStorage.getItem('stand-name') || localStorage.getItem('standName') || '');
  setFieldValue('slogan', localStorage.getItem('slogan') || '');
  setFieldValue('flavors', localStorage.getItem('flavors') || '');
  setFieldValue('date', localStorage.getItem('date') || '');
  setFieldValue('time', localStorage.getItem('time') || '');

  ['stand-name', 'slogan', 'flavors', 'date', 'time'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', syncPreview);
    document.getElementById(id)?.addEventListener('change', syncPreview);
  });

  syncPreview();
});
