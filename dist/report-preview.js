// A calm, native report preview for the Screens context. Every color comes from
// the palette CSS variables on #mockup, so Studio edits and Color Globe previews
// restyle it live. The figures are illustrative and fixed; nothing is fetched.
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const reportData = Object.freeze({
  title: 'Sales performance',
  filters: ['FY 2026', 'All regions', 'All channels'],
  kpis: [
    { label: 'Revenue', value: '€4.82M', change: '6.4% vs PY', up: true },
    { label: 'Gross margin', value: '38.2%', change: '1.1 pt vs PY', up: true },
    { label: 'Orders', value: '12,480', change: '3.9% vs PY', up: true },
    { label: 'Avg. order value', value: '€386', change: '0.8% vs PY', up: false },
  ],
  // Monthly revenue in €k; each series sums to its fiscal-year total.
  current: [336, 322, 358, 375, 366, 402, 419, 412, 436, 460, 452, 482],
  previous: [326, 320, 337, 354, 358, 371, 384, 389, 403, 417, 429, 442],
  // Revenue by region in €M against target; regions sum to the revenue KPI.
  regions: [['North', 1.42, 1.30], ['South', 1.08, 1.15], ['West', .96, .90], ['East', .78, .85], ['Central', .58, .55]],
});

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
    <path class="bi-line-current" d="${line(current)}"/>
    <circle class="bi-point" cx="${x(last)}" cy="${y(current[last])}" r="3.5"/>
    ${months.map((month, index) => index % 2 === 0 || index === last ? `<text class="bi-axis" x="${x(index)}" y="${plot.bottom + 16}" text-anchor="middle">${month}</text>` : '').join('')}
  </svg>`;
}

function regionChart(regions) {
  const scale = 1.6;
  return `<ul class="bi-bars" aria-label="Illustrative revenue by region against target">${regions.map(([name, actual, target]) => `<li>
    <span class="bi-bar-label">${name}</span>
    <span class="bi-bar-track" aria-hidden="true"><i class="bi-bar" style="width:${(actual / scale * 100).toFixed(1)}%"></i><b class="bi-target" style="left:${(target / scale * 100).toFixed(1)}%"></b></span>
    <span class="bi-bar-value">€${actual.toFixed(2)}M<span class="sr-only">, target €${target.toFixed(2)}M</span></span>
  </li>`).join('')}</ul>`;
}

export function reportPreview(data = reportData) {
  return `<div class="mockup context-kit bi-report">
    <header class="bi-head"><div><span class="kit-kicker">Report · Overview</span><h4>${data.title}</h4></div><ul class="bi-filters" aria-label="Report filters">${data.filters.map(filter => `<li>${filter}</li>`).join('')}</ul></header>
    <section class="bi-kpis" aria-label="Key figures">${data.kpis.map(kpi => `<article><span>${kpi.label}</span><strong>${kpi.value}</strong><small><b aria-hidden="true">${kpi.up ? '▲' : '▼'}</b> <span class="sr-only">${kpi.up ? 'Up' : 'Down'} </span>${kpi.change}</small></article>`).join('')}</section>
    <div class="bi-charts">
      <section class="bi-panel"><header><h5>Revenue trend</h5><p class="bi-legend"><span><i class="bi-key-current"></i>FY 2026</span><span><i class="bi-key-previous"></i>Previous year</span></p></header>${trendChart(data)}</section>
      <section class="bi-panel"><header><h5>Revenue by region</h5><p class="bi-legend"><span><i class="bi-key-current"></i>Actual</span><span><i class="bi-key-target"></i>Target</span></p></header>${regionChart(data.regions)}</section>
    </div>
    <footer class="bi-foot"><span>Illustrative data · not a live report or Power BI connection</span><span>€k / €M</span></footer>
  </div>`;
}
