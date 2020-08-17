/* eslint-env browser */

/* global matchdom */
import "../modules/matchdom";

import prepareTemplate from "./template.js";

import moment from '../modules/moment/moment';
import '../modules/moment/locale/fr';
moment.locale('fr');


const filters = {
	iconclass(val, what) {
		what.parent.closest('.live-message').classList.toggle('no-live-icons', !val);
		return val;
	},
	isoDate(val, what) {
		if (!val) return val;
		return new Date(val).toISOString();
	},
	calendar(val, what) {
		return moment(val || new Date()).fromNow();
	},
	template(val, what) {
		prepareTemplate(what.node);
		return val;
	}
};

(async () => {
	const res = await fetch('./read.json');
	const page = await res.json();
	const messages = page.messages;
	matchdom(document.documentElement, {page, messages}, filters);
})();

