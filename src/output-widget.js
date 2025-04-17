import {
	enough_datasets,
} from './analysis.js';

import modal from '../lib/modal.js';

import {
	analysis_colorscale_svg,
} from './analysis.js';

import {
	svg_interval,
	bi_icon,
} from './utils.js';

function variants() {
	const variant_select = qs('#output-variant-select');

	GEOGRAPHY.divisions.forEach((d,i) => {
		if (i === 0) return;
		variant_select.append(ce('option', `Administrative Priority - ${d.name}`, { "value": i }));
	});

	variant_select.value = STATE.variant;
	variant_select.onchange = _ => {
		STATE.variant = variant_select.value;
		COMMIT("datasets");
	};
};

function toggle() {
	const checkbox = qs('#output-on-map');

	checkbox.onchange = function() {
		if (!MAPBOX.getLayer('output-layer')) return;

		const v = this.checked;
		if (v) MAPBOX.moveLayer('output-layer', MAPBOX.first_symbol);

		COMMIT(v ? "output" : "no-output");
	};
};

function opacity() {
	const container = qs('#output-opacity');

	function paint(x) {
		if (!MAPBOX.getLayer('output-layer')) return;

		MAPBOX.setPaintProperty('output-layer', 'raster-opacity', x);
	};

	const input = qs('#output-opacity-input');

	const control = svg_interval({
		"width":        420,
		"init":         { "min": 0, "max": 1 },
		"sliders":      'single',
		"callback2":    x => {
			paint(x);
			input.value = Math.round(x * 100);
		},
	});

	input.onchange = _ => control.change({ "min": 0, "max": +((input.value / 100).toFixed(2)) });

	container.append(control.svg);
};

function ramp() {
	const r = tmpl('#ramp');

	qs('.ramp', r).append(
		ce('div', "Low"),
		ce('div', "Medium"),
		ce('div', "High"),
	);

	qs('#output-ramp').append(analysis_colorscale_svg, r);
};

function index_info() {
	const info = qs('#index-info');

	info.append(bi_icon('info-circle'));
	info.onclick = function() {
		const c = ce('div');

		for (let i in EAE['indexes']) {
			c.append(
				ce('h3', EAE['indexes'][i]['name']),
				ce('p', EAE['indexes'][i]['info']),
			);
		}

		new modal({
			"id":      'indexes-modal',
			"header":  "Indexes Descriptions",
			"content": c,
			"footer":  ce('a', "See technical note for more detailed methodology", {
				"style": "text-align: right; display: block;",
				"href":  "https://www.wri.org/publication/energy-access-explorer-data-and-methods",
			}),
			"destroy": true,
		}).show();
	};
};

export function indexes() {
	const nodes = [];

	const select = qs('#index-select');
	select.replaceChildren();

	function i_elem(t, v) {
		const d = ce('option',  v, { "value": t });

		if (!enough_datasets(t))
			d.setAttribute('disabled', "");

		return d;
	};

	for (let t in EAE['indexes'])
		nodes.push(i_elem(t, EAE['indexes'][t]['name'], EAE['indexes'][t]['description']));

	select.append(...nodes);

	select.value = STATE.index;

	select.onchange = function() {
		STATE.index = this.value;
		COMMIT("datasets");
	};
};

export function init() {
	variants();
	indexes();
	toggle();
	opacity();
	index_info();
	ramp();
};
