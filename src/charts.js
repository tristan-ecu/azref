import Chart from 'chart.js/auto';

// Data and encodings ported from ref_viz.html
const TOTAL_QUERIES = 351;

const SOURCES = [
	// [label, # queries, kind]
	['report (group)', 68, 'src'],
	['class/intranet', 45, 'src'],
	['photo/stock img', 38, 'src'],
	['book', 36, 'src'],
	['journal article', 29, 'src'],
	['ppt/slideshow', 26, 'spec'],
	['chap in ed book', 20, 'src'],
	['figure/appendix', 18, 'spec'],
	['statute (act)', 17, 'src'],
	['personal comm', 17, 'src'],
];
// Variations of the accents #26b298 and #af1d75, with the lightness adjusted so both clear
// 3:1 against the dark slide and stay distinct under colour-vision deficiency
const KIND_COLORS = { src: '#14aa90', spec: '#c13284' };

const MECHANICS = [
	'end-text (140)',
	'in-text (107)',
	'list check (63)',
	'doi/url (17)',
	'2° cite (15)',
	'quote (15)',
	'line/space (13)',
	'timestamp (11)',
];

const SOURCES_X_MECHANICS = [
	// [row label, co-occurrence counts, % of row's queries]
	['report (group) (68)', [33, 25, 14, 5, 0, 3, 0, 1], [49, 37, 21, 7, 0, 4, 0, 1]],
	['class/intranet (45)', [22, 19, 3, 1, 0, 1, 1, 8], [49, 42, 7, 2, 0, 2, 2, 18]],
	['photo/stock img (38)', [22, 12, 3, 0, 0, 0, 1, 0], [58, 32, 8, 0, 0, 0, 3, 0]],
	['book (36)', [14, 9, 3, 2, 2, 3, 1, 0], [39, 25, 8, 6, 6, 8, 3, 0]],
	['journal article (29)', [12, 7, 5, 8, 7, 0, 0, 0], [41, 24, 17, 28, 24, 0, 0, 0]],
	['chap in ed book (20)', [14, 5, 3, 1, 1, 0, 0, 0], [70, 25, 15, 5, 5, 0, 0, 0]],
	['statute (act) (17)', [11, 12, 1, 0, 0, 0, 0, 0], [65, 71, 6, 0, 0, 0, 0, 0]],
	['personal comm (17)', [7, 8, 1, 0, 0, 1, 1, 2], [41, 47, 6, 0, 0, 6, 6, 12]],
	['edited book (14)', [11, 3, 3, 1, 0, 0, 0, 0], [79, 21, 21, 7, 0, 0, 0, 0]],
	['software/app (14)', [9, 4, 2, 0, 0, 0, 0, 0], [64, 29, 14, 0, 0, 0, 0, 0]],
	['webpage (13)', [9, 4, 2, 0, 0, 2, 0, 0], [69, 31, 15, 0, 0, 15, 0, 0]],
	['chatgpt/llm (12)', [4, 4, 1, 0, 0, 0, 0, 1], [33, 33, 8, 0, 0, 0, 0, 8]],
	['unpub manu (11)', [6, 7, 0, 0, 1, 0, 0, 1], [55, 64, 0, 0, 9, 0, 0, 9]],
	['yt/stream vid (8)', [4, 4, 2, 0, 0, 1, 0, 3], [50, 50, 25, 0, 0, 12, 0, 38]],
];

Chart.defaults.color = '#d4d6db';
// Basel's chart text size
Chart.defaults.font.size = 12;
const tooltip = { backgroundColor: '#1a1f28', titleColor: '#f5f5f5', bodyColor: '#f5f5f5' };

// The legend and caption centre on a chart's plot area (its x-axis) rather than the whole
// chart column, which also holds the y-axis labels: slides.css reads these insets, which
// are measured from the chart column's edges
function setPlotInset(element, left, right) {
	const slide = element.closest('section');
	slide.style.setProperty('--plot-left', `${Math.max(0, left)}px`);
	slide.style.setProperty('--plot-right', `${Math.max(0, right)}px`);
}
const plotInset = {
	id: 'plotInset',
	afterLayout: (chart) =>
		setPlotInset(chart.canvas, chart.chartArea.left, chart.width - chart.chartArea.right),
};

function sourcesChart(canvas) {
	return new Chart(canvas, {
		type: 'bar',
		data: {
			labels: SOURCES.map(([label]) => label),
			datasets: [
				{
					data: SOURCES.map(([, n]) => n),
					backgroundColor: SOURCES.map(([, , kind]) => KIND_COLORS[kind]),
					borderWidth: 0,
				},
			],
		},
		options: {
			indexAxis: 'y',
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { display: false },
				tooltip: {
					...tooltip,
					callbacks: {
						label: (ctx) =>
							`${ctx.parsed.x} queries (${Math.round((100 * ctx.parsed.x) / TOTAL_QUERIES)}%)`,
					},
				},
			},
			scales: {
				x: {
					beginAtZero: true,
					max: 70,
					ticks: { color: '#a0a4ab' },
					grid: { color: 'rgba(255,255,255,0.06)' },
				},
				y: { ticks: { color: '#e8e9ec' }, grid: { display: false } },
			},
		},
		plugins: [plotInset],
	});
}

// One-hue ramp of the #26b298 accent, darker for lower %; the darkest step still clears
// 2:1 against the slide, and each step's text clears 5:1
function shade(p) {
	if (p === 0) return { bg: 'transparent', fg: '#5a5d63' };
	if (p <= 10) return { bg: '#025749', fg: '#f0f4f3' };
	if (p <= 25) return { bg: '#017462', fg: '#f0f4f3' };
	if (p <= 40) return { bg: '#03a38a', fg: '#0e1116' };
	if (p <= 55) return { bg: '#50d0b5', fg: '#0e1116' };
	return { bg: '#c2f0e3', fg: '#0e1116' };
}

function buildHeatmap(table, columns, rows) {
	const headRow = table.createTHead().insertRow();
	headRow.appendChild(document.createElement('th')).className = 'row-label';
	columns.forEach((label) => {
		const th = headRow.appendChild(document.createElement('th'));
		th.className = 'col-header';
		th.innerHTML = `<span>${label}</span>`;
	});

	const body = table.createTBody();
	rows.forEach(([label, counts, pct]) => {
		const tr = body.insertRow();
		const th = tr.appendChild(document.createElement('th'));
		th.className = 'row-label';
		th.textContent = label;
		th.title = label;
		counts.forEach((c, j) => {
			const td = tr.insertCell();
			const s = shade(pct[j]);
			td.innerHTML = `<div class="n">${c}</div><div class="p">${pct[j]}%</div>`;
			td.style.background = s.bg;
			td.style.color = s.fg;
		});
	});
}

export function initCharts(deck) {
	// A canvas doesn't inherit the page's font, so give Chart.js the deck's
	const font = getComputedStyle(deck.getRevealElement()).fontFamily;
	Chart.defaults.font.family = font;

	// reveal.js scales the whole slide with a CSS transform: render canvases at that
	// scale so they stay sharp, and size them from the container's layout size (Chart.js
	// otherwise measures the transformed size and overflows)
	const charts = [sourcesChart(document.getElementById('chart-sources'))];
	const rescale = () =>
		charts.forEach((chart) => {
			const { clientWidth, clientHeight } = chart.canvas.parentNode;
			chart.options.devicePixelRatio = (window.devicePixelRatio || 1) * deck.getScale();
			chart.resize(clientWidth, clientHeight);
		});
	rescale();
	deck.on('resize', rescale);
	// Nor does it redraw when a web font arrives, so redraw once the font has loaded
	document.fonts.load(`1em ${font}`).then(() => charts.forEach((chart) => chart.update('none')));

	const heatmap = document.getElementById('heatmap-mechanics');
	buildHeatmap(heatmap, MECHANICS, SOURCES_X_MECHANICS);
	// The heatmap's plot area is everything right of the row labels. Measured whenever that
	// column changes size, since it has no size until its slide is first shown
	const rowLabels = heatmap.tHead.rows[0].cells[0];
	new ResizeObserver(() => setPlotInset(heatmap, rowLabels.offsetWidth, 0)).observe(rowLabels);
}
