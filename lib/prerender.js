/* global document */
const dom = require('express-dom');


module.exports = function(name) {
	return dom((mw, settings, req) => {
		if (req.query.develop !== undefined) {
			delete req.query.develop;
			settings.load.disable = true;
		}
		settings.view = name;
	}).prepare().load();
};

module.exports.configure = function(config) {
	dom.settings.allow = 'same-origin';
	dom.settings.display = config.display;
	dom.settings.max = 8;
	dom.settings.stall = 10000;
	dom.settings.views = config.statics;
	dom.settings.prepare.plugins = [
		mergeConfig,
		dom.plugins.mount,
		dom.plugins.hide,
		dom.plugins.noreq,
		dom.plugins.html
	];
	dom.settings.load.plugins = [
		dom.plugins.hide,
		dom.plugins.nomedia,
		dom.plugins.prerender,
		fragmentHtml,
		dom.plugins.html
	];
};


function fragmentHtml(page, settings, req, res) {
	const frag = req.query.fragment;
	if (!frag) return; // let it be
	page.when('idle', function() {
		return page.run((fragment, done) => {
			const root = document.documentElement;
			const result = [];
			const nsocketConfig = document.getElementById('nsocket');
			if (nsocketConfig) result.push(nsocketConfig.outerHTML);
			const frag = root.querySelector(fragment);
			if (!frag) return done(400);
			result.push(frag.outerHTML);
			done(null, result.join('\n'));
		}, frag).then((str) => {
			settings.output = str;
		});
	});
}

function mergeConfig(page, settings, req) {
	page.when('ready', function() {
		return page.run(function(thumbnailer, opta, view) {
			const icon = document.querySelector('head > link[rel="shortcut icon"]');
			if (icon) icon.href = `/img/${view}.ico`;

			if (thumbnailer) {
				const metaThumb = document.getElementById('thumbnailer');
				if (metaThumb) metaThumb.content = thumbnailer;
			}
			const metaOpta = document.getElementById('opta-customer-id');
			if (metaOpta) {
				if (opta) metaOpta.content = opta;
				else metaOpta.remove();
			}
		}, req.app.settings.thumbnailer, req.app.settings.opta, req.domain.view).catch(function(err) {
			console.error(err); // eslint-disable-line
		});
	});
}

