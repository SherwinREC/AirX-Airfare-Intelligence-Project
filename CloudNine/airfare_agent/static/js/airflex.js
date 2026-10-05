/*
  CLOUD NINE — Interactive Client Engine & Analytics Frontend
  Smart India Hackathon 2026 — Problem Statement SIH26056
*/

let currentTab = 'overview';
let chartInstances = {};
let overviewData = null;
let observationsPage = 1;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initAutoHidingSidebar();
  initScrollAnimations();
  loadOverviewData();
  setupEventListeners();
});

// Scroll-Driven Animation & Vanishing Content Controller
function initScrollAnimations() {
  const handleScroll = () => {
    const cards = document.querySelectorAll('.glass-card');
    const windowHeight = window.innerHeight;

    cards.forEach(card => {
      const rect = card.getBoundingClientRect();

      // Card entering or visible in viewport
      if (rect.top < windowHeight * 0.92 && rect.bottom > 80) {
        card.classList.add('scroll-in-view');
        card.classList.remove('scroll-vanished');
      } 
      // Card scrolled past top of screen (vanishing content when scrolled too much)
      else if (rect.bottom < 100) {
        card.classList.add('scroll-vanished');
        card.classList.remove('scroll-in-view');
      } 
      // Card below viewport
      else {
        card.classList.remove('scroll-in-view');
        card.classList.remove('scroll-vanished');
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  // Initial run
  setTimeout(handleScroll, 100);
}

// Auto-Hiding Hover Sidebar Logic
function initAutoHidingSidebar() {
  const sidebar = document.getElementById('sidebarNav');
  const triggerZone = document.getElementById('sidebarTriggerZone');
  if (!sidebar) return;

  if (triggerZone) {
    triggerZone.addEventListener('mouseenter', () => {
      sidebar.classList.add('visible');
    });
  }

  sidebar.addEventListener('mouseenter', () => {
    sidebar.classList.add('visible');
  });

  sidebar.addEventListener('mouseleave', () => {
    sidebar.classList.remove('visible');
  });

  document.addEventListener('mousemove', (e) => {
    if (e.clientX < 26) {
      sidebar.classList.add('visible');
    } else if (e.clientX > 310 && !sidebar.matches(':hover')) {
      sidebar.classList.remove('visible');
    }
  });
}

// Navigation Controller
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.getAttribute('data-tab');
      if (!tab) return;

      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      switchTab(tab);

      // Auto hide sidebar after clicking tab
      const sidebar = document.getElementById('sidebarNav');
      if (sidebar) {
        setTimeout(() => sidebar.classList.remove('visible'), 300);
      }
    });
  });
}

function switchTab(tabId) {
  currentTab = tabId;
  const sections = document.querySelectorAll('.view-section');
  sections.forEach(sec => sec.style.display = 'none');

  const target = document.getElementById(`view-${tabId}`);
  if (target) {
    target.style.display = 'block';
  }

  // Update header title
  const titles = {
    'overview': 'Executive Dashboard',
    'ari': 'Airfare Price Index (ARI)',
    'trends': 'Daily / Weekly / Monthly Trends',
    'routes': 'Route-Level Analysis',
    'heatmap': 'India Route Network Heatmap',
    'forecast': 'Forecast Horizons (T+1 to T+45)',
    'leadtime': 'Lead-Time Curve Analysis',
    'components': 'Fare Components Breakdown',
    'quality': 'Data Quality & Health Metrics',
    'sources': 'Sources & Pipeline Collection Status',
    'validation': '30-Day Methodological Validation',
    'dgca': 'DGCA Reference Benchmark Comparison',
    'observations': 'Raw Observations & Audit Traceability',
    'api': 'API Documentation & Interactive Tester',
    'methodology': 'Methodology & DGCA Weight Matrix Configurator'
  };

  document.getElementById('headerTitle').innerText = titles[tabId] || 'Data Intelligence';

  loadTabData(tabId);

  // Trigger scroll animation check for new view content
  setTimeout(() => {
    window.dispatchEvent(new Event('scroll'));
  }, 100);
}

function loadTabData(tabId) {
  switch (tabId) {
    case 'overview':
      loadOverviewData();
      break;
    case 'ari':
      loadARIDetails();
      break;
    case 'trends':
      loadTrendsData();
      break;
    case 'routes':
      loadRouteAnalysisData();
      break;
    case 'heatmap':
      loadHeatmapData();
      break;
    case 'forecast':
      loadForecastData();
      break;
    case 'leadtime':
      loadLeadTimeData();
      break;
    case 'components':
      loadFareComponentsData();
      break;
    case 'quality':
      loadDataQuality();
      break;
    case 'sources':
      loadSourcesStatus();
      break;
    case 'validation':
      loadValidationData();
      break;
    case 'dgca':
      loadDGCAComparisonData();
      break;
    case 'observations':
      loadObservationsData();
      break;
    case 'api':
      break;
    case 'methodology':
      loadMethodologyData();
      break;
  }
}

// 1. OVERVIEW VIEW
async function loadOverviewData() {
  try {
    const res = await fetch('/api/overview');
    const data = await res.json();
    overviewData = data;

    document.getElementById('kpiARI').innerText = data.ari;
    document.getElementById('kpiDelta').innerText = (data.daily_change_pct >= 0 ? '+' : '') + data.daily_change_pct + '%';
    document.getElementById('kpiObsCount').innerText = data.total_observations.toLocaleString();
    document.getElementById('kpiRoutesCount').innerText = data.routes_count;
    document.getElementById('kpiAirlinesCount').innerText = data.airlines_count;
    document.getElementById('kpiAvgFare').innerText = '₹' + data.average_fare.toLocaleString();

    renderOverviewChart();
    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error('Error loading overview:', err);
  }
}

function renderOverviewChart() {
  const ctx = document.getElementById('chartOverviewMini');
  if (!ctx) return;

  if (chartInstances.overviewMini) chartInstances.overviewMini.destroy();

  chartInstances.overviewMini = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Aug 01', 'Aug 05', 'Aug 10', 'Aug 15', 'Aug 20', 'Aug 25'],
      datasets: [{
        label: 'ARI Index',
        data: [122.1, 124.5, 123.8, 126.2, 127.1, 128.42],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.25)',
        fill: true,
        tension: 0.4,
        borderWidth: 3.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.12)' }, ticks: { color: '#ffffff', font: { weight: 'bold' } } },
        y: { grid: { color: 'rgba(255,255,255,0.12)' }, ticks: { color: '#ffffff', font: { weight: 'bold' } } }
      }
    }
  });
}

// 2. AIRFARE PRICE INDEX (ARI) VIEW
async function loadARIDetails() {
  try {
    const res = await fetch('/api/ari/details');
    const data = await res.json();

    const tbody = document.getElementById('tblARIContributions');
    tbody.innerHTML = data.route_contributions.map(r => `
      <tr>
        <td><span class="badge badge-cyan">${r.route}</span></td>
        <td><span class="badge badge-blue">${r.dgca_weight}%</span></td>
        <td>₹${r.avg_fare.toLocaleString()}</td>
        <td>₹${r.baseline_fare.toLocaleString()}</td>
        <td style="font-family: var(--font-mono); font-weight:700;">${r.route_index}</td>
        <td style="font-family: var(--font-mono); color: var(--accent-sky); font-weight:700;">+${r.contribution_points} pts</td>
        <td style="color: var(--accent-emerald); font-weight:700;">+${r.daily_change_pct}%</td>
      </tr>
    `).join('');

    const ctx = document.getElementById('chartARITimeSeries');
    if (ctx) {
      if (chartInstances.ariTimeSeries) chartInstances.ariTimeSeries.destroy();

      chartInstances.ariTimeSeries = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.time_series.map(t => t.date.slice(5)),
          datasets: [{
            label: 'Airfare Price Index (ARI)',
            data: data.time_series.map(t => t.ari),
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.25)',
            fill: true,
            tension: 0.35,
            borderWidth: 3.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#ffffff', font: { weight: 'bold' } } },
            tooltip: {
              callbacks: {
                label: (context) => `ARI: ${context.parsed.y} points`
              }
            }
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.12)' }, ticks: { color: '#ffffff', font: { weight: 'bold' } } },
            y: { grid: { color: 'rgba(255,255,255,0.12)' }, ticks: { color: '#ffffff', font: { weight: 'bold' } } }
          }
        }
      });
    }
    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error(err);
  }
}

// 3. TRENDS VIEW
async function loadTrendsData() {
  try {
    const res = await fetch('/api/trends?period=daily');
    const data = await res.json();

    const ctx1 = document.getElementById('chartTrendsLine');
    if (ctx1) {
      if (chartInstances.trendsLine) chartInstances.trendsLine.destroy();
      chartInstances.trendsLine = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: data.trends.map(t => t.date.slice(5)),
          datasets: [
            { label: 'ARI Index', data: data.trends.map(t => t.ari), borderColor: '#38bdf8', borderWidth: 3.5, tension: 0.3 },
            { label: 'Average Fare (INR)', data: data.trends.map(t => t.avg_fare / 40), borderColor: '#a5b4fc', borderWidth: 3 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#ffffff', font: { weight: 'bold' } } } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.12)' }, ticks: { color: '#ffffff', font: { weight: 'bold' } } },
            y: { grid: { color: 'rgba(255,255,255,0.12)' }, ticks: { color: '#ffffff', font: { weight: 'bold' } } }
          }
        }
      });
    }

    const comp = data.comparison;
    document.getElementById('compPeriod1Label').innerText = comp.period_1_label;
    document.getElementById('compPeriod2Label').innerText = comp.period_2_label;
    document.getElementById('compPeriod1ARI').innerText = comp.period_1_ari;
    document.getElementById('compPeriod2ARI').innerText = comp.period_2_ari;
    document.getElementById('compARIDiff').innerText = (comp.ari_diff >= 0 ? '+' : '') + comp.ari_diff + ` (${comp.ari_diff_pct}%)`;

    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error(err);
  }
}

// 4. ROUTE ANALYSIS VIEW
async function loadRouteAnalysisData(selectedRoute = 'DEL-BOM') {
  try {
    const res = await fetch(`/api/routes-analysis?selected_route=${selectedRoute}`);
    const data = await res.json();

    const routeSelect = document.getElementById('selRouteExplorer');
    if (routeSelect && routeSelect.children.length === 0) {
      routeSelect.innerHTML = data.routes.map(r => `<option value="${r.route}">${r.route} (${r.observations} obs)</option>`).join('');
      routeSelect.onchange = (e) => loadRouteAnalysisData(e.target.value);
    }

    const detail = data.active_route_details;
    document.getElementById('rtName').innerText = detail.route;
    document.getElementById('rtAvgFare').innerText = '₹' + detail.average_fare.toLocaleString();
    document.getElementById('rtMedianFare').innerText = '₹' + detail.median_fare.toLocaleString();
    document.getElementById('rtMinFare').innerText = '₹' + detail.min_fare.toLocaleString();
    document.getElementById('rtMaxFare').innerText = '₹' + detail.max_fare.toLocaleString();

    const ctx = document.getElementById('chartRouteAirlines');
    if (ctx && data.airline_breakdown) {
      if (chartInstances.routeAirlines) chartInstances.routeAirlines.destroy();
      chartInstances.routeAirlines = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.airline_breakdown.map(a => a.airline),
          datasets: [{
            label: 'Average Fare (INR)',
            data: data.airline_breakdown.map(a => a.avg_fare),
            backgroundColor: ['rgba(56, 189, 248, 0.85)', 'rgba(2, 132, 199, 0.85)', 'rgba(165, 180, 252, 0.85)', 'rgba(52, 211, 153, 0.85)', 'rgba(251, 191, 36, 0.85)'],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#ffffff', font: { weight: 'bold' } } },
            y: { grid: { color: 'rgba(255,255,255,0.12)' }, ticks: { color: '#ffffff', font: { weight: 'bold' } } }
          }
        }
      });
    }

    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error(err);
  }
}

// 5. ROUTE HEATMAP (SVG MAP)
async function loadHeatmapData() {
  try {
    const res = await fetch('/api/heatmap');
    const data = await res.json();

    const svg = document.getElementById('svgIndiaMap');
    if (!svg) return;

    const project = (lat, lng) => {
      const x = ((lng - 68) / (96 - 68)) * 700 + 50;
      const y = 750 - ((lat - 8) / (35 - 8)) * 700;
      return { x, y };
    };

    let innerHTML = '';

    data.routes.forEach(r => {
      const p1 = project(r.origin_lat, r.origin_lng);
      const p2 = project(r.dest_lat, r.dest_lng);
      innerHTML += `
        <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" class="route-line" onclick="showRouteDetails('${r.route}', ${r.avg_fare}, ${r.ari}, ${r.dgca_weight})">
          <title>${r.route}: ₹${r.avg_fare} | ARI ${r.ari}</title>
        </line>
      `;
    });

    Object.keys(data.airports).forEach(code => {
      const ap = data.airports[code];
      const p = project(ap.lat, ap.lng);
      innerHTML += `
        <g class="airport-group" transform="translate(${p.x}, ${p.y})">
          <circle r="8" class="airport-node">
            <title>${code} - ${ap.city}: ${ap.total_observations} obs</title>
          </circle>
          <text y="-14" text-anchor="middle" class="airport-label">${code}</text>
        </g>
      `;
    });

    svg.innerHTML = innerHTML;
    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error(err);
  }
}

function showRouteDetails(route, fare, ari, weight) {
  const panel = document.getElementById('heatmapRoutePanel');
  if (!panel) return;
  panel.style.display = 'block';
  document.getElementById('hmRouteTitle').innerText = route;
  document.getElementById('hmRouteFare').innerText = '₹' + fare.toLocaleString();
  document.getElementById('hmRouteARI').innerText = ari;
  document.getElementById('hmRouteWeight').innerText = weight + '%';
}

// 6. FORECAST HORIZONS VIEW
async function loadForecastData() {
  try {
    const res = await fetch('/api/forecast');
    const data = await res.json();

    const tbody = document.getElementById('tblForecastHorizons');
    tbody.innerHTML = data.horizons.map(h => `
      <tr>
        <td><strong>${h.horizon}</strong></td>
        <td>₹${h.avg_fare.toLocaleString()}</td>
        <td>₹${h.median_fare.toLocaleString()}</td>
        <td style="font-family: var(--font-mono); font-weight:700;">${h.horizon_ari}</td>
        <td style="color: ${h.change_pct >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'}">${h.change_pct}%</td>
        <td>${h.observations}</td>
        <td><span class="badge badge-cyan">${h.confidence_score}% Confidence</span></td>
      </tr>
    `).join('');

    const ctx = document.getElementById('chartForecastBar');
    if (ctx) {
      if (chartInstances.forecastBar) chartInstances.forecastBar.destroy();
      chartInstances.forecastBar = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.horizons.map(h => h.horizon),
          datasets: [{
            label: 'Average Fare (INR)',
            data: data.horizons.map(h => h.avg_fare),
            backgroundColor: 'rgba(56, 189, 248, 0.85)',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#ffffff', font: { weight: 'bold' } } },
            y: { grid: { color: 'rgba(255,255,255,0.12)' }, ticks: { color: '#ffffff', font: { weight: 'bold' } } }
          }
        }
      });
    }

    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error(err);
  }
}

// 7. LEAD-TIME CURVE VIEW
async function loadLeadTimeData() {
  try {
    const res = await fetch('/api/lead-time');
    const data = await res.json();

    const ctx = document.getElementById('chartLeadTimeCurve');
    if (ctx) {
      if (chartInstances.leadTimeCurve) chartInstances.leadTimeCurve.destroy();
      chartInstances.leadTimeCurve = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.curve.map(c => `${c.lead_days}d`),
          datasets: [{
            label: 'Average Fare (INR)',
            data: data.curve.map(c => c.avg_fare),
            borderColor: '#fbbf24',
            backgroundColor: 'rgba(251, 191, 36, 0.25)',
            fill: true,
            tension: 0.4,
            borderWidth: 3.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#ffffff', font: { weight: 'bold' } } } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.12)' }, ticks: { color: '#ffffff', font: { weight: 'bold' } } },
            y: { grid: { color: 'rgba(255,255,255,0.12)' }, ticks: { color: '#ffffff', font: { weight: 'bold' } } }
          }
        }
      });
    }

    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error(err);
  }
}

// 8. FARE COMPONENTS VIEW
async function loadFareComponentsData() {
  try {
    const res = await fetch('/api/fare-components');
    const data = await res.json();

    const b = data.overall_breakdown;
    document.getElementById('compBasePct').innerText = b.base_fare_pct + '%';
    document.getElementById('compTaxPct').innerText = b.taxes_pct + '%';
    document.getElementById('compFeePct').innerText = b.fees_pct + '%';

    const ctx = document.getElementById('chartFareComponentsDonut');
    if (ctx) {
      if (chartInstances.fareDonut) chartInstances.fareDonut.destroy();
      chartInstances.fareDonut = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Base Fare', 'Taxes', 'Fees'],
          datasets: [{
            data: [b.base_fare_avg, b.taxes_avg, b.fees_avg],
            backgroundColor: ['#38bdf8', '#a5b4fc', '#fbbf24'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#ffffff', font: { weight: 'bold' } } } }
        }
      });
    }

    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error(err);
  }
}

// 9. DATA QUALITY VIEW
async function loadDataQuality() {
  try {
    const res = await fetch('/api/data-quality');
    const data = await res.json();

    document.getElementById('dqScore').innerText = data.quality_score;
    document.getElementById('dqCompleteness').innerText = data.metrics.completeness_pct + '%';
    document.getElementById('dqValidity').innerText = data.metrics.validity_pct + '%';
    document.getElementById('dqUniqueness').innerText = data.metrics.uniqueness_pct + '%';

    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error(err);
  }
}

// 10. SOURCES STATUS VIEW
async function loadSourcesStatus() {
  try {
    const res = await fetch('/api/sources-status');
    const data = await res.json();

    const container = document.getElementById('gridSourcesCards');
    container.innerHTML = data.sources.map(s => `
      <div class="glass-card">
        <div class="card-title">
          <span>${s.source_name}</span>
          <span class="badge badge-cyan">${s.status}</span>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${s.source_type}</p>
        <div style="font-family: var(--font-mono); font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem;">${s.observations_count.toLocaleString()} obs</div>
        <div style="font-size: 0.8rem; color: var(--accent-emerald);">Success Rate: ${s.success_rate}%</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">Last: ${s.last_scraped}</div>
      </div>
    `).join('');

    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error(err);
  }
}

// 11. 30-DAY VALIDATION VIEW
async function loadValidationData() {
  try {
    const res = await fetch('/api/validation-30day');
    const data = await res.json();

    document.getElementById('valMAE').innerText = '₹' + data.metrics.mae;
    document.getElementById('valMAPE').innerText = data.metrics.mape;
    document.getElementById('valRMSE').innerText = data.metrics.rmse;
    document.getElementById('valCorr').innerText = data.metrics.pearson_correlation;

    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error(err);
  }
}

// 12. DGCA COMPARISON VIEW
async function loadDGCAComparisonData() {
  try {
    const res = await fetch('/api/dgca-comparison');
    const data = await res.json();

    document.getElementById('dgcaAirflexARI').innerText = data.airflex_ari;
    document.getElementById('dgcaRefIndex').innerText = data.dgca_reference_index;
    document.getElementById('dgcaDiff').innerText = '+' + data.index_difference + ' pts';

    const ctx = document.getElementById('chartDGCAComparison');
    if (ctx) {
      if (chartInstances.dgcaChart) chartInstances.dgcaChart.destroy();
      chartInstances.dgcaChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Aug 01', 'Aug 05', 'Aug 10', 'Aug 15', 'Aug 20', 'Aug 25'],
          datasets: [
            { label: 'AIRFLEX ARI', data: [122.1, 124.5, 123.8, 126.2, 127.1, data.airflex_ari], borderColor: '#38bdf8', borderWidth: 3.5 },
            { label: 'DGCA Benchmark Reference', data: [120.2, 122.4, 121.9, 124.1, 125.2, data.dgca_reference_index], borderColor: '#a5b4fc', strokeDashArray: [5, 5], borderWidth: 2.5 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#ffffff', font: { weight: 'bold' } } } },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.12)' }, ticks: { color: '#ffffff', font: { weight: 'bold' } } },
            y: { grid: { color: 'rgba(255,255,255,0.12)' }, ticks: { color: '#ffffff', font: { weight: 'bold' } } }
          }
        }
      });
    }

    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error(err);
  }
}

// 13. RAW OBSERVATIONS & AUDIT TRACEABILITY
async function loadObservationsData(page = 1) {
  try {
    observationsPage = page;
    const search = document.getElementById('inpObsSearch')?.value || '';
    const res = await fetch(`/api/observations?page=${page}&limit=25&search=${encodeURIComponent(search)}`);
    const data = await res.json();

    const tbody = document.getElementById('tblObservations');
    tbody.innerHTML = data.observations.map(o => `
      <tr>
        <td style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-sky-bright);">${o.observation_id.slice(0, 12)}...</td>
        <td><span class="badge badge-blue">${o.source_name}</span></td>
        <td><strong>${o.airline}</strong></td>
        <td><span class="badge badge-cyan">${o.route}</span></td>
        <td>${o.travel_date}</td>
        <td style="font-family: var(--font-mono); font-weight:700; color: var(--accent-emerald);">₹${o.total_fare.toLocaleString()}</td>
        <td>
          <button class="btn-glass" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="openAuditModal('${o.observation_id}')">
            <span>🔍</span> Trace
          </button>
        </td>
      </tr>
    `).join('');

    document.getElementById('obsPageInfo').innerText = `Page ${data.page} of ${data.pages} (${data.total.toLocaleString()} obs)`;

    window.dispatchEvent(new Event('scroll'));
  } catch (err) {
    console.error(err);
  }
}

async function openAuditModal(obsId) {
  try {
    const res = await fetch(`/api/traceability/${obsId}`);
    const data = await res.json();

    const modal = document.getElementById('modalAuditTrace');
    modal.style.display = 'flex';

    document.getElementById('modalObsID').innerText = data.observation_id;
    document.getElementById('modalTraceContent').innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <h4 style="color: var(--accent-sky-bright); margin-bottom: 0.5rem;">Step 1: Raw Observation Scraped Payload</h4>
        <div class="glass-card" style="font-family: var(--font-mono); font-size: 0.8rem;">
          Source: ${data.step_1_raw.source_name} (${data.step_1_raw.source_type})<br>
          Raw Fare: ${data.step_1_raw.raw_fare_text}<br>
          Scraped At: ${data.step_1_raw.scraped_at}<br>
          Scraper Version: ${data.step_1_raw.scraper_version}
        </div>
      </div>
      <div style="margin-bottom: 1.5rem;">
        <h4 style="color: var(--accent-sky); margin-bottom: 0.5rem;">Step 2: Cleaning & Normalization Steps</h4>
        ${data.step_2_cleaning.map(c => `
          <div style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.12); font-size: 0.85rem;">
            <strong>${c.transform}</strong>: ${c.detail}
          </div>
        `).join('')}
      </div>
      <div style="margin-bottom: 1.5rem;">
        <h4 style="color: var(--accent-violet); margin-bottom: 0.5rem;">Step 3: Validated Observation</h4>
        <div class="glass-card" style="font-size: 0.85rem;">
          Airline: ${data.step_3_clean_observation.airline} (${data.step_3_clean_observation.flight_number})<br>
          Route: ${data.step_3_clean_observation.route} | Date: ${data.step_3_clean_observation.travel_date}<br>
          Base: ₹${data.step_3_clean_observation.base_fare} + Tax: ₹${data.step_3_clean_observation.taxes} + Fee: ₹${data.step_3_clean_observation.fees} = Total: ₹${data.step_3_clean_observation.total_fare}
        </div>
      </div>
      <div>
        <h4 style="color: var(--accent-emerald); margin-bottom: 0.5rem;">Step 4: Airfare Price Index Contribution</h4>
        <div class="glass-card" style="font-family: var(--font-mono); font-size: 0.9rem;">
          DGCA Route Weight: ${data.step_4_ari_contribution.dgca_route_weight}%<br>
          Normalized Route Fare Index: ${data.step_4_ari_contribution.normalized_route_fare_index}<br>
          Exact Contribution to National ARI: <strong style="color: var(--accent-emerald);">+${data.step_4_ari_contribution.exact_ari_contribution} points</strong>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
  }
}

function closeModal() {
  document.getElementById('modalAuditTrace').style.display = 'none';
}

function loadMethodologyData() {
}

async function testAPIEndpoint(endpoint) {
  const output = document.getElementById('apiResponseOutput');
  output.innerText = 'Executing GET ' + endpoint + ' ...';
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    output.innerText = JSON.stringify(data, null, 2);
  } catch (err) {
    output.innerText = 'Error: ' + err.message;
  }
}

function setupEventListeners() {
  const searchInp = document.getElementById('inpObsSearch');
  if (searchInp) {
    searchInp.addEventListener('keyup', () => loadObservationsData(1));
  }
}
