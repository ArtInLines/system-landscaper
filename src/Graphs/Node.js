// TODO: Should Events be added to the individual nodes or be handled by the higher classes?

const newID = require('../Utils/id');
const XSet = require('../Utils/ExtendedSet');
const System = require('./System');

/**
 * @typedef {Object} nodeOptions
 *
 */

/** @type {nodeOptions} */
const defaultOpts = {};

class Node {
	/**
	 * Create a new Node object for Trees. These Nodes are specifically for the use in Trees instead of general Graphs.
	 * @param {?System} system System to associate with this node. If set to null, a new system will be created.
	 * @param {any} data Data to store in this node. Defaults to an empty object.
	 * @param {nodeOptions} options Options for this node. Geets merged with the default options for nodes.
	 */
	constructor(system, data, options) {
		this.id = newID();
		this.data = data || {};
		this.system = system || new System(this, options);
		this.root = this;
		this.parent = null;
		this.children = new XSet();
		this.options = Object.assign({}, defaultOpts, options);
	}

	get edges() {
		return this.system.edgesOf(this, true);
	}

	get nodes() {
		return [this, ...this.children];
	}

	getNode(id) {
		if (this.id === id) return this;
		for (let child of this.children) {
			let node = child.getNode(id);
			if (node !== null) return node;
		}
		return null;
	}

	/**
	 * Get this node's height in the overall tree.
	 * @returns {Number}
	 */
	getHeight() {
		if (!this.hasParent()) return 0;
		return this.parent.getHeight() + 1;
	}

	/**
	 * Get a Map of all levels in this tree from this node onward.
	 * @param {Map<Number, Node[]>} m Used for memoization. Don't set this manually.
	 * @returns {Map<Number, Node[]>} Returns a map of each height mapped to the nodes on that height.
	 */
	getLevels(m = new Map()) {
		let height = this.getHeight();
		if (m.has(height)) m.get(height).push(this);
		else m.set(height, [this]);
		this.children.forEach((c) => c.getHeightLevels(m));
		return m;
	}

	/**
	 * Update the System associated with this node and its children. Type-Checking is not performed for perfomance reasons.
	 * @param {System} system New system to associate with this node.
	 * @returns {Node} Returns this node for chaining.
	 */
	changeSystem(system) {
		this.system = system || new System(this);
		this.children.forEach((c) => c.changeSystem(system));
		return this;
	}

	/**
	 * Update the Root of this node and all its children. Set newRoot to `null`, to set the root to this node.
	 * @param {?Node} newRoot New root node for this node.
	 * @returns {Node} Returns this node for chaining.
	 */
	changeRoot(newRoot) {
		if (newRoot === null) newRoot = this;
		this.root = newRoot;
		this.children.forEach((c) => c.changeRoot(newRoot));
		return this;
	}

	/**
	 * Check whether this Node has a parent. Type-Checking of the parent is not performed, for perfomance reasons.
	 * @returns {Boolean}
	 */
	hasParent() {
		return this.parent !== null;
	}

	/**
	 * Change the parent of this node and add this node to the children of `parent`. This method will also update the root property of this node and all its children. Set the parent to `null`, to remove a parent.
	 * @param {?Node} parent New Parent Node
	 */
	changeParent(parent) {
		this.parent = parent;
		if (parent !== null) {
			parent.children.add(this);
			this.changeRoot(parent.root);
		} else {
			this.changeRoot(this);
		}
		return this;
	}

	/**
	 * Check whether this Node has children.
	 * @returns {Boolean}
	 */
	hasChildren() {
		return this.children.size > 0;
	}

	/**
	 * Get the amoung of children this node has.
	 * @returns {Number}
	 */
	get childrenAmount() {
		return this.children.size;
	}

	createChild(data, options) {
		const node = new Node(this.system, data, options);
		this.addChildren(node);
		return node;
	}

	/**
	 * Add children to this node. Type-Checking is not performed for perfomance reasons.
	 * @param  {...Node} children Children to add to this node.
	 * @returns {Node} Returns this node for chaining.
	 */
	addChildren(...children) {
		children.forEach((child) => {
			this.children.add(child);
			child.changeParent(this);
			child.changeRoot(this.root);
			child.changeSystem(this.system);
		});
		return this;
	}

	addChildrenOf(node) {
		this.addChildren(...node.children.values());
		return this;
	}

	/**
	 * Remove children from this node. Type-Checking is not performed for perfomance reasons.
	 * @param  {...Node} nodes Children to remove from this node.
	 * @returns {Node} Returns this node for chaining.
	 */
	removeChildren(...nodes) {
		this.children.forEach((child) => {
			let idx = nodes.findIndex((node) => node.id === child.id);
			if (idx !== -1) {
				child.parent = null;
				nodes.splice(idx, 1);
				this.children.delete(child);
			}
		});
		return this;
	}

	clearChildren() {
		this.children = new Set();
		return this;
	}

	forEachChild(callback) {
		this.children.forEach(callback);
		return this;
	}

	mapChildren(callback) {
		return this.children.map(callback);
	}

	addSystems(...systems) {
		this.addChildren(...systems.map((s) => s.root));
		return this;
	}

	/**
	 * Remove this node. If this node has a parent, all children will be moved to the parent. To remove this node with its children, simply remove all references to it and let the garbage collector handle it.
	 * @param {Boolean} force Indicates if we should force the node to be removed, even if it's the root note and has children. Defaults to false.
	 * @returns {?Node} Returns the Parent Node or null if this was the root node.
	 */
	rm(force = false) {
		if (this.hasParent()) {
			this.parent.removeChildren(this);
			// Doesn't need to remove parent-reference to this node from children, since addChildren() overrides the parent property anyways.
			parent.addChildren(...this.children.values());
			return this.parent;
		} else if (!force && this.hasChildren()) {
			throw new Error('Cannot remove root node with children. Set `force` to true to remove anyway.');
		} else {
			this.children.forEach((c) => (c.parent = null));
			return this.children;
		}
	}
}

module.exports = Node;
