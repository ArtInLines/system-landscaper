const EventManager = require('../Utils/EventManager');
const Edge = require('./Edge');
const Node = require('./Node');
const System = require('./System');

const defaultOpts = {};

class SystemLandscape extends EventManager {
	constructor(options) {
		this.options = Object.assign({}, defaultOpts, options);
		this.edges = new Map();
		this.systems = new Map();
	}

	get nodes() {
		let nodes = [];
		this.systems.forEach((system) => nodes.push(...system.nodes));
		return nodes;
	}

	// Get Data

	getSystem(id) {
		if (this.systems.has(id)) return this.systems.get(id);
		return null;
	}

	getEdge(id) {
		if (this.edges.has(id)) return this.edges.get(id);
		return null;
	}

	/**
	 * Get a node in the SystemLandscape by its id. If the node doesn't exist, null is returned.
	 * @param {Number} id Id of the node to get.
	 * @returns {?Node}
	 */
	getNode(id) {
		for (let system of this.systems) {
			let node = system.getNode(id);
			if (node) return node;
		}
		return null;
	}

	// Add Data

	addSystem(system = null, data = null) {
		system = system instanceof System ? system : new System(null, data);
		this.systems.set(system.id, system);
		return this;
	}

	addLink(from, to) {
		const edge = new Edge(from, to);
		this.edges.set(edge.id, edge);
		edge.sourceSystem.addEdges(edge);
		edge.targetSystem.addEdges(edge);
		return this;
	}

	addNode(parent = null, data = null, options = { addOldRootAsChild: true }) {
		const node = new Node(null, data, options);
		console.log(node);
		if (parent instanceof Node) parent.system.addNode(node, parent);
		else if (parent instanceof System) parent.changeRoot(node, options.addOldRootAsChild);
		return node;
	}

	// Change data

	/**
	 * Move a node to a new parent node/system.
	 * @param {Node|Number}} node Node to move. Either a reference to the node or its id.
	 * @param {?(Node|System)} newParent A reference to the node's new parent. If it should become the root of a new system, input the system instead. If it should become the root of its own system, input null.
	 * @param {Boolean} addOldRootAsChild Only important if newParent is a system. If true, the old root of the system will be added as a child of the new root.
	 */
	moveNode(node, newParent, addOldRootAsChild) {
		if (!(node instanceof Node)) node = this.getNode(node.id);
		if (node) {
			if (newParent instanceof Node) newParent.system.addNode(node, newParent);
			else if (newParent instanceof System) newParent.changeRoot(node.system, addOldRootAsChild);
			else new System();
		}
	}

	// Remove Data

	removeSystem(id) {
		this.systems.delete(id);
		return this;
	}

	removeEdge(id) {
		this.edges.delete(id);
		return this;
	}

	removeNode(id) {
		for (let system of this.systems) {
			system.removeNodes(id);
		}
		return this;
	}
}

module.exports = SystemLandscape;
