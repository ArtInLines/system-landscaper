import { ID } from '../Utils/id';
import Tree from '../Utils/Tree';
import Edge from './Edge';
import SystemTree from './SystemTree';

export type EdgeAddedEv = [Edge];
export type EdgeRemovedEv = [Edge];
export type SystemTreeChangedEv = [SystemTree, SystemNode];
export type SystemData = any;

export default class SystemNode extends Tree {
	name: string;
	systemTree: null | SystemTree;
	edgesToChildren: Edge[];
	declare data: SystemData;
	declare parent: SystemNode;
	declare children: SystemNode[];

	/**
	 * Create a new SystemNode. SystemNodes represent single systems in a tree-like hierachy of systems. To connect several systems (or systemTrees) together, you need to use the SystemLandscape class.
	 * @param {?SystemNode} parent The parent of this tree-node
	 * @param {any} data Data associated with this node
	 */
	constructor(name: string | null | undefined = null, parent: null | SystemNode = null, data: SystemData | object = {}) {
		super(null, data);
		this.name = name ?? this.id.toString(10);
		this.systemTree = parent instanceof SystemNode ? parent.systemTree : null;
		this.edgesToChildren = [];
		this.changeParent(parent);
	}

	// Getting Data

	getEdge(toId: ID): Edge | undefined {
		return this.edgesToChildren.find((edge) => edge.toId === toId);
	}

	getVerticalLinks(includeLinkFromParent: boolean = false): Edge[] {
		let res: Edge[] = [];
		if (includeLinkFromParent && this.parent) res.push(this.parent.getEdge(this.id)!);
		res.push(...this.edgesToChildren);
		return res;
	}

	// Updating Data

	changeSystemTree(systemTree: SystemTree | null): void {
		this.systemTree = systemTree;
		this.emit('systemTreeChanged', systemTree, this);
		this.children.forEach((child) => child.changeSystemTree(systemTree));
	}

	// Adding Data

	addChild(child: SystemNode): SystemNode {
		super.addChild(child);
		child.changeSystemTree(this.systemTree);
		const edge = new Edge(this, child);
		this.edgesToChildren.push(edge);
		this.emit('edgeAdded', edge);
		return child;
	}

	// Removing Data

	removeChild(id: ID): SystemNode | null {
		let c = super.removeChild(id) as SystemNode | null;
		if (c) {
			if (c.systemTree) c.systemTree = null;
			let idx = this.edgesToChildren.findIndex((edge) => edge.toId !== id);
			if (idx !== -1) {
				this.emit('edgeRemoved', this.edgesToChildren[idx]);
				this.edgesToChildren.splice(idx, 1);
			}
		}
		return c;
	}

	remove() {
		super.remove();
		this.systemTree = null;
		return this;
	}
}
