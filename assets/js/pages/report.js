window.addEventListener('DOMContentLoaded', () => {
  const currencyIds = ['finalProfit', 'totalExpenses', 'totalIncome', 'pricePerCup', 'finalSuppliesCost', 'loanAmount'];

  const formatCurrency = (value, fallback = '$0.00') => {
    if (value === null || value === undefined || value === '') return fallback;
    const raw = String(value).replace(/[^0-9.-]/g, '');
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return String(value);
    return `$${parsed.toFixed(2)}`;
  };

  const formatText = (value, fallback = 'Not set yet') => {
    if (value === null || value === undefined) return fallback;
    const text = String(value).trim();
    return text ? text : fallback;
  };

  currencyIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = localStorage.getItem(id);
    el.textContent = formatCurrency(val);
  });

  const textFields = ['repaymentPlan', 'favoriteMoment', 'proudMoment', 'waysToSpread', 'specialHighlight', 'pitchLine', 'flyerCaption'];
  textFields.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = localStorage.getItem(id);
    el.textContent = formatText(val, id === 'favoriteMoment' || id === 'proudMoment' ? 'Nothing written yet' : 'Not set yet');
  });

  const deadlineEl = document.getElementById('deadline');
  const deadline = localStorage.getItem('deadline');
  if (deadlineEl) {
    if (deadline) {
      const dateObj = new Date(deadline);
      deadlineEl.textContent = Number.isNaN(dateObj.getTime())
        ? deadline
        : dateObj.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    } else {
      deadlineEl.textContent = 'Not set yet';
    }
  }

  const marketingPlanRaw = localStorage.getItem('marketingPlan');
  if (marketingPlanRaw) {
    let marketingData = {};
    try {
      marketingData = JSON.parse(marketingPlanRaw);
    } catch {
      const lines = marketingPlanRaw.split('\n').map((line) => line.trim()).filter(Boolean);
      marketingData = {
        waysToSpread: lines[0] || '',
        specialHighlight: lines[1] || '',
        pitchLine: lines[2] || '',
        flyerCaption: lines[3] || ''
      };
    }

    const map = {
      waysToSpread: 'Not set yet',
      specialHighlight: 'Not set yet',
      pitchLine: 'Not set yet',
      flyerCaption: 'Not set yet'
    };

    Object.keys(map).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const value = (marketingData[id] || '').replace(/^Ways to spread the word:\s*/i, '')
        .replace(/^How customers will hear about the stand:\s*/i, '')
        .replace(/^What makes our lemonade special:\s*/i, '')
        .replace(/^Our pitch:\s*/i, '')
        .replace(/^Flyer caption:\s*/i, '');
      el.textContent = formatText(value, map[id]);
    });
  }

  const certName = document.getElementById('certificateName');
  const storedName = localStorage.getItem('studentName');
  if (certName) {
    certName.textContent = formatText(storedName, '(Your Name Here)');
  }
});
