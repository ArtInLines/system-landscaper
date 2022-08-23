const Tree = require('../Utils/Tree');
const Edge = require('./Edge');

class SystemNode extends Tree {
	/**
	 * Create a new SystemNode. SystemNodes represent single systems in a tree-like hierachy of systems. To connect several systems (or systemTrees) together, you need to use the SystemLandscape class.
	 * @param {?SystemNode} parent The parent of this tree-node
	 * @param {any} data Data associated with this node
	 */
	constructor(name = null, parent = null, data = {}) {
		super(null, data);
		this.name = name;
		this.systemTree = parent instanceof SystemNode ? parent.systemTree : null;
		this.edgesToChildren = [];

		/** @type {?SystemNode} (For documentation only, remove this and use typescript type-annotations instead in the future) */
		this.parent = null;
		this.changeParent(parent);
	}

	// Getting Data

	getEdge(toId) {
		return this.edgesToChildren.find((edge) => edge.target === toId);
	}

	getVerticalLinks(includeLinkFromParent = false) {
		let res = [];
		if (includeLinkFromParent && this.parent) res.push(this.parent.getEdge(this.id));
		res.push(...this.edgesToChildren);
		return res;
	}

	// Updating Data

	changeSystemTree(systemTree) {
		this.systemTree = systemTree;
		this.emit('systemTreeChanged', systemTree, this);
		this.children.forEach((child) => child.changeSystemTree(systemTree));
	}

	// Adding Data

	addChild(child) {
		super.addChild(child);
		child.changeSystemTree(this.systemTree);
		const edge = new Edge(this, child);
		this.edgesToChildren.push(edge);
		this.emit('edgeAdded', edge, this, child);
		return child;
	}

	// Removing Data

	removeChild(id) {
		let c = super.removeChild(id);
		if (c) {
			if (c.systemTree) c.systemTree = null;
			let idx = this.edgesToChildren.findIndex((edge) => edge.target !== id);
			this.emit('edgeRemoved', this.edgesToChildren[idx], this, c);
			this.edgesToChildren.splice(idx, 1);
		}
		return c;
	}

	remove() {
		super.remove();
		this.systemTree = null;
		return this;
	}
}

module.exports = SystemNode;
