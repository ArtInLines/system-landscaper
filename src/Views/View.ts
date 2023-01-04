import SystemLandscape from '../Graphs/SystemLandscape';
import SystemNode from '../Graphs/SystemNode';
import SystemTree from '../Graphs/SystemTree';
import EventManager from '../Utils/EventManager';
import NodeGroup from '../Graphs/NodeGroup';
import Edge from '../Graphs/Edge';
import Change from '../Utils/Change';

// Expected API:
// - init(SystemLandscaper)
// - getVisibleNodes()
//		Return Set/Array of all nodes that are visible

/**
 * @typedef {Object} ViewSettings
 * @property {boolean} allowUpwardEdgeInheritance Let A be a parent node with B as its child node. If A is visible and B isn't, then this setting determines whether edges connecting B will be shown as connecting A. Defaults to true.
 */

export type ViewSettings = {
	allowUpwardEdgeInheritance: boolean;
};

/** @type {ViewSettings} */
const defaultSettings: ViewSettings = {
	allowUpwardEdgeInheritance: true,
};

export default class View extends EventManager {
	graph: null | SystemLandscape;
	visibleNodes: SystemNode[];
	visibleEdges: Edge[];
	grouping: NodeGroup;
	allowUpwardEdgeInheritance: boolean;

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
	constructor(settings: object | ViewSettings = {}) {
		super();
		const fullSettings: ViewSettings = { ...defaultSettings, ...settings };

		/** @type {?SystemLandscape} */
		this.graph = null;
		/** @type {SystemNode[]} */
		this.visibleNodes = [];
		/** @type {Edge[]} */
		this.visibleEdges = [];
		/** @type {NodeGroup} */
		this.grouping = new NodeGroup();
		/** @type {boolean} */
		this.allowUpwardEdgeInheritance = fullSettings.allowUpwardEdgeInheritance;
	}

	init(graph: SystemLandscape) {
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
	_onGraphChange(changes: Change<SystemNode | SystemTree | Edge>[]) {
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

	_onNodeAdded(node: SystemNode) {
		if (this._isNodeVisible(node)) {
			this.visibleNodes.push(node);
			this._addNodeToGroups(node);
			this.emit('node-add', node);
		}
	}

	_onNodeUpdated(node: SystemNode) {
		if (this.visibleNodes.indexOf(node) !== -1) {
			this.emit('node-update', node);
		}
	}

	_onNodeRemoved(node: SystemNode) {
		let idx = this.visibleNodes.indexOf(node);
		if (idx !== -1) {
			this.visibleNodes.splice(idx, 1);
			this.grouping.removeNode(node);
			this.emit('node-remove', node);
		}
	}

	_onEdgeAdded(edge: Edge) {
		if (this._isEdgeVisible(edge)) {
			this.visibleEdges.push(edge);
			this.emit('edge-add', edge);
		} else if (this.allowUpwardEdgeInheritance && edge.source.systemTree !== edge.target.systemTree) {
			let source = this._getFirstVisibleAncestor(edge.source);
			let target = this._getFirstVisibleAncestor(edge.target);
			if (source && target) {
				let modifiedEdge = new Edge(source, target, { ...edge.data });
				this.visibleEdges.push(modifiedEdge);
				this.emit('edge-add', modifiedEdge);
			}
		}
	}

	_onEdgeUpdated(edge: Edge) {
		if (this.visibleEdges.indexOf(edge) !== -1) {
			this.emit('edge-update', edge);
		}
	}

	_onEdgeRemoved(edge: Edge) {
		let idx = this.visibleEdges.indexOf(edge);
		if (idx !== -1) {
			this.visibleEdges.splice(idx, 1);
			this.emit('edge-remove', edge);
		}
	}

	_onSystemTreeAdded(systemTree: SystemTree) {
		// TODO: Change stringified id to name of system tree
		let g = new NodeGroup(systemTree.id, String(systemTree.id));
		this.grouping.addGroups(g);
		this.emit('group-add', g);
	}

	_onSystemTreeUpdated(systemTree: SystemTree) {
		let g = this.grouping.findSubGroup((group) => group.id === systemTree.id);
		if (g) {
			g.name = String(systemTree.id);
			this.emit('group-update', g);
		}
	}

	_onSystemTreeRemoved(systemTree: SystemTree) {
		let g = this.grouping.removeSubGroup(systemTree.id);
		this.emit('group-remove', g);
	}

	/**
	 * Check whether the specified node is visible or not. This function should be overwritten by children classes.
	 * @param {SystemNode} node
	 * @returns {boolean}
	 */
	_isNodeVisible(node: SystemNode): boolean {
		return true; // For the base class, all nodes are visible
	}

	_isNodeOrAncestorVisible(node: SystemNode): boolean {
		if (this.visibleNodes.includes(node)) return true;
		else if (node?.parent) return this._isNodeOrAncestorVisible(node.parent);
		else return false;
	}

	/**
	 * Get a list of all Nodes that are visible in this view.
	 * @params {boolean} cached Wether to use the cached list or not. If not, the cache gets updated. Default: true
	 * @returns {SystemNode[]}
	 */
	getVisibleNodes(cached: boolean = true): SystemNode[] {
		if (!cached) this.visibleNodes = this.graph?.getSystems(0, Infinity, true).filter(this._isNodeVisible.bind(this)) ?? [];
		return this.visibleNodes;
	}

	/**
	 *
	 * @param {SystemNode} node
	 */
	_addNodeToGroups(node: SystemNode) {
		if (node.systemTree !== null) {
			let group = this.grouping.findSubGroup((group) => group.id === node.systemTree?.id);
			if (group) group.addNodes(node);
			else {
				this.grouping.addGroups(new NodeGroup(node.systemTree.id, String(node.systemTree.id), {}, [node]));
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
	_isEdgeVisible(edge: Edge) {
		return true;
	}

	/**
	 * Goes up the system tree until a node is visible. That node is returned. If no parent-node is visible, then null is returned.
	 * @param {SystemNode} node
	 * @returns {?SystemNode}
	 */
	_getFirstVisibleAncestor(node: SystemNode) {
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
		if (!cached) this.visibleEdges = this.graph?.edges.filter(this._isEdgeVisible.bind(this)) ?? [];
		return this.visibleEdges;
	}
}
