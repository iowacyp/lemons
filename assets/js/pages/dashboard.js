function moneyToNumber(value) {
  if (typeof value !== 'string') return 0;
  const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value) {
  const num = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(num);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function parseMaybeJSON(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function buildJourneyState(steps) {
  const store = localStorage;
  const evaluated = steps.map((step, index) => ({
    ...step,
    index,
    complete: typeof step.complete === 'function' ? step.complete(store) : false
  }));
  const nextStep = evaluated.find(step => !step.complete) || null;
  return {
    evaluated,
    nextStep,
    completedCount: evaluated.filter(step => step.complete).length
  };
}

function renderJourney(steps) {
  const list = document.getElementById('journeySteps');
  const action = document.getElementById('journeyAction');
  const copy = document.getElementById('journeyCopy');
  const count = document.getElementById('journeyStepCount');
  const { evaluated, nextStep, completedCount } = buildJourneyState(steps);

  const meter = document.getElementById('journeyMeter');
  meter.max = evaluated.length;
  meter.value = completedCount;
  count.textContent = `${completedCount} of ${evaluated.length} complete`;
  action.href = nextStep?.href || 'report.html';
  action.querySelector('span').textContent = nextStep?.label || 'Open your business report';
  copy.textContent = nextStep?.hint || 'You finished all eight activities. Take a copy of your work with you.';

  const groups = [
    ['Plan your stand', evaluated.slice(0, 4)],
    ['Get ready to sell', evaluated.slice(4, 6)],
    ['Wrap up', evaluated.slice(6)]
  ];

  groups.forEach(([label, activities], index) => {
    const group = document.createElement('section');
    group.className = 'activity-group';
    group.dataset.stage = index + 1;
    const heading = document.createElement('h3');
    heading.textContent = label;
    group.append(heading);
    activities.forEach(step => {
      const item = document.createElement('a');
      item.className = 'journey-step';
      item.href = step.href;
      item.dataset.state = step.complete ? 'complete' : step === nextStep ? 'next' : 'todo';
      const title = document.createElement('strong');
      title.textContent = step.label;
      const status = document.createElement('span');
      status.textContent = step.complete ? 'Complete' : step === nextStep ? 'Up next' : 'To do';
      item.append(title, status);
      group.append(item);
    });
    list.append(group);
  });
}

function renderInventory(rows) {
  const list = document.getElementById('inventoryList');
  const count = document.getElementById('inventoryCount');
  if (!list) return;

  list.innerHTML = '';
  const usableRows = rows.filter(row => row.item || row.customItem || row.quantity || row.costEach);

  if (count) {
    const meter = document.getElementById('journeyMeter');
  meter.max = evaluated.length;
  meter.value = completedCount;
  count.textContent = `${usableRows.length} item${usableRows.length === 1 ? '' : 's'}`;
  }

  if (!usableRows.length) {
    list.innerHTML = `
      <div class="empty-state">
        <strong>No inventory yet</strong>
        <span>Open the calculator to add lemons, cups, sugar, and ice.</span>
      </div>
    `;
    return;
  }

  usableRows.slice(0, 6).forEach(row => {
    const name = row.customItem || row.item || 'Supplies';
    const qty = row.quantity || '1';
    const total = row.totalCost || '$0.00';
    const item = document.createElement('div');
    item.className = 'inventory-item';
    item.innerHTML = `
      <div class="inventory-icon"><i class="fa-solid fa-box"></i></div>
      <div class="inventory-copy">
        <strong>${name}</strong>
        <span>${qty} unit${qty === '1' ? '' : 's'} • ${total}</span>
      </div>
    `;
    list.appendChild(item);
  });
}

function renderReviews() {
  const list = document.getElementById('reviewList');
  const repeatCount = document.getElementById('repeatCount');
  if (!list) return;

  const reviews = parseMaybeJSON('customerReviews', []);
  const repeatCustomers = Number(localStorage.getItem('repeatCustomers') || reviews.filter(r => r.repeat).length || 0);
  if (repeatCount) {
    repeatCount.textContent = `${repeatCustomers} repeat${repeatCustomers === 1 ? '' : 's'}`;
  }

  list.innerHTML = '';

  const defaultReviews = [
    { name: 'Happy buyer', text: 'Fresh, bright, and super refreshing.', repeat: true },
    { name: 'Neighborhood friend', text: 'Great service and a friendly smile.', repeat: false }
  ];

  const source = reviews.length ? reviews : defaultReviews;
  source.slice(0, 3).forEach(review => {
    const card = document.createElement('div');
    card.className = 'review-item';
    card.innerHTML = `
      <div class="review-head">
        <strong>${review.name || 'Customer'}</strong>
        <span>${review.repeat ? 'Repeat' : 'New'}</span>
      </div>
      <p>${review.text || 'No notes yet.'}</p>
    `;
    list.appendChild(card);
  });
}

function renderAchievements(data) {
  const list = document.getElementById('achievementList');
  const count = document.getElementById('achievementCount');
  if (!list) return;

  const achievements = [
    data.standName ? { icon: 'fa-solid fa-crown', label: 'Brand Builder', detail: 'Named the stand' } : null,
    data.profit > 0 ? { icon: 'fa-solid fa-sack-dollar', label: 'Profit Maker', detail: 'Earned positive profit' } : null,
    data.totalIncome > 0 ? { icon: 'fa-solid fa-coins', label: 'Sales Starter', detail: 'Made first sales' } : null,
    data.inventoryCount > 0 ? { icon: 'fa-solid fa-lemon', label: 'Stock Keeper', detail: 'Tracked supplies' } : null,
    data.checklistCount > 0 ? { icon: 'fa-solid fa-list-check', label: 'Ready to Launch', detail: 'Packed the checklist' } : null
  ].filter(Boolean);

  if (count) {
    const meter = document.getElementById('journeyMeter');
  meter.max = evaluated.length;
  meter.value = completedCount;
  count.textContent = `${achievements.length} unlocked`;
  }

  list.innerHTML = '';
  if (!achievements.length) {
    list.innerHTML = `
      <div class="empty-state">
        <strong>Achieve your first badge</strong>
        <span>Fill in a few pages and your milestones will light up here.</span>
      </div>
    `;
    return;
  }

  achievements.forEach(achievement => {
    const badge = document.createElement('div');
    badge.className = 'achievement-badge';
    badge.innerHTML = `
      <i class="${achievement.icon}" aria-hidden="true"></i>
      <div>
        <strong>${achievement.label}</strong>
        <span>${achievement.detail}</span>
      </div>
    `;
    list.appendChild(badge);
  });
}

function renderChart(data) {
  const chart = document.getElementById('dashboardChart');
  if (!chart) return;

  const values = [
    { label: 'Expense', value: Math.max(data.totalExpenses, 1), tone: 'warn' },
    { label: 'Income', value: Math.max(data.totalIncome, 1), tone: 'mint' },
    { label: 'Profit', value: Math.max(data.profit, 0), tone: 'sun' },
    { label: 'Goal', value: Math.max(data.goal, 1), tone: 'sky' }
  ];
  const maxValue = Math.max(...values.map(item => item.value), 1);

  chart.innerHTML = '';
  values.forEach(item => {
    const bar = document.createElement('div');
    bar.className = 'chart-bar-wrap';
    const height = Math.max(18, Math.round((item.value / maxValue) * 100));
    bar.innerHTML = `
      <div class="chart-bar ${item.tone}" style="height: ${height}%"></div>
      <span>${formatMoney(item.value)}</span>
    `;
    chart.appendChild(bar);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const site = window.LEMONS_SITE || {};
  const journeySteps = Array.isArray(site.journeySteps) ? site.journeySteps : [];
  const standName = localStorage.getItem('stand-name') || localStorage.getItem('standName') || 'My Lemonade Stand';
  const slogan = localStorage.getItem('slogan') || 'Fresh lemonade, bright ideas, and simple money skills.';
  const studentName = localStorage.getItem('studentName') || 'Ready to start';
  const openingDate = localStorage.getItem('date') || localStorage.getItem('deadline') || '';
  const brandColors = [localStorage.getItem('primaryColor'), localStorage.getItem('secondaryColor')].filter(Boolean);

  const totalExpenses = moneyToNumber(localStorage.getItem('totalExpenses'));
  const totalIncome = moneyToNumber(localStorage.getItem('totalIncome'));
  const profit = moneyToNumber(localStorage.getItem('finalProfit'));
  const pricePerCup = localStorage.getItem('pricePerCup') || '$0.00';
  const cupsSold = Number(localStorage.getItem('cupsSold') || 0);
  const goal = Math.max(moneyToNumber(localStorage.getItem('savingsGoal') || localStorage.getItem('goalAmount')), totalIncome || 100);
  const goalProgress = Math.max(0, Math.min(100, Math.round((Math.max(profit, 0) / goal) * 100)));

  setText('dashboardStandName', standName);
  setText('dashboardSlogan', slogan);
  setText('dashboardStudent', studentName);
  setText('dashboardDate', openingDate ? new Date(openingDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Not set yet');
  setText('dashboardBrand', brandColors.length ? 'Custom colors' : 'Sunny and smart');
  setText('metricSales', formatMoney(totalIncome));
  setText('metricProfit', formatMoney(profit));
  setText('metricExpenses', formatMoney(totalExpenses));
  setText('metricPrice', pricePerCup);
  setText('goalAmount', formatMoney(goal));
  setText('progressPercent', `${goalProgress}%`);
  setText('goalCopy', goal > 0
    ? `You are ${goalProgress}% of the way to your next upgrade target.`
    : 'Set a savings goal to see your progress ring light up.');

  const ring = document.getElementById('progressRing');
  if (ring) {
    ring.style.setProperty('--progress', `${goalProgress}%`);
  }

  const checklistItems = parseMaybeJSON('checklistItems', []);
  const supplyRows = parseMaybeJSON('supplyRows', []);
  renderJourney(journeySteps);
  renderInventory(supplyRows);
  renderReviews();
  renderAchievements({
    standName,
    profit,
    totalIncome,
    inventoryCount: supplyRows.length,
    checklistCount: checklistItems.length
  });
  renderChart({
    totalExpenses,
    totalIncome,
    profit,
    goal
  });

  const summaryMap = {
    'heroSales': formatMoney(totalIncome),
    'heroProfit': formatMoney(profit),
    'heroInventory': `${supplyRows.length} stocked item${supplyRows.length === 1 ? '' : 's'}`,
    'heroCups': `${cupsSold} cup${cupsSold === 1 ? '' : 's'}`
  };
  Object.entries(summaryMap).forEach(([id, value]) => setText(id, value));
});
