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

	/**	Synonym for this.depth */
	get layer() {
		return this.depth;
	}

	/**
	 * Returns how many levels the tree goes deeper from here
	 * @returns {Number}
	 */
	get height() {
		if (this.isLeaf()) return 0;
		let h = Math.max(...this.children.map((child) => child.height)) + 1;
		return h;
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
	 * Check if this Tree-Node is a leaf - i.e. has no children.
	 * @returns {Boolean}
	 */
	isLeaf() {
		return this.children.length === 0;
	}

	/**
	 * Check if this Tree-Node is the root of its tree - i.e. it has no parent.
	 * @returns {Boolean}
	 */
	isRoot() {
		return this.parent === null;
	}

	/**
	 * Check if the node has any siblings - i.e. it's not the only child of its parent.
	 * @returns {Boolean}
	 */
	hasSiblings() {
		if (this.parent === null) return false;
		return this.parent.children.length > 1;
	}

	/**
	 * Check if the node has any siblings to its left
	 * @returns {Boolean}
	 */
	hasLeftSibling() {
		if (this.parent === null) return false;
		// Only the left-most child has no left sibling
		return this.parent.children[0] !== this;
	}

	/**
	 * Check if the node has any siblings to its right
	 * @returns {Boolean}
	 */
	hasRightSibling() {
		if (this.parent === null) return false;
		// Only the right-most child has no right sibling
		return this.parent.children[this.parent.children.length - 1] !== this;
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
			let nodes = [this];
			this.children.forEach((child) => nodes.push(...child.getChildren(0, endLayer - 1)));
			return nodes;
		} else {
			let nodes = [];
			this.children.forEach((child) => nodes.push(...child.getChildren(startLayer - 1, endLayer - 1)));
			return nodes;
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
	 * Move a child-node to a new index in the children-array. This is specifically useful when children-order matters, like with certain tree-drawing algorithms.
	 * @param {Tree | Number} child The child to move or its ID.
	 * @param {Number} idx The new index that the child should be moved to.
	 * @returns
	 */
	moveChildToIdx(child, idx) {
		if (this.removeChild(child.id) === null) return false;
		this.children.splice(idx, 0, child);
		return true;
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
			removedChild.parent = null;
			this.emit('childRemoved', removedChild, this);
			return removedChild;
		}
	}

	removeAllChildren() {
		for (let child of this.children) {
			child.removeAllChildren();
			this.removeChild(child.id);
		}
		return this;
	}

	remove() {
		this.removeAllChildren();
		this.parent?.removeChild(this.id);
		return this;
	}
}

module.exports = Tree;
