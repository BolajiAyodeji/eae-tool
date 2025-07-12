import bind from '../lib/bind.js';

import modal from '../lib/modal.js';

import {
	enough_datasets,
	analysis_colorscale_svg,
} from './analysis.js';

import {
	svg_interval,
	bi_icon,
} from './utils.js';

export let opacity = 1;

export let shown = true;

function variants() {
	const s = qs('#output-variant-select');
	let u = "m²";
	let r = GEOGRAPHY.resolution;

	if ((r % 1000) === 0) {
		u = "km²";
		r = r / 1000;
	}
	s.append(ce('option', `Raster Analysis - ${r}${u}`, { "value": "raster" }));

	GEOGRAPHY.divisions.forEach((d,i) => {
		if (i === 0) return;
		s.append(ce('option', `Administrative Priority - ${d.name}`, { "value": i }));
	});

	s.value = STATE.variant;
	s.onchange = _ => {
		STATE.variant = s.value;
		COMMIT("datasets");
	};
};

function toggle_init() {
	const checkbox = qs('#output-on-map');

	checkbox.onchange = _ => {
		shown = checkbox.checked;
		COMMIT();
	};
};

export function opacity_init() {
	const control = svg_interval({
		"init":      { "min": 0, "max": 1 },
		"sliders":   'single',
		"height":    8,
		"radius":    10,
		"callback2": x => {
			opacity = x;
			COMMIT();
		},
	});

	qs('#output-opacity').append(control.svg);
};

function ramp() {
	qs('#output-ramp').append(
		analysis_colorscale_svg,
		bind(tmpl('#ramp'), {
			"left":   "Low",
			"middle": "Medium",
			"right":  "High",
		}),
	);
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
	toggle_init();
	opacity_init();
	index_info();
	ramp();
};
