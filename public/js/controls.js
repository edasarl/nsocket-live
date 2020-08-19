export default class Controls {
	constructor(root) {
		this.root = root;
		root.querySelector('.live-controls').addEventListener('change', this, false);
	}

	handleEvent(e) {
		if (e.target.name == "filter") {
			this.root.classList.toggle("essentiel", e.target.value == "essentiel");
		} else if (e.target.name == "reverse") {
			this.root.classList.toggle("reverse", e.target.checked);
		}
	}
}
