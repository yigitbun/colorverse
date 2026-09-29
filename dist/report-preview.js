// A calm, native report preview for the Screens context. The report owns a
// neutral canvas; palette CSS variables on #mockup color its charts, accents and
// swatches, so Studio edits and Color Globe previews restyle it live. The
// figures are illustrative and fixed; nothing is fetched. KPI strings, shares
// and takeaways are derived from the base figures below so they cannot drift.
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const reportData = Object.freeze({
  title: 'Sales performance',
  filters: ['FY 2026 · Jan–Dec', 'All regions', 'All channels'],
  // Monthly revenue in €k; each series sums to its fiscal-year total.
  current: [336, 322, 358, 375, 366, 402, 419, 412, 436, 460, 452, 482],
  previous: [326, 320, 337, 354, 358, 371, 384, 389, 403, 417, 429, 442],
  orders: { current: 12480, previous: 12010 },
  margin: { current: 38.2, previous: 37.1 },
  // Revenue by region in €M against target; regions sum to the revenue KPI.
  regions: [['North', 1.42, 1.30], ['South', 1.08, 1.15], ['West', .96, .90], ['East', .78, .85], ['Central', .58, .55]],
  // Revenue by channel in €M; channels sum to the revenue KPI.
  channels: [['Online store', 2.03], ['Retail stores', 1.40], ['Marketplace', .87], ['Wholesale', .52]],
  // Revenue by category in €M, this year and previous year; each column sums to its year's total.
  categories: [['Apparel', 1.74, 1.68], ['Footwear', 1.30, 1.16], ['Accessories', 1.08, 1.02], ['Equipment', .70, .67]],
});

const sum = values => values.reduce((total, value) => total + value, 0);
const pct = (now, before) => (now / before - 1) * 100;
const millions = value => `€${value.toFixed(2)}M`;
const signed = value => `${value < 0 ? '−' : '+'}${Math.abs(value).toFixed(1)}%`;
// Whole-percent shares that always total 100 (largest remainder).
export function shares(values) {
  const total = sum(values);
  const raw = values.map(value => value / total * 100);
  const result = raw.map(Math.floor);
  const order = raw.map((value, index) => [value - result[index], index]).sort((a, b) => b[0] - a[0]);
  for (let left = 100 - sum(result), n = 0; left > 0; left--, n++) result[order[n][1]]++;
  return result;
}

export function reportKpis(data = reportData) {
  const revenue = sum(data.current), revenuePrevious = sum(data.previous);
  const aov = revenue * 1000 / data.orders.current, aovPrevious = revenuePrevious * 1000 / data.orders.previous;
  const trend = value => ({ change: `${Math.abs(value).toFixed(1)}% vs PY`, up: value >= 0 });
  const margin = data.margin.current - data.margin.previous;
  return [
    { label: 'Revenue', value: millions(revenue / 1000), ...trend(pct(revenue, revenuePrevious)) },
    { label: 'Gross margin', value: `${data.margin.current.toFixed(1)}%`, change: `${Math.abs(margin).toFixed(1)} pt vs PY`, up: margin >= 0 },
    { label: 'Orders', value: data.orders.current.toLocaleString('en-US'), ...trend(pct(data.orders.current, data.orders.previous)) },
    { label: 'Avg. order value', value: `€${Math.round(aov)}`, ...trend(pct(aov, aovPrevious)) },
  ];
}

// Each takeaway names its evidence, which is visible elsewhere in the report.
export function reportTakeaways(data = reportData) {
  const peak = data.current.indexOf(Math.max(...data.current));
  const growth = data.categories.map(([name, now, before]) => [name, now, pct(now, before)]);
  const [fastName, fastValue, fastGrowth] = growth.reduce((best, item) => item[2] > best[2] ? item : best);
  const behind = data.regions.filter(([, actual, target]) => actual < target);
  const gaps = behind.map(([name, actual, target]) => `${name} ${millions(target - actual)}`).join(', ');
  return [
    { title: `Revenue ${signed(pct(sum(data.current), sum(data.previous)))} vs PY`, detail: `${monthNames[peak]} was the strongest month at €${data.current[peak]}k.` },
    { title: `${fastName} grew fastest`, detail: `${signed(fastGrowth)} vs PY to ${millions(fastValue)}, ahead of every other category.` },
    { title: `${behind.length} of ${data.regions.length} regions below target`, detail: `Gaps: ${gaps}.` },
  ];
}

const plot = { left: 34, right: 392, top: 12, bottom: 136, min: 300, max: 500 };
const x = index => plot.left + index * (plot.right - plot.left) / (months.length - 1);
const y = value => plot.bottom - (value - plot.min) / (plot.max - plot.min) * (plot.bottom - plot.top);
const line = values => values.map((value, index) => `${index ? 'L' : 'M'}${x(index).toFixed(1)} ${y(value).toFixed(1)}`).join(' ');

function trendChart({ current, previous }) {
  const ticks = [300, 400, 500];
  const last = current.length - 1;
  return `<svg class="bi-trend" viewBox="0 0 400 160" role="img" aria-labelledby="biTrendTitle" focusable="false">
    <title id="biTrendTitle">Illustrative monthly revenue, FY 2026 against previous year, in thousands of euros.</title>
    ${ticks.map(tick => `<line class="bi-grid" x1="${plot.left}" x2="${plot.right}" y1="${y(tick)}" y2="${y(tick)}"/><text class="bi-axis" x="${plot.left - 6}" y="${y(tick) + 3}" text-anchor="end">${tick}</text>`).join('')}
    <path class="bi-area" d="${line(current)} L${x(last)} ${plot.bottom} L${x(0)} ${plot.bottom} Z"/>
    <path class="bi-line-previous" d="${line(previous)}"/>
    <path class="bi-line-case" d="${line(current)}" pathLength="1"/>
    <path class="bi-line-current" d="${line(current)}" pathLength="1"/>
    <circle class="bi-point" cx="${x(last)}" cy="${y(current[last])}" r="3.5"/>
    ${months.map((month, index) => index % 2 === 1 ? `<text class="bi-axis" x="${x(index)}" y="${plot.bottom + 16}" text-anchor="middle">${month}</text>` : '').join('')}
  </svg>`;
}

function regionChart(regions) {
  const scale = 1.6;
  return `<ul class="bi-bars" aria-label="Illustrative revenue by region against target">${regions.map(([name, actual, target], index) => `<li style="--i:${index}">
    <span class="bi-bar-label">${name}</span>
    <span class="bi-bar-track" aria-hidden="true"><i class="bi-bar" style="width:${(actual / scale * 100).toFixed(1)}%"></i><b class="bi-target" style="left:${(target / scale * 100).toFixed(1)}%"></b></span>
    <span class="bi-bar-value">€${actual.toFixed(2)}M<span class="sr-only">, target €${target.toFixed(2)}M</span></span>
  </li>`).join('')}</ul>`;
}

// A ring of circumference 100 lets each share be its own dash length.
function channelChart(channels) {
  const percent = shares(channels.map(([, value]) => value));
  let start = 0;
  const slices = percent.map((share, index) => {
    const slice = `<circle class="bi-slice" style="--i:${index}" cx="21" cy="21" r="15.9155" stroke-dasharray="${share} ${100 - share}" stroke-dashoffset="${-start}"/>`;
    start += share;
    return slice;
  }).join('');
  return `<div class="bi-mix">
    <div class="bi-donut"><svg viewBox="0 0 42 42" aria-hidden="true" focusable="false"><g transform="rotate(-90 21 21)"><circle class="bi-donut-case" cx="21" cy="21" r="15.9155"/>${slices}</g></svg><p><strong>${millions(sum(channels.map(([, value]) => value)))}</strong><span>Revenue</span></p></div>
    <ul class="bi-mix-list" aria-label="Illustrative revenue share by channel">${channels.map(([name, value], index) => `<li><i aria-hidden="true"></i><span>${name}</span><b>${percent[index]}%</b><small>${millions(value)}</small></li>`).join('')}</ul>
  </div>`;
}

function categoryChart(categories) {
  const percent = shares(categories.map(([, value]) => value));
  const scale = Math.max(...categories.map(([, value]) => value));
  return `<ul class="bi-bars bi-categories" aria-label="Illustrative revenue by category with change versus previous year">${categories.map(([name, value, before], index) => `<li style="--i:${index}">
    <span class="bi-bar-label">${name}</span>
    <span class="bi-bar-track" aria-hidden="true"><i class="bi-bar" style="width:${(value / scale * 100).toFixed(1)}%"></i></span>
    <span class="bi-bar-value">${millions(value)} <small>${percent[index]}%</small></span>
    <span class="bi-growth">${signed(pct(value, before))}<span class="sr-only"> vs previous year</span></span>
  </li>`).join('')}</ul>`;
}

// Swatch fills come from report-preview.css in this order.
const swatches = ['Background', 'Surface', 'Primary', 'Accent', 'Text'];

// Charts play their entry motion only when the report newly appears. Studio
// re-renders the mockup on every palette edit; a report already on screen
// means this call is an edit, so the new markup arrives still.
export function reportEntering(root = globalThis.document) {
  return Boolean(root) && !root.querySelector('#mockup .bi-report');
}

export function reportPreview(data = reportData, { enter = reportEntering() } = {}) {
  return `<div class="mockup context-kit bi-report${enter ? ' bi-enter' : ''}">
    <header class="bi-head"><div><span class="kit-kicker">Report · Overview</span><h4>${data.title}</h4><p class="bi-sub">Revenue, orders and margin by month, channel, region and category</p></div><div class="bi-head-side"><div class="bi-scope"><span>Scope</span><ul class="bi-filters" aria-label="Report scope, fixed for this preview">${data.filters.map(filter => `<li>${filter}</li>`).join('')}</ul></div><ul class="bi-swatches" aria-label="Palette colors">${swatches.map(label => `<li title="${label}"><span class="sr-only">${label}</span></li>`).join('')}</ul></div></header>
    <section class="bi-kpis" aria-label="Key figures">${reportKpis(data).map(kpi => `<article><span>${kpi.label}</span><strong>${kpi.value}</strong><small><b aria-hidden="true">${kpi.up ? '▲' : '▼'}</b> <span class="sr-only">${kpi.up ? 'Up' : 'Down'} </span>${kpi.change}</small></article>`).join('')}</section>
    <div class="bi-charts">
      <section class="bi-panel bi-panel-trend"><header><h5>Revenue trend</h5><p class="bi-legend"><span><i class="bi-key-current"></i>FY 2026</span><span><i class="bi-key-previous"></i>Previous year</span></p></header>${trendChart(data)}</section>
      <section class="bi-panel"><header><h5>Revenue by channel</h5><p class="bi-legend">Share of total</p></header>${channelChart(data.channels)}</section>
      <section class="bi-panel"><header><h5>Revenue by category</h5><p class="bi-legend">Share · vs PY</p></header>${categoryChart(data.categories)}</section>
      <section class="bi-panel"><header><h5>Revenue by region</h5><p class="bi-legend"><span><i class="bi-key-current"></i>Actual</span><span><i class="bi-key-target"></i>Target</span></p></header>${regionChart(data.regions)}</section>
    </div>
    <section class="bi-takeaways" aria-labelledby="biTakeawaysTitle"><h5 id="biTakeawaysTitle">Key takeaways</h5><ul>${reportTakeaways(data).map((item, index) => `<li style="--i:${index}"><strong>${item.title}</strong><span>${item.detail}</span></li>`).join('')}</ul></section>
    <footer class="bi-foot"><span>Illustrative data · not a live report or Power BI connection</span><span>Trend €k · totals €M</span></footer>
  </div>`;
}
