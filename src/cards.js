import DS from './ds.js';

import bind from '../lib/bind.js';

import {
	svg_interval,
} from './utils.js';

import {
	points_symbol,
	lines_symbol,
	polygons_symbol,
	lines_legends_svg,
	points_legends_svg,
	polygons_legends_svg,
} from './symbols.js';

import {
	left_panel,
	sort,
} from './a.js';

const cards_list = qs('#cards-list');

const slider_width = 472;

async function mutant_options() {
	const d = this.ds;

	await until(_ => d.hosts.every(x => x instanceof DS));

	const container = ce('div', null, { "class": 'control-option' });
	const select = ce('select');

	d.hosts.forEach(d => select.append(ce('option', d.name, { "value": d.id })));

	select.value = d.host.id;

	select.onchange = e => {
		const host = DST.get(e.target.value);

		d.selection = [e.target.value];

		d.mutate(host)
			.then(_ => COMMIT("layers"));
	};

	container.append(select);

	this.mutant_options = container;
	qs('.mutant-options', this).append(this.mutant_options);
};

function value_multiselect() {
	const ds = this.ds;

	const inputs = ds.csv.data.map(x => {
		const k = x['KEY'];

		const i = ce('input', null, { "type": 'checkbox', "name": "", "value": k });
		i.checked = (!this.multiselection.length ? true : this.multiselection.indexOf(k) > -1);
		i.id = ds.id + "_" + k;

		i.onchange = _ => {
			this.multiselection = [...new Set(inputs.filter(e => e.checked).map(e => +e.value))];
			ds._domain_select = this.multiselection;
			ds._domain = Object.assign({}, ds.domain);
		};

		return i;
	});

	this.multiselection = this.multiselection.length ? this.multiselection : [...new Set(inputs.map(e => +e.value))];

	ds._domain_select = this.multiselection;

	const elements = inputs.map((e,i) => {
		const c = ds.colorscale.fn(+e.value);
		const s = ce('span', null, { "style": `width: 20px; height: 14px; display: inline-block; background-color: rgba(${c}); margin: auto 1em;` });

		const l = ce('label', s, { "for": e.id });
		l.append(ds.csv.data[i]['VALUE']);

		return ce('div', [e,l]);
	});

	return {
		elements,
	};
};

function range() {
	const ds = this.ds;
	const cat = this.ds.category;

	let {min,max} = ds.domain;

	const diff = Math.abs(max - min);
	let f = 3 - Math.ceil(Math.log10(diff || 1));
	if (f < 0) f = 0;

	if (and(cat.unit === "%",
	        or(and(min === 0, max === 100),
	           and(min === 100, max === 0)))) f = 0;

	const step = maybe(ds, 'raster', 'intervals') ? undefined :
		0.1 * Math.pow(10, Math.floor(Math.log10(Math.abs(max - min))));

	const input_change = (e,i) => {
		const v = +e.value;
		const d = ds._domain;

		if (or(
			v < min,
			v > max,
			and(i === 'min', v > d['max']),
			and(i === 'max', v < d['min']),
		)) {
			e.reportValidity();
			e.setCustomValidity("Value out of range");
			return;
		}

		d[i] = v;

		this.values();
	};

	this.manual_min = ce('input', null, {
		"type":    "number",
		"min":     min,
		"max":     max,
		"step":    step,
		"value":   ds._domain.min,
	});

	this.manual_min.oninput = debounce(input_change.bind(null, this.manual_min, 'min'), 600);

	this.manual_max = ce('input', null, {
		"type":  "number",
		"min":   min,
		"max":   max,
		"step":  step,
		"value": ds._domain.max,
	});

	this.manual_max.oninput = debounce(input_change.bind(null, this.manual_max, 'max'), 600);

	switch (maybe(cat, 'controls', 'range')) {
	case 'single':
		this.manual_min = null;
		break;

	case 'double':
		break;

	case null:
	case 'none':
	default:
		this.manual_min = null;
		this.manual_max = null;
		break;
	}

	let steps;
	if (maybe(cat, 'controls', 'range_steps')) {
		steps = [];
		const s = (max - min) / (cat.controls.range_steps - 1);

		for (let i = 0; i < cat.controls.range_steps; i += 1)
			steps[i] = min + (s * i);
	}

	const svg_change = (v, i) => {
		const d = ds._domain;
		d[i] = this.ds.fn.invert(parseFloat(v));
	};

	this.range_svg = svg_interval({
		"colors":       ds.colorscale?.stops,
		"sliders":      ds.category.controls.range,
		"width":        slider_width,
		"radius":       12,
		"height":       10,
		"init":         {
			"min": this.ds.fn(ds._domain.min),
			"max": this.ds.fn(ds._domain.max),
		},
		"steps":        steps,
		"callback1":    v => svg_change(v, 'min'),
		"callback2":    v => svg_change(v, 'max'),
		"end_callback": _ => {
			this.values();
			COMMIT("datasets");
		},
	});

	return {
		"elements": [this.range_svg.svg],
		"svg":      this.range_svg.svg,
	};
};

function weight_group() {
	if (!this.category.controls.weight) return null;

	const el = ce('select', null, { "bind": 'weight' });

	el.prepend(
		...["Low", "Low-Medium", "Medium", "Medium-High", "High"]
			.map((e,i) => ce('option', e, { "value": i + 1 }))
			.reverse());

	el.value = this.weight;

	el.onchange = e => {
		this.weight = +e.target.value;
		COMMIT("datasets");
	};

	return el;
};

function range_el() {
	const ds = this.ds;
	const cat = this.ds.category;

	let d = ce('div', null, { "class": "range-el" });
	let e = "";
	let r = "";
	let o = "";
	let g = undefined;

	function ramp_domain() {
		let {min,max} = ds.domain;

		const diff = Math.abs(max - min);
		let i = 3 - Math.ceil(Math.log10(diff || 1));
		if (i < 0) i = 0;

		if (and(cat.unit === "%",
		        or(and(min === 0, max === 100),
		           and(min === 100, max === 0)))) i = 0;

		const u = coalesce(cat.controls.range_label, cat.unit, 'range');

		return [
			ce('div', min.toFixed(i)),
			ce('div', u, { "class": "unit-ramp" }),
			ce('div', max.toFixed(i)),
		];
	};

	switch (ds.type) {
	case 'points-timeline': {
		e = points_symbol({
			"size":        24,
			"fill":        ds.vectors.fill,
			"stroke":      ds.vectors.stroke,
			"strokewidth": 2,
		});
		break;
	}

	case 'points': {
		if (ds.raster)
			g = range.call(this);

		e = points_symbol({
			"size":        24,
			"fill":        ds.vectors.fill,
			"stroke":      ds.vectors.stroke,
			"strokewidth": 2,
		});
		break;
	}

	case 'lines-timeline': {
		e = lines_symbol({
			"size":        24,
			"fill":        ds.vectors.fill,
			"stroke":      ds.vectors.stroke,
			"strokewidth": 2,
		});
		break;
	}

	case 'lines': {
		if (ds.raster)
			g = range.call(this);

		e = lines_symbol({
			"size":      28,
			"dasharray": ds.vectors.dasharray,
			"stroke":    ds.vectors.stroke,
			"width":     ds.vectors.width * 2,
			"fill":      'none',
		});
		break;
	}

	case 'polygons-boundaries': {
		e = polygons_symbol({
			"size":        28,
			"fill":        ds.vectors.fill,
			"opacity":     ds.vectors.opacity,
			"stroke":      ds.vectors.stroke,
			"strokewidth": (ds.vectors.width - 1) || 1,
		});
		break;
	}

	case 'polygons': {
		if (ds.raster)
			g = range.call(this);

		e = polygons_symbol({
			"size":        28,
			"fill":        ds.vectors.fill,
			"opacity":     ds.vectors.opacity,
			"stroke":      ds.vectors.stroke,
			"strokewidth": (ds.vectors.width - 1) || 1,
		});
		break;
	}

	case 'polygons-valued': {
		g = range.call(this);

		o = ce(
			'span',
			[
				ce('div', null, {
					"style": `
	display: inline-block;
	width: 64px;
	height: 5px;
	background-color: rgba(155,155,155,1);
	margin: 15px 15px 0 0;
	`,
				}),
				ce('div', "Not Available", { "style": "display: inline-block; font-size: x-small;" }),
			]);

		break;
	}

	case 'raster-valued-mutant':
	case 'raster-valued':	{
		if (this.ds._domain_select)
			g = value_multiselect.call(this);

		break;
	}

	case 'raster-mutant':
	case 'raster-timeline':
	case 'raster': {
		g = range.call(this);

		break;
	}

	case 'polygons-timeline': {
		g = range.call(this);

		e = polygons_symbol({
			"size":        28,
			"fill":        ds.vectors.fill,
			"opacity":     ds.vectors.opacity,
			"stroke":      ds.vectors.stroke,
			"strokewidth": (ds.vectors.width - 1) || 1,
		});
		break;
	}

	case 'table': {
		qs('content', this).remove();
		break;
	}

	default: {
		console.warn("dscard.range_el could not decide type.", ds.id);
		break;
	}
	}

	if (ds.domain && !ds._domain_select) {
		r = tmpl('#ramp');
		qs('.ramp', r).append(...ramp_domain.call(this));
	}

	this.range = g;

	d.append(
		...coalesce(maybe(this.range, 'elements'), []),
		coalesce(r, ""),
		coalesce(o, ""),
		coalesce(this.legends(), e, ""),
	);

	return d;
};

export function init() {
	sortable(cards_list, {
		'items':                'ds-card',
		'forcePlaceholderSize': true,
		'placeholder':          '<div style="margin: 1em;"></div>',
	})[0]
		.addEventListener('sortupdate', _ => {
			sort(maybe(sortable(cards_list, 'serialize'), 0, 'items').map(c => c.node.ds));
			COMMIT();
		});

	const ca = ce('button', 'Remove all datasets', { "style": "color: #c30000;" });
	ca.onclick = _ => {
		STATE.datasets.forEach(x => x.turn(false));
		COMMIT("datasets");
		update();
	};

	const cs = ce('button', 'Show all layers');
	cs.onclick = _ => {
		STATE.datasets.forEach(x => x.visibility(true));
	};

	const cv = ce('button', 'Hide all layers');
	cv.onclick = _ => {
		STATE.datasets.forEach(x => x.visibility(false));
	};

	const cp = ce('button', 'Reset all settings');
	cp.onclick = _ => {
		STATE.datasets.forEach(d => {
			d._domain = Object.assign({}, d.domain);
			COMMIT("datasets");
		});
	};

	qs('#cards #cards-buttons').append(cs,cv,cp,ca);
};

export function update() {
	const list = STATE.datasets
		.map(d => d.card);

	if (list.length) sortable(cards_list, 'disable');

	for (let i of list) {
		cards_list.append(i);
	}

	if (list.length) sortable(cards_list, 'enable');
};

export default class dscard extends HTMLElement {
	manual_min;
	manual_max;
	multiselection = [];

	constructor(d) {
		if (!(d instanceof DS)) throw new Error(`dscard: Expected a ds but got ${d}`);
		super();

		if (d.disabled) return undefined;

		this.ds = d;

		this.opacity_value = 1;

		this.show_advanced = false;

		this.render();

		return this;
	};

	render() {
		this.content = qs('content', this);

		this.weight_group = weight_group.call(this.ds);

		if (this.ds.hosts) mutant_options.call(this);

		this.append(tmpl('#ds-card-template'));

		bind(this, Object.assign({}, this.ds, {
			"range":          range_el.call(this),
			"info":           _ => this.ds.info_modal(),
			"visibility":     (_, e) => this.ds.visibility(e.target.checked),
			"opacity":        this.opacity(),
			"close":          _ => { this.ds.turn(false); COMMIT("datasets"); },
			"weight-group":   this.weight_group,
			"settings":       _ => { qs('aside', this).style.display = (this.show_advanced = !this.show_advanced) ? 'block' : 'none'; },
			"table":          _ => this.ds.features_table_modal(),
			"has-geojson":    maybe(this.ds, 'vectors', 'geojson'),
			"manual-min":     this.manual_min,
			"manual-max":     this.manual_max,
			"mutant-options": this.mutant_options,
		}), { "final": false });

		return this;
	};

	disable() {
		this.remove();
	};

	values(d) {
		if (d === undefined) d = this.ds._domain;

		this.manual_min.value = d['min'];
		this.manual_max.value = d['max'];

		if (!this.range_svg) return;

		this.range_svg.change({
			"min": this.ds.fn(d['min']),
			"max": this.ds.fn(d['max']),
		});

		COMMIT("datasets");
	};

	legends() {
		if (!this.ds.criteria || this.ds.criteria.length < 2) return;

		const ul = ce('table', null, { "class": "legends-list" });

		let f;
		switch (this.ds.type) {
		case "lines":
			f = lines_legends_svg;
			break;

		case "points":
			f = points_legends_svg;
			break;

		case "polygons":
			f = polygons_legends_svg;
			break;

		default:
			break;
		}

		this.checkboxes = [];

		for (let l of this.ds.criteria) {
			let cb;

			const li = ce('tr', [
				ce('td', f.call(this, l)),
				ce('td', l.params.map(p => l[p] ?? 'default').join(", ")),
				ce('td', cb = ce('input', null, { "type": 'checkbox' })),
			]);

			cb.onchange = _ => {
				const fs = this.ds.vectors.geojson.features;

				for (let i = 0; i < fs.length; i += 1)
					if (same(fs[i].properties['__criteria'], l))
						fs[i].properties['__visible'] = cb.checked;

				this.ds.selection = this.checkboxes
					.filter(c => c[1].checked)
					.map(c => c[0] || 'default');

				MAPBOX.getSource(this.ds.id).setData(this.ds.vectors.geojson);
			};

			const id = l[l.params[0]] || 'default';
			cb.checked = this.ds.selection ? this.ds.selection.includes(id) : true;

			this.checkboxes.push([id, cb]);

			ul.append(li);
		}

		return ul;
	};

	opacity() {
		return svg_interval({
			"init":         { "min": 0, "max": this.opacity_value },
			"sliders":      'single',
			"callback2":    x => {
				this.opacity_value = x;
				this.ds.opacity(x);
			},
		}).svg;
	};

	discover() {
		left_panel('cards');
		this.scrollIntoView();
	}
};

customElements.define('ds-card', dscard);
