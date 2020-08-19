import {procrastify} from './live.js';

export default class Controls {
	constructor(root) {
		this.root = root;
		root.querySelector('.live-controls').addEventListener('change', this, false);
	}

	handleEvent(e) {
		if (e.target.name == "filter") {
			this.root.classList.toggle("essentiel", e.target.value == "essentiel");
		} else if (e.target.name == "sort") {
			const messages = this.root.querySelectorAll('.live-message:not(.live-new):not(.pinned)');
			// TODO procrastify each node before insertion
			for (var node of Array.from(messages).reverse()) {
				this.root.appendChild(procrastify(node));
			}
		}
	}
}
