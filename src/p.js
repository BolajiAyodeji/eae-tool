export async function init() {
	const u = new URL(location);
	const keys = Array.from(u.searchParams.keys());

	const TOOL = window.BASE + '/tool';

	if (keys.length !== 1) window.location = TOOL + '/s';
	if (!keys[0].match(/[0-9]{13}/)) window.location = TOOL + '/s';

	const stamp = keys[0];

	await API.get('snapshots', {
		"time":   `eq.${stamp}`,
		"select": `*,session:sessions(geography_id)`,
	}, { "one": true })
		.catch(_ => {})
		.then(r => {
			sessionStorage.removeItem('config');

			const gid = r['session']['geography_id'];
			window.location = TOOL + `/a?id=${gid}&snapshot=${stamp}`;
		});
};
