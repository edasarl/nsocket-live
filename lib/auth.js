const qs = require('qs');
const Upcache = require('upcache');
const {Models} = require('objection');
const Keygen = require('../lib/keygen');
const Lock = Upcache.lock({
	maxAge: 60 * 60 * 48,
	userProperty: 'user',
	keysize: 2048
});

exports.init = (app) => {
	app.use(['/:domain', '/:domain/*'], Lock.init, queryLogin, queryLogout);
};

exports.keygen = async (config) => {
	const keys = await Keygen(config);
	Object.assign(Lock.config, keys);
};

exports.lock = (str) => {
	return (req, res, next) => {
		const grants = req.user.grants || [];
		const lock = str.replace(':domain', req.params.domain);
		const locked = grants.includes(lock) == false;
		if (locked) {
			Lock.headers(res, [lock]);
			res.sendStatus(grants.length == 0 ? 401 : 403);
		} else {
			next();
		}
	};
};

async function queryLogin(req, res, next) {
	// passing a _token is like login in, so redirect without the token and log in !
	const domain = req.params.domain;
	const token = req.query._token;

	if (token) {
		const user = await Models.User.query().findOne({ domain, token });
		if (user) {
			const grant = 'write-' + user.domain;
			const grants = req.user.grants || [];
			if (!grants.includes(grant)) grants.push(grant);
			Lock.login(res, { grants });
		} else {
			throw new HttpError.Unauthorized();
		}
	}
	cleanQueryParameter('_token', req, res, next);
}

async function queryLogout(req, res, next) {
	const logout = req.query.logout;
	if (logout) {
		Lock.logout(res);
	}
	cleanQueryParameter('logout', req, res, next);
}

function cleanQueryParameter(name, req, res, next) {
	if (name in req.query && req.method == "GET" && req.accepts('json', 'html') == 'html') {
		req.url = req.path;
		if (Object.keys(req.query).length > 1) {
			req.url += '?' + qs.stringify(req.query);
		}
		var redirUrl = req.baseUrl || '';
		if (req.url != "/" || !redirUrl) redirUrl += req.url;
		res.redirect(redirUrl);
	} else {
		next();
	}
}
