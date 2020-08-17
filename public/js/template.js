/* eslint-env browser */

import parseHTML from "./fragment-parser.js";

export default function prepareTemplate(node) {
	if (node.isContentEditable) return node;
	const doc = node.ownerDocument;
	let tmpl = node;
	let helper;
	if (node.matches('script[type="text/html"]')) {
		helper = doc.createElement('div');
		helper.innerHTML = node.textContent;
		tmpl = doc.createElement('template');
		if (!tmpl.content) {
			tmpl.content = doc.createDocumentFragment();
			tmpl.content.appendChild(parseHTML(helper.textContent, {doc}));
		} else {
			tmpl.innerHTML = helper.textContent;
		}
		node.replaceWith(tmpl);
		node.textContent = helper.textContent = '';
	} else if (document.visibilityState == "prerender") {
		const dest = parseHTML(`<script type="text/html"></script>`, {doc});
		if (!helper) helper = doc.createElement('div');
		helper.textContent = tmpl.content.childNodes.map(child => {
			if (child.nodeType == Node.TEXT_NODE) return child.nodeValue;
			else return child.outerHTML;
		}).join('');
		dest.textContent = helper.innerHTML;
		dest.content = tmpl.content;
		tmpl.replaceWith(dest);
		tmpl = dest;
	}
	return tmpl;
}

