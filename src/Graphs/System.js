const eventify = require('ngraph.events');
const newID = require('../Utils/id');
const Edge = require('./Edge');
const XSet = require('../Utils/ExtendedSet');

// require('./Node) can't be called at the top:
// https://stackoverflow.com/questions/29023320/resolving-circular-dependency-in-nodejs-model
// Solution: require('./Node') inside each function that needs access to it.
// Another solution would be to not use class syntax but function prototypes
// That would work since Classes are technically just syntactic sugar
// Problem with that is the difficult use of "this":
// https://stackoverflow.com/a/20279485/13764271

/**
 * @typedef {Object} systemOptions
 *
 */

/** @type {systemOptions} */
const defaultOpts = {};

class System {
	/**
	 * Create a new System object. Systems are Trees with the added ability to store edges between different Systems. These edges can be generally between systems or detailedly between the individual nodes of the systems.
	 * @param {Node} root Root node of the system.
	 * @param {any} data Data to store with the system.
	 * @param {systemOptions} options Options for this system. Gets merged with the default options for systems.
	 */
	constructor(root = null, data = {}, options = {}) {
		const Node = require('./Node');
		this.id = newID();
		this.options = Object.assign({}, defaultOpts, options);
		this.data = data || {};

		if (root instanceof Node) {
			console.log(root);
			root.system.removeNodes(root.id);
			this.root = root;
			root.changeSystem(this);
		} else this.root = new Node(this);

		this.edges = {
			from: new XSet(),
			to: new XSet(),
			internal: new XSet(),
		};
	}

	/**
	 * Get all edges connected with this system.
	 * @returns {Edge[]}
	 */
	get allEdges() {
		return [...this.edges.from, ...this.edges.to, ...this.edges.internal];
	}

	/**
	 * Get all systems connected to from this system
	 * @returns {Array<System>}
	 */
	get systemsTo() {
		let systems = new XSet();
		this.edges.to.forEach((e) => systems.add(e.targetSystem));
		return systems;
	}

	/**
	 * Get all systems that connect to this system.
	 * @returns {Array<System>}
	 */
	get systemsFrom() {
		let systems = new XSet();
		this.edges.from.forEach((e) => systems.add(e.sourceSystem));
		return systems;
	}

	/**
	 * Get all systems connected with this system.
	 * @returns {Array<System>}
	 */
	get connectedSystems() {
		return [...this.systemsTo, ...this.systemsFrom];
	}

	get nodes() {
		return this.root.nodes;
	}

	getLevels() {
		return this.root.getLevels();
	}

	/**
	 * Create a new root node in its own system.
	 * @param {any} data Data to store in the root node of this system.
	 * @param {systemOptions | nodeOptions} options Options for both the root node and its system.
	 * @returns {System} New System whose rot node has the specified data and options.
	 */
	// static Node(data, options) {
	// 	return new System(new Node(null, data, options), options);
	// }

	changeRoot(newRoot, addOldRootAsChild = false) {
		newRoot.changeSystem(this);
		if (addOldRootAsChild) {
			this.root.changeRoot(newRoot);
			newRoot.addChildren(this.root);
		} else {
			newRoot.addChildrenOf(this.root);
		}
		this.root = newRoot;
		return this;
	}

	/**
	 * Add a System as a new Subsystem to this system.
	 * @param {System} system System to add to this system.
	 * @param {Boolean} del Indicates whether to delete the system after adding it to this system. Defaults to false. usuaully the Garbage Collector can handle the deletion too.
	 * @returns {System} Returns this system for chaining.
	 */
	addSystem(system, del = false) {
		this.root.addChildren(system.root);
		if (del) system = null;
		return this;
	}

	mergeSystem(system, newRoot = this.root, del = false) {
		newRoot.changeSystem(this);
		if (newRoot !== this.root) newRoot.addChildrenOf(this.root);
		if (newRoot !== system.root) newRoot.addChildrenOf(system.root);
		this.root = newRoot;
		if (del) system = null;
		return this;
	}

	addNode(node, parent = this.root) {
		node.system.removeNodes(node.id);
		parent.addChildren(node);
		return this;
	}

	forEachNode() {}

	mapNodes() {}

	removeNodes(...ids) {
		ids.forEach((id) => {
			this.root.removeChild(id);
		});
	}

	/**
	 * Add Edges to this system. If the edge is not connected, it won't be added. Edges are automatically added to the right subcategory.
	 * @param  {...Edge} edges Edges to add to this system.
	 */
	addEdges(...edges) {
		const Node = require('./Node');
		edges.forEach((edge) => {
			let isSource = edge.sourceSystem === this;
			let isTarget = edge.targetSystem === this;

			if (isSource && isTarget) this.edges.internal.add(edge);
			else if (isSource) this.edges.from.add(edge);
			else if (isTarget) this.edges.to.add(edge);
		});
	}

	edgesTo(node, includeInternal = false, includeChildren = false) {
		let edges = this.edges.to.filter((e) => e.target === node);
		if (includeInternal) {
			edges.push(...this.edges.internal.filter((e) => e.target === node));
		}
		if (includeChildren) {
			edges.push(...node.mapChildren((c) => this.edgesFrom(c, includeInternal, true)));
		}
		return edges;
	}

	edgesFrom(node, includeInternal = false, includeChildren = false) {
		let edges = this.edges.from.filter((e) => e.source === node);
		if (includeInternal) {
			edges.push(...this.edges.internal.filter((e) => e.source === node));
		}
		if (includeChildren) {
			edges.push(...node.mapChildren((c) => this.edgesFrom(c, includeInternal, true)));
		}
		return edges;
	}

	edgesOf(node, includeTreeEdges = false) {
		let res = this.allEdges.filter((e) => e.source === node || e.target === node);
		if (includeTreeEdges) res.push(...node.children);
		return res;
	}

	forEachEdge() {}

	mapEdges() {}

	removeEdges() {}

	getNode(id) {
		return this.root.getNode(id);
	}

	getEdge(id) {}

	getNodesCount() {}

	getEdgesCound() {}

	height() {}
	// TODO: Add Events
}

module.exports = System;
