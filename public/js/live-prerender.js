import ready from './ready.js';
import * as live from './live.js';

(async () => {
	const [page] = await Promise.all([
		(await fetch('./read.json')).json(),
		ready
	]);
	const root = document.body.querySelector('.live-messages');
	const messages = page.messages;
	delete page.messages;
	await live.build(root, {page, messages});

	const script = document.head.querySelector('script[type="module"][src="/js/live-prerender.js"');
	const copy = script.cloneNode();
	copy.setAttribute('src', "/js/live-setup.js");
	script.parentNode.replaceChild(copy, script);
})();

