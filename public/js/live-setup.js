import * as live from './live.js';
import ready from './ready.js';
import createObserver from './observer.js';
import Controls from './controls.js';

const observer = createObserver(function(node) {
	if (node.matches('.tweet')) {
		node.classList.remove('lazy');
		node.classList.remove('tweet');
		node.classList.add('twitter-tweet');
		if (window.twttr) window.twttr.widgets.load(node);
		return;
	}

	const src = node.dataset.src;
	if (src) {
		node.setAttribute('src', src);
		node.removeAttribute('data-src');
		node.removeAttribute('title');
		node.classList.remove('lazy');
		return;
	}
	const html = node.dataset.html;
	if (html) {
		const frag = live.parse(html);
		var withoutScript = frag.querySelectorAll('script').length == 0;
		if (withoutScript) frag.classList.add('lazy');
		node.parentNode.replaceChild(frag, node);
		if (withoutScript) setTimeout(function() {
			frag.classList.remove('lazy');
		}, 20);
	}
});

function uiNode(node) {
	observer.observe(node);
}

ready.then(async () => {
	const root = document.body.querySelector('.live-messages');
	root.querySelectorAll('article .lazy').forEach((node) => uiNode(node));
	new Controls(root);
}).catch((err) => {
	console.error(err);
});
