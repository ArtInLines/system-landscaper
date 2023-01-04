import newID, { ID } from '../Utils/id';
import Trie from '../Utils/Trie';
import EventManager from '../Utils/EventManager';
import Change, { ChangeKind } from '../Utils/Change';
import SystemTree from './SystemTree';
import SystemNode, { EdgeAddedEv, EdgeRemovedEv, SystemTreeChangedEv } from './SystemNode';
import Edge from './Edge';
import Tree from '../Utils/Tree';

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

export type NodeIdentifier = ID | string | SystemNode;
export type EdgeIdentifier = ID | Edge;

export type ChangeObj = {
	systems: Change<SystemNode>[];
	edges: Change<Edge>[];
	trees: Change<SystemTree>[];
	[index: string]: Change<SystemNode | SystemTree | Edge>[];
};

export type AllChangesObj = {
	[Property in ChangeKind]: ChangeObj;
};

export default class SystemLandscape extends EventManager {
	id: ID;
	systemTrees: SystemTree[];
	systemsByName: Trie<SystemNode>;
	systemsByID: Map<ID, SystemNode>;
	edges: Edge[];
	changes: AllChangesObj;

	constructor() {
		super();
		/** @type {ID} */
		this.id = newID();

		/** @type {SystemTree[]} */
		this.systemTrees = [];

		/** @type {Trie} */
		this.systemsByName = new Trie();

		/** @type {Map<ID, SystemNode>} */
		this.systemsByID = new Map();

		/** @type {Edge[]} */
		this.edges = [];

		/** @type {Object<Object<Change[]>>} */
		this.changes = {
			remove: {
				systems: [],
				edges: [],
				trees: [],
			},
			add: {
				systems: [],
				edges: [],
				trees: [],
			},
			update: {
				systems: [],
				edges: [],
				trees: [],
			},
		};
	}

	// Checks

	hasSystem(id: ID) {
		return this.systemsByID.has(id);
	}

	hasEdgeId(id: ID) {
		return this.getEdgeFromId(id) !== null;
	}

	hasEdge(from: null | SystemNode = null, to: null | SystemNode = null) {
		if (!from || !to) return false;
		return this.getEdge(from, to) !== null;
	}

	isVerticalEdge(edge: Edge) {
		// Edges are vertical iff they connect a parent-node with a child-node
		return edge.source?.parent === edge.target || edge.target?.parent === edge.source;
	}

	sameNode(a: NodeIdentifier, b: NodeIdentifier) {
		let nodeA = !(a instanceof SystemNode) ? this.getSystem(a) : a;
		let nodeB = !(b instanceof SystemNode) ? this.getSystem(b) : b;
		return nodeA?.id === nodeB?.id;
	}

	// Getting Data

	/**
	 * Get the system uniquely identified by its ID or name.
	 * @param {ID|String|SystemNode} id The unique ID or name of the system. If the system itself is inputted, it is simply returned.
	 * @returns {?SystemNode}
	 */
	getSystem(id: NodeIdentifier): SystemNode | null {
		if (id instanceof SystemNode) return id;
		else if (typeof id === 'string') return this.getSystemByName(id);
		else return this.systemsByID.get(id) ?? null;
	}

	getNode(id: NodeIdentifier): SystemNode | null {
		return this.getSystem(id);
	}

	getSystemTree(id: ID): SystemTree | undefined {
		return this.systemTrees.find((tree) => tree.id === id);
	}

	getSystems(startLayer: number, endLayer: number, flatten: true): SystemNode[];
	getSystems(startLayer: number, endLayer: number, flatten: false): SystemNode[][];
	getSystems(startLayer: number = 0, endLayer: number = startLayer, flatten: boolean = false): Tree[] | Tree[][] {
		let res = this.systemTrees.map((tree) => tree.getSystems(startLayer, endLayer));
		if (flatten) return res.flat(1);
		else return res;
	}

	getSystemsByName(name: string): string[] {
		return this.systemsByName.findPrefix(name);
	}

	getSystemByName(name: string): SystemNode | null {
		return this.systemsByName.find(name);
	}

	getEdgesOfSystem(systemID: ID, horizontal: boolean = true, vertical: boolean = true, includeLinksOfChildren: boolean = false): Set<Edge> {
		let links = new Set<Edge>();
		if (!this.hasSystem(systemID)) return links;
		if (horizontal) {
			this.edges.forEach((edge) => {
				if (edge.fromId === systemID || edge.toId === systemID) links.add(edge);
			});
		}
		if (vertical) {
			this.getSystem(systemID)
				?.getVerticalLinks()
				?.forEach((edge) => links.add(edge));
		}
		if (includeLinksOfChildren) {
			this.getSystem(systemID)
				?.getChildren()
				?.forEach((child) => {
					this.getEdgesOfSystem(child.id, horizontal, vertical, false).forEach((edge) => links.add(edge));
				});
		}
		return links;
	}

	getEdgeFromId(id: EdgeIdentifier): Edge | null {
		if (id instanceof Edge) return id;
		return this.edges.find((edge) => edge.id === id) ?? null;
	}

	getEdge(from: NodeIdentifier, to: NodeIdentifier): Edge | undefined {
		return this.edges.find((edge) => {
			if (!this.sameNode(edge.source, from)) return false;
			if (!this.sameNode(edge.target, to)) return false;
			return true;
		});
	}

	getHorizontalEdges(): Edge[] {
		return this.edges.filter((edge) => !this.isVerticalEdge(edge));
	}

	getVerticalEdges(): Edge[] {
		return this.edges.filter((edge) => this.isVerticalEdge(edge));
	}

	getMaxHeight(): number {
		let maxHeight = 0;
		this.systemTrees.forEach((tree) => {
			let h = tree.height;
			if (h > maxHeight) maxHeight = h;
		});
		return maxHeight;
	}

	getNodesCount(): number {
		return this.systemsByID.size;
	}

	getSystemTreesCount(): number {
		return this.systemTrees.length;
	}

	getEdgesCount(): number {
		return this.edges.length;
	}

	// Event Handling

	/**
	 *
	 * @param {'add'|'remove'|'update'} type
	 * @param {any} el
	 * @param {?String|String[]} subject
	 */
	addChange(type: ChangeKind, el: any, subject: null | string | string[] = null) {
		let change = new Change(type, el, subject);
		let o = this.changes[type];
		if (el instanceof SystemNode) {
			o.systems.push(change);
		} else if (el instanceof Edge) {
			o.edges.push(change);
		} else if (el instanceof SystemTree) {
			o.trees.push(change);
		}
		return change;
	}

	emitChanges() {
		const changeKinds: ChangeKind[] = ['remove', 'add', 'update'];
		const changeSubjects = ['systems', 'edges', 'trees'];

		let changes = [];
		for (let type of changeKinds) {
			const changeObj = this.changes[type];
			for (let subj of changeSubjects) {
				changes.push(...changeObj[subj]);
				changeObj[subj] = [];
			}
		}
		this.emit('changes', changes);
	}

	onVerticalEdgeAdded(edge: Edge) {
		this._addEdge(edge);
	}

	onVerticalEdgeRemoved(edge: Edge) {
		this.edges.splice(this.edges.indexOf(edge), 1);
		this.addChange('remove', edge);
	}

	onSystemTreeChanged(systemTree: SystemTree, node: SystemNode) {
		// TODO
		if (systemTree.isEmpty()) {
			this.systemTrees.splice(this.systemTrees.indexOf(systemTree), 1);
			this.addChange('remove', systemTree);
		}
		// else {
		// 	this.addChange('update', systemTree, systemTree.data);
		// }
	}

	addEventListenersToSystem(system: SystemNode) {
		system.on('edgeAdded', (...args: EdgeAddedEv) => this.onVerticalEdgeAdded(...args));
		system.on('edgeRemoved', (...args: EdgeRemovedEv) => this.onVerticalEdgeRemoved(...args));
		system.on('systemTreeChanged', (...args: SystemTreeChangedEv) => this.onSystemTreeChanged(...args));
	}

	addEventListenersToSystemTree(tree: SystemTree) {
		// TODO
	}

	// Adding Data

	addSystem(name: string, data: object = {}, parent: null | string | SystemNode = null): SystemNode {
		if (typeof parent === 'string') parent = this.getSystemByName(parent);

		if (this.systemsByName.has(name)) {
			let i = 2;
			while (this.systemsByName.has(name + '_' + String(i))) i++;
			name += '_' + String(i);
		}

		let system = new SystemNode(name, parent, data);
		this.systemsByName.insert(name, system);
		this.systemsByID.set(system.id, system);

		if (!system.systemTree) {
			let tree = new SystemTree(system);
			this.systemTrees.push(tree);
			this.addEventListenersToSystemTree(tree);
			this.addChange('add', tree);
		}
		this.addEventListenersToSystem(system);
		this.addChange('add', system);
		this.emitChanges();
		return system;
	}

	_addEdge(edge: Edge): Edge {
		// Check if an edge connecting the two systems already exists
		let e = this.edges.find((e) => e.source === edge.source && e.target === edge.target);
		if (e) return e;

		this.edges.push(edge);
		this.addChange('add', edge);
		return edge;
	}

	addEdge(edge: Edge): Edge {
		let res = this._addEdge(edge);
		this.emitChanges();
		return res;
	}

	/**
	 * Create a new edge to link two systems/systemTrees. If the systems are not in the landscape, they will be added. If an edge between the two systems already exists, it will be returned.
	 * @param {?SystemNode|SystemTree} from SystemNode or SystemTree from which the edge comes from
	 * @param {?SystemNode|SystemTree} to SystemNode or SystemTree to which the edge goes to
	 * @param {any} data Data associated with the edge
	 */
	_linkSystems(from: NodeIdentifier, to: NodeIdentifier, data: object = {}): Edge | null {
		let edge = this.getEdge(from, to);
		if (edge) {
			edge.addToData(data);
			return edge;
		}

		let fromSys = this.getSystem(from);
		let toSys = this.getSystem(to);
		if (!fromSys || !toSys) return null;
		edge = new Edge(fromSys, toSys, data);
		this._addEdge(edge);
		return edge;
	}

	/**
	 * Create a new edge to link two systems/systemTrees. If the systems are not in the landscape, they will be added. If an edge between the two systems already exists, it will be returned.
	 * @param {?SystemNode|SystemTree} from SystemNode or SystemTree from which the edge comes from
	 * @param {?SystemNode|SystemTree} to SystemNode or SystemTree to which the edge goes to
	 * @param {any} data Data associated with the edge
	 */
	linkSystems(from: NodeIdentifier, to: NodeIdentifier, data: object = {}): Edge | null {
		let res = this._linkSystems(from, to, data);
		this.emitChanges();
		return res;
	}

	linkSystemsUndirected(system1: NodeIdentifier, system2: NodeIdentifier, data: object) {
		this._linkSystems(system1, system2, data);
		this._linkSystems(system2, system1, data);
		this.emitChanges();
		// TODO: Anything else to do?
	}

	// Removing Data

	_removeSystemTree(id: ID): SystemTree | null {
		let idx = this.systemTrees.findIndex((st) => st.id === id);
		if (idx < 0) return null;
		let sysTree = this.systemTrees[idx];

		if (!!sysTree.root) this._removeSystem(sysTree.root);
		this.systemTrees.splice(idx, 1);

		this.emitChanges();
		return sysTree;
	}

	_removeSystem(sys: SystemNode): SystemNode {
		sys.systemTree?.removeSystem(sys.id);
		this.systemsByID.delete(sys.id);
		this.systemsByName.delete(sys.name);
		this.addChange('remove', sys);
		let sysEdges = this.getEdgesOfSystem(sys.id, true, true, true);
		sysEdges.forEach((edge) => this._removeEdge(edge));
		return sys;
	}

	removeSystem(id: ID): SystemNode | SystemTree | null {
		let res = null;
		let sys = this.getSystem(id);
		if (!!sys) {
			if (sys?.systemTree?.root === sys) res = this._removeSystemTree(sys.systemTree.id);
			else res = this._removeSystem(sys);
			this.emitChanges();
		}
		return res;
	}

	_removeEdge(id: EdgeIdentifier, keepBidirectional: boolean = true): boolean {
		let edge = this.getEdgeFromId(id);
		if (!edge) return false;
		let idx = this.edges.findIndex((e) => e.id === edge!.id);
		if (idx === -1) return false;

		if (keepBidirectional) {
			let edge2 = this.getEdge(edge.target, edge.source);
			if (edge2) this._removeEdge(edge2, false);
		}
		let isVertical = this.isVerticalEdge(edge);
		if (isVertical) this.getSystem(edge.source)?.removeChild(edge.target.id);

		this.edges.splice(idx, 1);
		this.addChange('remove', edge);
		return true;
	}

	removeEdge(id: EdgeIdentifier, keepBidirectional: boolean = true): boolean {
		let res = this._removeEdge(id, keepBidirectional);
		this.emitChanges();
		return res;
	}

	// Updating Data

	updateSystemName(id: NodeIdentifier, newName: string): boolean {
		let sys = this.getSystem(id);
		if (!sys) return false;
		this.systemsByName.delete(sys.name);
		this.systemsByName.insert(newName, sys);
		sys.name = newName;
		this.addChange('update', sys, 'name');
		this.emitChanges();
		return true;
	}

	updateSystem(id: NodeIdentifier, data: { name?: string }): boolean {
		let sys = this.getSystem(id);
		if (!sys) return false;
		if (data?.name) {
			this.updateSystemName(sys, data.name);
			delete data.name;
		}
		sys.data = { ...sys.data, ...data };
		this.addChange('update', sys, 'data');
		this.emitChanges();
		return true;
	}

	updateEdge(id: EdgeIdentifier, data: object): Edge | null {
		let edge = this.getEdgeFromId(id);
		if (!edge) return null;
		edge.data = { ...edge.data, ...data };
		this.addChange('update', edge, 'data');
		this.emitChanges();
		return edge;
	}

	// Moving Data

	moveSystem(id: NodeIdentifier, newParentId: NodeIdentifier | null = null): boolean {
		let system = this.getSystem(id);
		this.addChange('remove', system);
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
		this.addChange('add', system);
		this.emitChanges();
		return true;
	}

	_moveEdge(edge: null | Edge, newSource: null | NodeIdentifier = null, newTarget: null | NodeIdentifier = null, keepBidirectional: boolean = true): boolean {
		if (!edge) return false;
		let newSourceNode = newSource === null ? edge.source : this.getSystem(newSource);
		let newTargetNode = newTarget === null ? edge.target : this.getSystem(newTarget);
		if (!newSourceNode || !newTargetNode) return false;

		this.addChange('remove', edge);
		if (keepBidirectional) {
			let otherEdge = this.getEdge(edge.target, edge.source);
			if (otherEdge) this._moveEdge(otherEdge, newTargetNode, newSourceNode, false);
		}

		let wasVertical = this.isVerticalEdge(edge);
		if (wasVertical) edge.source?.removeChild(edge.target.id);

		edge.source = newSourceNode;
		edge.target = newTargetNode;
		let isVertical = this.isVerticalEdge(edge);
		if (isVertical) edge.source.addChild(edge.target);

		this.addChange('add', edge);
		return true;
	}

	moveEdge(edge: null | Edge, newSource: null | NodeIdentifier = null, newTarget: null | NodeIdentifier = null, keepBidirectional: boolean = true): boolean {
		let res = this._moveEdge(edge, newSource, newTarget, keepBidirectional);
		this.emitChanges();
		return res;
	}

	moveEdgeId(id: EdgeIdentifier, newSource: null | NodeIdentifier = null, newTarget: null | NodeIdentifier = null, keepBidirectional: boolean = true): boolean {
		let edge = this.getEdgeFromId(id);
		let res = this._moveEdge(edge, newSource, newTarget, keepBidirectional);
		this.emitChanges();
		return res;
	}

	// Looping

	forEachSystem(callback: (value: SystemNode) => void) {
		return this.forEachNode(callback);
	}

	forEachNode(callback: (value: SystemNode) => void) {
		this.systemsByID.forEach(callback);
	}

	/**
	 * @callback edgeCallback
	 * @param {Edge} edge
	 */

	/**
	 * Calls the callback for each edge in the graph.
	 * @param {edgeCallback} callback
	 */
	forEachEdge(callback: (value: Edge) => void) {
		this.edges.forEach(callback);
	}

	/**
	 * Calls the callback for each edge in the graph.
	 * @param {edgeCallback} callback
	 */
	forEachLink(callback: (value: Edge) => void) {
		return this.forEachEdge(callback);
	}

	/**
	 * Calls the callback for each horizontal edge in the graph
	 * @param {edgeCallback} callback
	 */
	forEachHorizontalEdge(callback: (value: Edge) => void) {
		this.edges.filter((e) => !this.isVerticalEdge(e)).forEach(callback);
	}

	/**
	 * Calls the callback for each vertical edge in the graph
	 * @param {edgeCallback} callback
	 */
	forEachVerticalEdge(callback: (value: Edge) => void) {
		this.edges.filter(this.isVerticalEdge).forEach(callback);
	}

	// Positioning

	// positionSystem(id, x, y) {
	// 	// TODO
	// }

	// positionSystemTree(id, x, y) {
	// 	// TODO
	// }

	// automaticLayout(layout) {
	// 	// TODO
	// }

	// positionEdge(params) {
	// 	// TODO
	// }

	// // Saving / Loading

	// save(format, location = null) {
	// 	// TODO
	// }

	// load(location, format = null) {
	// 	// TODO
	// }

	// saveView(name) {
	// 	// TODO
	// }

	// deleteView(name) {
	// 	// TODO
	// }

	// goBack(steps = 1) {
	// 	// TODO
	// }

	// goForward(steps = 1) {
	// 	// TODO
	// }
}
