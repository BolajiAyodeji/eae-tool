export function points_symbol({size, fill, stroke, strokewidth}) {
	const svg = d3.create('svg')
		.attr('class', 'svg-point')
		.attr('width', size)
		.attr('height', size);

	svg
		.append('circle')
		.attr('r', (size/2) - 2)
		.attr('cx', size/2)
		.attr('cy', size/2)
		.attr('fill', fill)
		.attr('stroke', stroke)
		.attr('stroke-width', strokewidth);

	return svg.node();
};

export function lines_symbol({size, dasharray, stroke, fill, strokewidth = 1}) {
	const svg = d3.create('svg')
		.attr('width', size)
		.attr('height', size);

	svg
		.append('path')
		.attr('d', "M 0.5625,23.71875 C 2.0625,8.0625 14.439788,10.706994 17.625,7.5 20.810212,4.2930056 23.71875,0.375 23.71875,0.375")
		.attr('fill', fill)
		.attr('stroke-dasharray', dasharray)
		.attr('stroke', stroke)
		.attr('stroke-width', strokewidth * 2);

	return svg.node();
};

export function polygons_symbol({size, stroke, strokewidth, fill, opacity}) {
	const svg = d3.create('svg')
		.attr('class', 'svg-polygon')
		.attr('style', "vertical-align: middle;")
		.attr('width', size)
		.attr('height', size);

	svg
		.append('path')
		.attr('d', "M 5.5532202,7.3474994 24.062506,2.1642083 26.51526,25.827 1.3896115,25.827438 Z")
		.attr('fill', fill ?? 'none')
		.attr('fill-opacity', opacity)
		.attr('stroke', stroke)
		.attr('stroke-width', strokewidth);

	return svg.node();
};

export function lines_legends_svg(l) {
	return lines_symbol({
		"size":             22,
		"fill":             'none',
		"stroke":           l['stroke'] || 'black',
		"stroke-width":     l['stroke-width'],
		"stroke-dasharray": l['dasharray'],
	});
};

export function points_legends_svg(l) {
	return points_symbol({
		"size":         18,
		"fill":         this.ds.vectors.fill,
		"stroke":       l['stroke'] || 'black',
		"stroke-width": l['stroke-width'],
	});
};

export function polygons_legends_svg(l) {
	return polygons_symbol({
		"size":   24,
		"fill":   this.ds.vectors.fill,
		"stroke": l['stroke'],
	});
};
