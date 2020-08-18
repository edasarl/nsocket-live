const path = require('path');
const readFile = require('fs').promises.readFile;
const serveStatic = require('serve-static');

/* ES Modules path resolution for browsers */
/* uses fields in package.json (exports,module,jsnext:main,main) */
/* mount is the base path, and it needs a whitelist of modules names */

module.exports = async function(mount, whitelist = []) {
	const node_path = path.join('.', 'node_modules');
	const serveHandler = serveStatic(path.resolve(node_path), {
		index: false,
		redirect: false,
		dotfiles: 'ignore',
		fallthrough: false
	});

	const modules = {};
	const bases = [];
	for (let name of whitelist) {
		const modulePath = path.join(node_path, name);
		const pkg = JSON.parse(await readFile(path.join(modulePath, 'package.json')));
		const exp = pkg.exports && pkg.exports.import
			|| pkg.module
			|| pkg['jsnext:main']
			|| pkg.main
			|| '';

		const objExp = path.parse(exp);
		const base = mount + '/' + name;
		modules[base] = {
			dir: objExp.dir,
			base: objExp.base,
			name: name
		};
		bases.push(base);
	}

	return function serveModules(req, res, next) {
		if (!req.path.startsWith(mount + '/')) {
			return next('route');
		}
		const base = bases.find((base) => req.path.startsWith(base));
		if (!base) throw new HttpError.NotFound("No such module");

		const mod = modules[base];

		let rest = "./" + req.path.substring(base.length + 1);
		const objRest = path.parse(rest);
		if (!objRest.dir.startsWith(mod.dir)) {
			let restBase = objRest.base;
			if (restBase == "" || restBase == ".") restBase = mod.base;
			const redir = path.join(base, mod.dir, objRest.dir, restBase);
			res.redirect(redir);
		} else {
			if (!objRest.ext) rest += ".js";
			req.url = '/' + path.join(mod.name, rest);
			serveHandler(req, res, next);
		}
	};
};

