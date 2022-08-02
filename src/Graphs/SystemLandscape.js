const EventManager = require('../Utils/EventManager');
const Trie = require('../Utils/Trie');
const XSet = require('../Utils/ExtendedSet');
const newID = require('../Utils/id');
const SystemTree = require('./SystemTree');
const SystemNode = require('./SystemNode');
const Edge = require('./Edge');

// Expected API:
// - addNode(node: NodeId, data?: NodeData) => Node<NodeData>
// - addLink(from: NodeId, to: NodeId, data?: LinkData) => Link<LinkData>
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

	// Getting Data

	getSystem(id) {
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
			if (from !== null && edge.source !== from) return false;
			if (to !== null && edge.target !== to) return false;
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
		this.edges.push(edge);
		// TODO: Anything else to do here?
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
		if (!this.hasSystem(from)) from = this.addSystem();
		if (!this.hasSystem(to)) to = this.addSystem();

		edge = new Edge(from, to, data);
		this.edges.push(edge);
		return edge;
	}

	linkSystemsUndirected(system1, system2, data) {
		this.linkSystems(system1, system2, data);
		this.linkSystems(system2, system1, data);
		// TODO: Anything else to do?
	}

	// Removing Data

	removeSystem(id, removeChildren = true) {
		// TODO
	}

	removeEdge(id) {
		// TODO
	}

	// Updating Data

	updateSystem(id, data) {
		// TODO
	}

	updateEdge(id, data) {
		// TODO
	}

	// Moving Data

	moveSystem(id, newParentId = null) {
		let system = this.getSystem(id);
		if (!system) return false;
		let newParent = newParentId === null ? null : this.getSystem(newParentId);
		if (newParent) {
			newParent.addChild(system);
		} else {
		}
		// TODO
	}

	moveEdge(id, newSource = null, newTarget = null, keepBidirectiona = true) {
		// TODO
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
