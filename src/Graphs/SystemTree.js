const EventManager = require('../Utils/EventManager');
const newID = require('../Utils/id');

// require('./System) can't be called at the top:
// https://stackoverflow.com/questions/29023320/resolving-circular-dependency-in-nodejs-model
// Solution: require('./System') inside each function that needs access to it.
// Another solution would be to not use class syntax but function prototypes
// That would work since Classes are technically just syntactic sugar
// Problem with that is the difficult use of "this":
// https://stackoverflow.com/a/20279485/13764271

class SystemTree extends EventManager {
	/**
	 * Create a new SystemTree object. SystemTrees have the added ability to store edges between different Systems. These edges can be generally between systems or detailedly between the individual nodes of the systems.
	 * @param {?System} root Root node of the system.
	 * @param {any} data Data to store with the system.
	 */
	constructor(root = null, data = {}) {
		const System = require('./System');
		this.id = newID();
		this.data = data || {};

		if (root instanceof System) {
			this.root = root;
		} else this.root = new System(this);
	}

	getSystems(startLayer = 0, endLayer = startLayer) {
		// TODO
	}
}

module.exports = SystemTree;
