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

	dom.settings.prepare.plugins.unshift(dom.plugins.mount);

	dom.settings.prepare.plugins.unshift(function(page, settings, req) {
		page.when('ready', function() {
			return page.run(function(config, view) {
				const icon = document.querySelector('head > link[rel="shortcut icon"]');
				if (icon) icon.href = `/img/${view}.ico`;

				if (config.thumbnailer) {
					const metaThumb = document.getElementById('thumbnailer');
					if (metaThumb) metaThumb.content = config.thumbnailer;
				}
				const metaOpta = document.getElementById('opta-customer-id');
				if (metaOpta) {
					if (config.opta) metaOpta.content = config.opta;
					else metaOpta.remove();
				}
			}, config, req.domain.view).catch(function(err) {
				console.error(err);
			});
		});
	});
	dom.settings.load.plugins.splice(-1, 0, (page, settings, req, res) => {
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
	});
};

