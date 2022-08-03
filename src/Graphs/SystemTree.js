const EventManager = require('../Utils/EventManager');
const newID = require('../Utils/id');
const SystemNode = require('./SystemNode');

// require('./System) can't be called at the top:
// https://stackoverflow.com/questions/29023320/resolving-circular-dependency-in-nodejs-model
// Solution: require('./System') inside each function that needs access to it.
// Another solution would be to not use class syntax but function prototypes
// That would work since Classes are technically just syntactic sugar
// Problem with that is the difficult use of "this":
// https://stackoverflow.com/a/20279485/13764271

class SystemTree extends EventManager {
	/**
	 * Create a new SystemTree object. SystemTrees store the tree-like structure of systems and allows easy interaction with them. This class also adds events to listen to changes in the tree.
	 * @param {?SystemNode} root Root node of the systemTree.
	 * @param {any} data Data to store with the systemTree.
	 */
	constructor(root = null, data = {}) {
		super();
		this.id = newID();
		this.data = data || {};
		this.root = root;
		if (this.root instanceof SystemNode) this.root.changeSystemTree(this);
	}

	// Checks

	isEmpty() {
		return !this.root && Object.keys(this.data).length === 0;
	}

	// Getting Data

	getSystems(startLayer = 0, endLayer = startLayer) {
		return this.root?.getChildren(startLayer, endLayer) ?? [];
	}

	getSystem(id) {
		return this.root?.getByID(id) ?? null;
	}

	getEdge(toId) {
		return this.root?.getEdge(toId) ?? null;
	}

	getEdgesFrom(fromId) {
		return this.getVerticalLinks(fromId, false) ?? [];
	}

	getVerticalLinks(nodeId = null, includeLinkFromParent = false) {
		let node = nodeId ? this.getSystem(nodeId) : this.root;
		return node?.getVerticalLinks(includeLinkFromParent) ?? [];
	}

	// Adding Data

	addChild(system) {
		this.addSystem(system);
	}

	addSystem(system, parentId = null) {
		// TODO
	}

	// Updating Data

	/**
	 * Change the Parent of a system in this tree.
	 * @param {Number} systemId ID of the system to change the parent of
	 * @param {?SystemTree} newParent The new parent of this system. If set to null, the system will have no parent.
	 * @returns {Boolean} Indicates whether the system was found and the parent could thus be changed.
	 */
	changeParent(systemId, newParent = null) {
		let system = this.getSystem(systemId);
		if (!system) return false;
		system?.changeParent(newParent);
		return true;
	}

	// Removing Data

	removeChild(id) {
		return this.removeSystem(id);
	}

	removeSystem(systemId) {
		let system = this.getSystem(systemId);
		if (!system) return false;
		system.parent.removeChild(system.id);
		return true;
	}
}

module.exports = SystemTree;
