import matchdom from "../modules/matchdom";
import "./array-like.js";
import parseHTML from './fragment-parser.js';
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
	sandbox(val, what) {
		if (val && val.nodeType == Node.ELEMENT_NODE) {
			val.querySelectorAll('iframe').forEach((node) => {
				node.setAttribute('sandbox', '');
			});
		}
	},
	procrastify(node, what) {
		if (!node || node.nodeType != Node.ELEMENT_NODE) return node;
		procrastify(node);
	}
};

export function patch() {

}

export function build(root, {page, messages}) {
	matchdom(document.documentElement, {page}, filters);
	const tmpl = prepareTemplate(root.querySelector('template'));
	const result = matchdom(tmpl.content, {messages}, filters);
	root.querySelector('.live-list').appendChild(result);
}

export function parse(html) {
	return parseHTML(html);
}

export function procrastify(node) {
	node.querySelectorAll('object,img,iframe,embed,opta,.dugout-video,be-op,.twitter-tweet').forEach((node) => {
		if (node.matches('be-op')) {
			node.classList.add('lazy');
			return;
		}
		if (node.matches('.twitter-tweet')) {
			node.classList.add('lazy');
			node.classList.remove('twitter-tweet');
			node.classList.add('tweet');
			return;
		}
		if (node.matches('.lazy') || node.parentNode.closest('object')) return true;
		const url = node.matches('object,iframe,embed,opta,.dugout-video') && node.getAttribute('title') || node.getAttribute('src');
		const frag = node.ownerDocument.createElement('span');
		frag.classList.add('lazy');
		frag.dataset.html = node.outerHTML;
		if (url) frag.setAttribute('title', url);
		node.parentNode.replaceChild(frag, node);
	});
	return node;
}
