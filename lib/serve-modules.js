const path = require('path');
const readFile = require('fs').promises.readFile;
const serveStatic = require('serve-static');

/* ES Modules path resolution for browsers */
/* uses fields in package.json (module,jsnext:main,main) */
/* paths are "/any/thing/name" url, mapped to "./node_modules/name" file paths */

module.exports = function(list = []) {
	const node_path = path.join('.', 'node_modules');
	const serveHandler = serveStatic(path.resolve(node_path), {
		index: false,
		redirect: false,
		dotfiles: 'ignore',
		fallthrough: false
	});

	return async function serveModules(req, res, next) {
		const base = list.find((item) => req.path.startsWith(item));
		if (!base) return next('route');

		const name = base.split(path.sep).pop();

		const modulePath = require.resolve(path.join(name, 'package.json'));
		const pkg = JSON.parse(await readFile(modulePath));
		const objPath = path.parse(pkg.module || pkg['jsnext:main'] || pkg.main || '');

		let rest = req.path.substring(base.length);
		if (rest) {
			if (!path.extname(rest)) rest += ".js";
		} else {
			rest = objPath.base;
		}

		const filePath = path.join(path.dirname(modulePath), objPath.dir, rest);
		const rel = path.relative(node_path, filePath);
		req.url = rel;
		serveHandler(req, res, next);
	};
};

