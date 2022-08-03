const newID = require('../Utils/id');
const Trie = require('../Utils/Trie');
const EventManager = require('../Utils/EventManager');
const XSet = require('../Utils/ExtendedSet');
const SystemTree = require('./SystemTree');
const SystemNode = require('./SystemNode');
const Edge = require('./Edge');

// Expected API:
// 		- addNode(node: NodeId, data?: NodeData) => Node<NodeData>
// 		- addLink(from: NodeId, to: NodeId, data?: LinkData) => Link<LinkData>
// - removeNode(node: NodeId) => boolean
// - removeLink(link: LinkId) => boolean
// 		- getNode(node: NodeId) => Node<NodeData> | undefined
// 		- getLink(fromNodeId: NodeId, toNodeId: NodeId) => Link<LinkData> | undefined // TODO: null instead of undefined returned
// 		- hasLink(fromNodeId: NodeId, toNodeId: NodeId) => Link<LinkData> | undefined // TODO: Returns Boolean
// 		- getNodesCount() => number
// 		- getNodeCount() = getNodesCount()
// 		- getLinksCount() => number
// 		- getLinkCount() = getLinksCount()
// 		- getLinks(nodeId: NodeId) => Set<Link<LinkData>> | null // TODO: Different name
// - forEachNode(callback: (node: Node<NodeData>) => void) => void
// - forEachLink(callback: (link: Link<LinkData>) => void) => void
// - forEachLinkedNode(nodeId: NodeId, callback: (node: Node<NodeData>, link: Link<LinkData>) => void) => void, oriented: boolean) => void
// - beginUpdate() => void
// - endUpdate() => void
// - clear() => void

// export default function createGraph<NodeData = any, LinkData = any>(options?: { multigraph: boolean }): Graph<NodeData, LinkData> & EventedType

// TODO: Add Events for Renderer to listen to

class SystemLandscape extends EventManager {
	constructor() {
		super();
		this.id = newID();
		this.systemTrees = [];
		this.systemsByName = new Trie();
		this.systemsByID = new Map();
		this.edges = [];
	}

	// Checks

	hasSystem(id) {
		return this.systemsByID.has(id);
	}

	hasEdgeId(id) {
		return this.getEdgeId(id) !== null;
	}

	hasEdge(from = null, to = null) {
		return this.getEdge(from, to) !== null;
	}

	isVerticalEdge(edge) {
		return edge.source?.systemTree === edge.target?.systemTree;
	}

	sameNode(a, b) {
		if (!(a instanceof SystemNode)) a = this.getSystem(a);
		if (!(b instanceof SystemNode)) b = this.getSystem(b);
		return a.id === b.id;
	}

	// Getting Data

	/**
	 * Get the system uniquely identified by its ID or name.
	 * @param {Number|String|SystemNode} id The unique ID or name of the system. If the system itself is inputted, it is simply returned.
	 * @returns {?SystemNode}
	 */
	getSystem(id) {
		if (id instanceof SystemNode) return id;
		if (typeof id === 'string') return this.getSystemByName(id);
		if (this.hasSystem(id)) return this.systemsByID.get(id);
		else return null;
	}

	getNode(id) {
		return this.getSystem(id);
	}

	getSystemTree(id) {
		return this.systemTrees.find((tree) => tree.id === id);
	}

	getSystems(startLayer = 0, endLayer = startLayer, flatten = false) {
		let res = this.systemTrees.map((tree) => tree.getSystems(startLayer, endLayer));
		if (flatten) return res.flat(1);
		else return res;
	}

	getSystemsByName(name) {
		return this.systemsByName.findPrefix(name);
	}

	getSystemByName(name) {
		return this.systemsByName.find(name);
	}

	getEdgesOfSystem(systemID, horizontal = true, vertical = true, includeLinksOfChildren = false) {
		let links = new Set();
		if (!this.hasSystem(systemID)) return links;
		if (horizontal) {
			this.edges.forEach((edge) => {
				if (edge.source === systemID || edge.target === systemID) links.add(edge.id);
			});
		}
		if (vertical) {
			this.getSystem(systemID)
				.getVerticalLinks()
				.forEach((edge) => links.add(edge.id));
		}
		if (includeLinksOfChildren) {
			this.getSystem(systemID)
				.getChildren()
				.forEach((child) => {
					this.getEdgesOfSystem(child.id, horizontal, vertical, false).forEach((edge) => links.add(edge.id));
				});
		}
		return links;
	}

	getEdgeId(id) {
		return this.edges.find((edge) => edge.id === id);
	}

	getLinkId(id) {
		return this.getEdgeId(id);
	}

	getEdge(from, to) {
		return this.edges.find((edge) => {
			if (!this.sameNode(edge.source, from)) return false;
			if (!this.sameNode(edge.target, to)) return false;
			return true;
		});
	}

	getLink(from, to) {
		return this.getEdge(from, to);
	}

	getSystemsCount() {
		return this.systemsByID.size;
	}

	getNodesCount() {
		return this.getSystemsCount();
	}

	getNodeCount() {
		return this.getSystemsCount();
	}

	getSystemTreesCount() {
		return this.systemTrees.length;
	}

	getTreesCount() {
		return this.getSystemTreesCount();
	}

	getEdgesCount() {
		return this.edges.length;
	}

	getLinksCount() {
		return this.getEdgesCount();
	}

	getLinkCount() {
		return this.getEdgesCount();
	}

	// Adding Data

	onVerticalEdgeAdded(edge, parent, child) {
		this.addEdge(edge);
	}

	onVerticalEdgeRemoved(edge, parent, child) {
		this.edges.splice(this.edges.indexOf(edge), 1);
	}

	onSystemTreeChanged(systemTree, node) {
		// TODO
		if (systemTree.isEmpty()) {
			this.systemTrees.splice(this.systemTrees.indexOf(systemTree), 1);
		}
	}

	addEventListenersToSystem(system) {
		system.on('edgeAdded', (...args) => this.onVerticalEdgeAdded(...args));
		system.on('edgeRemoved', (...args) => this.onVerticalEdgeRemoved(...args));
		system.on('systemTreeChanged', (...args) => this.onSystemTreeChanged(...args));
	}

	addEventListenersToSystemTree(tree) {
		// TODO
	}

	addSystem(name = null, data = {}, parent = null) {
		if (typeof parent === 'string') parent = this.getSystemByName(parent);
		let system = new SystemNode(name, parent, data);
		if (name === null) name = String(system.id);
		this.systemsByName.insert(name, system);
		this.systemsByID.set(system.id, system);

		if (!system.systemTree) {
			let tree = new SystemTree(system);
			this.systemTrees.push(tree);
			this.addEventListenersToSystemTree(tree);
		}
		this.addEventListenersToSystem(system);
		return system;
	}

	addEdge(edge) {
		this.edges.push(edge);
		this.emit('edgeAdded', edge, this.isVerticalEdge(edge));
		return edge;
	}

	/**
	 * Create a new edge to link two systems/systemTrees. If the systems are not in the landscape, they will be added. If an edge between the two systems already exists, it will be returned.
	 * @param {?SystemNode|SystemTree} from SystemNode or SystemTree from which the edge comes from
	 * @param {?SystemNode|SystemTree} to SystemNode or SystemTree to which the edge goes to
	 * @param {any} data Data associated with the edge
	 */
	linkSystems(from, to, data) {
		let edge = this.getEdge(from, to);
		if (edge) {
			edge.changeData(data);
			return edge;
		}

		if (typeof from === 'string') from = this.getSystemByName(from);
		if (typeof to === 'string') to = this.getSystemByName(to);
		if (!this.hasSystem(from.id)) from = this.addSystem();
		if (!this.hasSystem(to.id)) to = this.addSystem();

		edge = new Edge(from, to, data);
		this.addEdge(edge);
		return edge;
	}

	linkSystemsUndirected(system1, system2, data) {
		this.linkSystems(system1, system2, data);
		this.linkSystems(system2, system1, data);
		// TODO: Anything else to do?
	}

	// Removing Data

	removeSystem(id) {
		let sys = this.getSystem(id);
		this.systemsByID.delete(id);
		this.systemsByName.delete(sys.name);
		this.emit('systemRemoved', sys);
	}

	removeEdge(id) {
		let edge = this.getEdgeId(id);
		let idx = this.edges.findIndex((edge) => edge.id === id);
		this.edges.splice(idx, 1);
		let isVertical = this.isVerticalEdge(edge);
		if (isVertical) {
			this.getSystem(edge.source).removeChild(edge.target.id);
		}
		this.emit('edgeRemoved', edge, isVertical);
	}

	// Updating Data

	updateSystemName(id, newName) {
		let sys = this.getSystem(id);
		this.systemsByName.delete(id.name);
		this.systemsByName.insert(newName, sys);
		sys.name = newName;
	}

	updateSystem(id, data) {
		let sys = this.getSystem(id);
		if (data?.name) {
			this.updateSystemName(sys, data.name);
			delete data.name;
		}
		sys.data = { ...sys.data, ...data };
		return sys;
	}

	updateEdge(id, data) {
		let edge = this.getEdgeId(id);
		edge.data = { ...edge.data, ...data };
		return edge;
	}

	// Moving Data

	moveSystem(id, newParentId = null) {
		let system = this.getSystem(id);
		if (!system) return false;
		// Edge from old parent should be removed automatically via event listeners
		let newParent = newParentId === null ? null : this.getSystem(newParentId);
		if (newParent) {
			newParent.addChild(system);
			// New Edge from new Parent should be added automatically via event listeners
		} else {
			// If there's no new parent, the system should have its own systemTree created
			let tree = new SystemTree(system);
			this.systemTrees.push(tree);
		}
	}

	moveEdgeId(id, newSource = null, newTarget = null, keepBidirectional = true) {
		let edge = this.getEdgeId(id);
		return this.moveEdge(edge, newSource, newTarget, keepBidirectional);
	}

	moveEdge(edge, newSource = null, newTarget = null, keepBidirectional = true) {
		if (!edge) return false;
		if (keepBidirectional) {
			let otherEdge = this.getEdge(edge.target, edge.source);
			if (otherEdge) {
				this.moveEdge(otherEdge, newTarget, newSource, false);
			}
		}
		let newSourceNode = newSource === null ? edge.source : this.getSystem(newSource);
		let newTargetNode = newTarget === null ? edge.target : this.getSystem(newTarget);

		let wasVertical = this.isVerticalEdge(edge);
		if (wasVertical) {
			edge.source?.removeChild(edge.target.id);
		}
		edge.source = newSourceNode;
		edge.target = newTargetNode;
		let isVertical = this.isVerticalEdge(edge);
		if (isVertical) {
			edge.source?.addChild(edge.target.id);
		}

		this.emit('edgeMoved', edge, wasVertical, isVertical);
		return true;
	}

	// Positioning

	positionSystem(id, x, y) {
		// TODO
	}

	positionSystemTree(id, x, y) {
		// TODO
	}

	automaticLayout(layout) {
		// TODO
	}

	positionEdge(params) {
		// TODO
	}

	// Saving / Loading

	save(format, location = null) {
		// TODO
	}

	load(location, format = null) {
		// TODO
	}

	saveView(name) {
		// TODO
	}

	deleteView(name) {
		// TODO
	}

	goBack(steps = 1) {
		// TODO
	}

	goForward(steps = 1) {
		// TODO
	}
}

module.exports = SystemLandscape;
