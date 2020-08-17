const path = require('path');
const readFile = require('fs').promises.readFile;
const serveStatic = require('serve-static');

/* fix paths before nodejs-like es6 imports */
/* configure with a list of paths */
module.exports = function(list = []) {
	const serveHandler = serveStatic(path.resolve('./node_modules'), {
		index: false,
		redirect: false,
		dotfiles: 'ignore',
		fallthrough: false
	});

	return async function serveModules(req, res, next) {
		const base = list.find((item) => req.path.startsWith(item));
		if (!base) return next('route');

		const name = base.split(path.sep).pop();
		let rest = req.path.substring(base.length);
		if (rest && path.extname(rest) == "") rest += ".js";
		const modulePath = require.resolve(path.join(name, 'package.json'));
		const pkg = JSON.parse(await readFile(modulePath));
		const objPath = path.parse(pkg.module || pkg['jsnext:main'] || pkg.main || '');
		const filePath = path.join(path.dirname(modulePath), objPath.dir, rest || objPath.base);

		const rel = path.relative("./node_modules", filePath);
		req.url = rel;
		serveHandler(req, res, next);
	};
};

