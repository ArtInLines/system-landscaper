const newID = require('../Utils/id');
const EventManager = require('./EventManager');

class Tree extends EventManager {
	/**
	 * Create a new Tree object. All nodes in the Tree are instances of this Tree class.
	 * @param {?Tree} parent The parent of this tree-node
	 * @param {any} data Data associated with this node
	 */
	constructor(parent = null, data = {}) {
		super();
		/** @type {Number} */
		this.id = newID();
		/** @type {any} */
		this.data = data || {};
		/** @type {?Tree} */
		this.parent = parent;
		/** @type {Tree[]} */
		this.children = [];
	}

	/**
	 * Returns how many levels deep this node is in the tree.
	 * @returns {Number}
	 */
	get depth() {
		let depth = 0;
		let parent = this.parent;
		while (parent !== null) {
			depth++;
			parent = parent.parent;
		}
		return depth;
	}

	/**
	 * Returns how many levels the tree goes deeper from here
	 * @returns {Number}
	 */
	get height() {
		return Math.max(...this.children.map((child) => child.height)) + 1;
	}

	/**
	 * Get the root-node of this tree.
	 * @returns {Tree}
	 */
	get root() {
		if (this.parent === null) return this;
		let parent = this.parent;
		while (parent.parent !== null) {
			parent = parent.parent;
		}
		return parent;
	}

	/**
	 * Check if this Tree-Node is empty - i.e. has no children and no data associated with it.
	 * @returns {Boolean}
	 */
	isEmpty() {
		return this.children.length === 0 && Object.keys(this.data).length === 0;
	}

	/**
	 * Get all nodes in the tree, that are in startLayer, endLayer or any layer in between. The layers are counted from this node onward. That is done to implement this method recursively, as users will mainly call it from the root only anyways.
	 
	 If startLayer is 0, this node is included in the result as well.
	 
	 Defaults to get all nodes in the tree, starting from layer 0 and going to layer Infinity (that is until the tree ended).
	 * @param {Number} startLayer The first layer to get nodes from
	 * @param {Number} endLayer The last layer to get nodes from
	 * @returns {Tree[]} List of Nodes in the specified range of layers.
	 */
	getChildren(startLayer = 0, endLayer = Infinity) {
		if (startLayer === 0 && endLayer === 0) {
			return [this];
		} else if (startLayer === 0) {
			return [this, ...this.children.map((child) => child.getChildren(0, endLayer - 1))];
		} else {
			return [...this.children.map((child) => child.getChildren(startLayer - 1, endLayer - 1))];
		}
	}

	/**
	 * Get the Node with the specified id. If it doesn't exist in this Tree, `null` is returned instead.
	 * @param {Number} id The ID of the node to get
	 * @returns {?Tree}
	 */
	getByID(id) {
		if (this.id === id) return this;
		for (let child of this.children) {
			let res = child.getByID(id);
			if (res !== null) return res;
		}
		return null;
	}

	/**
	 * Add a child-node to this node.
	 * @param {Tree} child The child to add to this tree
	 * @returns {Tree} The child that was added
	 */
	addChild(child) {
		child?.parent?.removeChild(child.id);
		child.parent = this;
		this.children.push(child);
		return child;
	}

	/**
	 * Change this node's parent.
	 * @param {?Tree} newParent The new parent of this node. If set to null, this system will have no parent.
	 */
	changeParent(newParent = null) {
		this.parent?.removeChild(this.id);
		newParent?.addChild(this);
	}

	/**
	 * Remove a child of this tree. To remove this node itself, set all references to it to `null` and let the garbage collector handle it. All children of the node will be removed as well, unless you save another reference to them before.
	 * @param {Number} id The ID of the node to remove
	 * @returns {?Tree} Returns the removed child or `null` if the child couldn't be found.
	 */
	removeChild(id) {
		let idx = this.children.findIndex((child) => child.id === id);
		if (idx === -1) {
			for (let child of this.children) {
				let res = child.removeChild(id);
				if (res) return res;
			}
			return null;
		} else {
			let removedChild = this.children.splice(idx, 1)[0];
			this.emit('childRemoved', removedChild, this);
			return removedChild;
		}
	}
}

module.exports = Tree;
