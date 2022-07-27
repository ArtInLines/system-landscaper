const eventify = require('ngraph.events');
const newID = require('../Utils/id');
const Node = require('./Node');
const Edge = require('./Edge');

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
	 * @param {systemOptions} options Options for this system. Gets merged with the default options for systems.
	 */
	constructor(root, options) {
		this.id = newID();
		this.options = Object.assign({}, defaultOpts, options);
		this.root = root;
		this.edges = {
			from: [],
			to: [],
			internal: [],
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
	 * @returns {Set<System>}
	 */
	get systemsTo() {
		let systems = new Set();
		this.edges.to.forEach((e) => {
			if (e.target instanceof System) systems.add(e.target);
			else if (e.target instanceof Node) systems.add(e.target.system);
		});
		return systems;
	}

	/**
	 * Get all systems that connect to this system.
	 * @returns {Set<System>}
	 */
	get systemsFrom() {
		let systems = new Set();
		this.edges.from.forEach((e) => {
			if (e.source instanceof System) systems.add(e.source);
			else if (e.source instanceof Node) systems.add(e.source.system);
		});
		return systems;
	}

	/**
	 * Get all systems connected with this system.
	 * @returns {Set<System>}
	 */
	get connectedSystems() {
		let systems = this.systemsFrom;
		this.systemsTo.forEach((s) => systems.add(s));
		return systems;
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
	static Node(data, options) {
		return new System(new Node(data, options), options);
	}

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
		parent.addChildren(node);
		return this;
	}
	
	forEachNode();
	
	mapNodes();
	
	removeNodes();

	/**
	 * Add Edges to this system. If the edge is not connected, it won't be added. Edges are automatically added to the right subcategory.
	 * @param  {...Edge} edges Edges to add to this system.
	 */
	addEdges(...edges) {
		edges.forEach((edge) => {
			let isFrom = edge.source instanceof Node ? edge.source.system === this : edge.source === this;
			let isTo = edge.target instanceof Node ? edge.target.system === this : edge.target === this;

			if (isFrom && isTo) this.edges.internal.push(edge);
			else if (isFrom) this.edges.from.push(edge);
			else if (isTo) this.edges.to.push(edge);
		});
	}

	edgesTo(node, includeInternal = false, includeChildren = false) {
		let edges = this.edges.to.filter((e) => e.target === node);
		if (includeInternal) {
			edges.push(...this.edges.internal.filter((e) => e.target === node));
		}
		if (includeChildren) {
			edges.push(...node.mapChildren(c => this.edgesFrom(c, includeInternal, true)))
		}
		return edges;
	}

	edgesFrom(node, includeInternal = false, includeChildren = false) {
		let edges = this.edges.from.filter((e) => e.source === node);
		if (includeInternal) {
			edges.push(...this.edges.internal.filter((e) => e.source === node));
		}
		if (includeChildren) {
			edges.push(...node.mapChildren(c => this.edgesFrom(c, includeInternal, true)))
		}
		return edges;
	}

	edgesOf(node) {
		return this.allEdges.filter((e) => e.source === node || e.target === node);
	}
	
	forEachEdge();
	
	mapEdges();
	
	removeEdges();
	
	
	
	getNode(id);
	getEdge(id);
	getNodesCount();
	getEdgesCound();
	height();
	// TODO: Add Events
}

module.exports = System;
