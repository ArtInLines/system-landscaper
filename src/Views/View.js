const SystemLandscape = require('../Graphs/SystemLandscape');
const SystemNode = require('../Graphs/SystemNode');
const SystemTree = require('../Graphs/SystemTree');
const EventManager = require('../Utils/EventManager');
const NodeGroup = require('../Graphs/NodeGroup');
const Edge = require('../Graphs/Edge');
const Change = require('../Utils/Change');

// Expected API:
// - init(SystemLandscaper)
// - getVisibleNodes()
//		Return Set/Array of all nodes that are visible

/**
 * @typedef {Object} viewSettings
 * @property {boolean} alloweUpwardEdgeInheritance Let A be a parent node with B as its child node. If A is visible and B isn't, then this setting determines whether edges connecting B will be shown as connecting A. Defaults to true.
 */

/** @type {viewSettings} */
const defaultSettings = {
	alloweUpwardEdgeInheritance: true,
};

class View extends EventManager {
	/**
	 * Base-View Class. Probably you want to use a subclass of this.
	 *
	 * Emitted Events:
	 * - "[type]-add"
	 * - "[type]-remove"
	 * - "[type]-update"
	 *
	 * where "type" is one of:
	 * - node
	 * - edge
	 * - group
	 */
	constructor(settings = {}) {
		super();
		settings = { ...defaultSettings, ...settings };

		/** @type {?SystemLandscape} */
		this.graph = null;
		/** @type {SystemNode[]} */
		this.visibleNodes = [];
		/** @type {Edge[]} */
		this.visibleEdges = [];
		/** @type {NodeGroup} */
		this.grouping = new NodeGroup();
		/** @type {boolean} */
		this.alloweUpwardEdgeInheritance = settings.alloweUpwardEdgeInheritance;
	}

	init(graph) {
		this.graph = graph;
		this.graph.on('changes', this._onGraphChange.bind(this));

		// Populate visible nodes/edges for cache:
		this.getVisibleNodes(false);
		this.getVisibleEdges(false);
		return this;
	}

	/**
	 * @param {Change[]} changes
	 */
	_onGraphChange(changes) {
		for (let change of changes) {
			let type = change.type;
			let el = change.el;
			switch (type) {
				case 'add':
					if (el instanceof SystemNode) this._onNodeAdded(el);
					else if (el instanceof Edge) this._onEdgeAdded(el);
					else if (el instanceof SystemTree) this._onSystemTreeAdded(el);
					break;
				case 'remove':
					if (el instanceof SystemNode) this._onNodeRemoved(el);
					else if (el instanceof Edge) this._onEdgeRemoved(el);
					else if (el instanceof SystemTree) this._onSystemTreeRemoved(el);
					break;

				case 'update':
					if (el instanceof SystemNode) this._onNodeUpdated(el);
					else if (el instanceof Edge) this._onEdgeUpdated(el);
					else if (el instanceof SystemTree) this._onSystemTreeUpdated(el);
					break;

				default:
					break;
			}
		}
	}

	_onNodeAdded(node) {
		if (this._isNodeVisible(node)) {
			this.visibleNodes.push(node);
			this._addNodeToGroups(node);
			this.emit('node-add', node);
		}
	}

	_onNodeUpdated(node) {
		if (this.visibleNodes.indexOf(node) !== -1) {
			this.emit('node-update', node);
		}
	}

	_onNodeRemoved(node) {
		let idx = this.visibleNodes.indexOf(node);
		if (idx !== -1) {
			this.visibleNodes.splice(idx, 1);
			this.grouping.removeNode(node);
			this.emit('node-remove', node);
		}
	}

	_onEdgeAdded(edge) {
		if (this._isEdgeVisible(edge)) {
			this.visibleEdges.push(edge);
			this.emit('edge-add', edge);
		} else if (this.alloweUpwardEdgeInheritance && edge.source.systemTree !== edge.target.systemTree) {
			let source = this._getFirstVisibleAncestor(edge.source);
			let target = this._getFirstVisibleAncestor(edge.target);
			if (source && target) {
				let modifiedEdge = new Edge(source, target, { ...edge.data });
				this.visibleEdges.push(modifiedEdge);
				this.emit('edge-add', modifiedEdge);
			}
		}
	}

	_onEdgeUpdated(edge) {
		if (this.visibleEdges.indexOf(edge) !== -1) {
			this.emit('edge-update', edge);
		}
	}

	_onEdgeRemoved(edge) {
		let idx = this.visibleEdges.indexOf(edge);
		if (idx !== -1) {
			this.visibleEdges.splice(idx, 1);
			this.emit('edge-remove', edge);
		}
	}

	_onSystemTreeAdded(systemTree) {
		let g = new NodeGroup(systemTree.id, systemTree.name);
		this.grouping.addGroups(g);
		this.emit('group-add', g);
	}

	_onSystemTreeUpdated(systemTree) {
		let g = this.grouping.findSubGroup((group) => group.id === systemTree.id);
		if (g) {
			g.name = systemTree.name;
			this.emit('group-update', g);
		}
	}

	_onSystemTreeRemoved(systemTree) {
		let g = this.grouping.removeSubGroup(systemTree.id);
		this.emit('group-remove', g);
	}

	/**
	 * Check whether the specified node is visible or not. This function should be overwritten by children classes.
	 * @param {SystemNode} node
	 * @returns {boolean}
	 */
	_isNodeVisible(node) {
		return true; // For the base class, all nodes are visible
	}

	_isNodeOrAncestorVisible(node) {
		if (this.visibleNodes.includes(node)) return true;
		else if (node?.parent) return this._isNodeOrAncestorVisible(node.parent);
		else return false;
	}

	/**
	 * Get a list of all Nodes that are visible in this view.
	 * @params {boolean} cached Wether to use the cached list or not. If not, the cache gets updated. Default: true
	 * @returns {SystemNode[]}
	 */
	getVisibleNodes(cached = true) {
		if (!cached) this.visibleNodes = this.graph.getNodes().filter(this._isNodeVisible.bind(this));
		return this.visibleNodes;
	}

	/**
	 *
	 * @param {SystemNode} node
	 */
	_addNodeToGroups(node) {
		if (node.systemTree !== null) {
			let group = this.grouping.findSubGroup((group) => group.id === node.systemTree?.id);
			if (group) group.addNodes(node);
			else {
				this.grouping.addGroups(new NodeGroup(node.systemTree.id, node.systemTree.name, {}, [node]));
				this._onSystemTreeAdded(node.systemTree);
			}
		} else {
			this.grouping.addNodes(node);
		}
	}

	/**
	 * Check whether the specified node is visible or not. This function should be overwritten by children classes.
	 * @param {Edge} edge
	 * @returns {boolean}
	 */
	_isEdgeVisible(edge) {
		return true;
	}

	/**
	 * Goes up the system tree until a node is visible. That node is returned. If no parent-node is visible, then null is returned.
	 * @param {SystemNode} node
	 * @returns {?SystemNode}
	 */
	_getFirstVisibleAncestor(node) {
		if (this.visibleNodes.includes(node)) return node;
		while (node?.parent) {
			node = node.parent;
			if (this.visibleNodes.includes(node)) return node;
		}
		return null;
	}

	/**
	 * Get a list of all Edges that should be visible as edges/arrows in this view.
	 * @params {boolean} cached Wether to use the cached list or not. If not, the cache gets updated. Default: true
	 * @returns {Edge[]}
	 */
	getVisibleEdges(cached = true) {
		if (!cached) this.visibleEdges = this.graph.edges.filter(this._isEdgeVisible.bind(this));
		return this.visibleEdges;
	}
}

module.exports = View;
