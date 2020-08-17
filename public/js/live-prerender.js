/* eslint-env browser */
document.head.querySelector('script[type="module"]').remove();
/* global matchdom */
import "../modules/matchdom";
import "./array-like.js";
import prepareTemplate from "./template.js";

import moment from '../modules/moment';
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
	protect(val, what) {
		// all iframes must be limited !
	},
	procrastify(val, what) {


	}
};

(async () => {
	try {
		const res = await fetch('./read.json');
		const page = await res.json();
		matchdom(document.documentElement, {page}, filters);
		const messages = page.messages;
		const tmpl = prepareTemplate(document.body.querySelector('template'));
		const result = matchdom(tmpl.content, {messages}, filters);
		tmpl.after(result);
	} catch(err) {
		console.error(err);
	}
})();

