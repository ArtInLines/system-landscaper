import EventManager from '../Utils/EventManager';
import newID, { ID } from '../Utils/id';
import Edge from './Edge';
import SystemNode from './SystemNode';

// require('./System) can't be called at the top:
// https://stackoverflow.com/questions/29023320/resolving-circular-dependency-in-nodejs-model
// Solution: require('./System') inside each function that needs access to it.
// Another solution would be to not use class syntax but function prototypes
// That would work since Classes are technically just syntactic sugar
// Problem with that is the difficult use of "this":
// https://stackoverflow.com/a/20279485/13764271

export default class SystemTree extends EventManager {
	id: ID;
	data: object;
	root: null | SystemNode;

	/**
	 * Create a new SystemTree object. SystemTrees store the tree-like structure of systems and allows easy interaction with them. This class also adds events to listen to changes in the tree.
	 * @param {?SystemNode} root Root node of the systemTree.
	 * @param {any} data Data to store with the systemTree.
	 */
	constructor(root: null | SystemNode = null, data: object = {}) {
		super();
		this.id = newID();
		this.data = data || {};
		this.root = root;
		if (this.root instanceof SystemNode) this.root.changeSystemTree(this);
	}

	get height(): number {
		return this.root?.height ?? 0;
	}

	// Checks

	isEmpty(): boolean {
		return !this.root && Object.keys(this.data).length === 0;
	}

	// Getting Data

	getSystems(startLayer: number = 0, endLayer: number = startLayer): SystemNode[] {
		return this.root?.getChildren(startLayer, endLayer) as SystemNode[];
	}

	getSystem(id: ID): SystemNode | null {
		return this.root?.getByID(id) as SystemNode | null;
	}

	getEdge(toId: ID): Edge | undefined {
		return this.root?.getEdge(toId);
	}

	getEdgesFrom(fromId: null | ID): Edge[] {
		return this.getVerticalLinks(fromId, false);
	}

	getVerticalLinks(nodeId: null | ID = null, includeLinkFromParent = false): Edge[] {
		let node = nodeId ? this.getSystem(nodeId) : this.root;
		return node?.getVerticalLinks(includeLinkFromParent) ?? [];
	}

	// Adding Data

	addChild(system: SystemNode): void {
		this.addSystem(system);
	}

	addSystem(system: SystemNode, parentId: ID | null = null): void {
		// TODO
	}

	// Updating Data

	/**
	 * Change the Parent of a system in this tree.
	 * @param {Number} systemId ID of the system to change the parent of
	 * @param {?SystemNode} newParent The new parent of this system. If set to null, the system will have no parent.
	 * @returns {Boolean} Indicates whether the system was found and the parent could thus be changed.
	 */
	changeParent(systemId: ID, newParent: null | SystemNode = null): boolean {
		let system = this.getSystem(systemId);
		if (!system) return false;
		system?.changeParent(newParent);
		return true;
	}

	// Removing Data

	removeSystem(systemId: ID): boolean {
		let system = this.getSystem(systemId);
		if (!system) return false;
		system.remove();

		return true;
	}
}
