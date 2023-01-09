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
    data: SystemData;
    parent: SystemNode;
    children: SystemNode[];
    /**
     * Create a new SystemNode. SystemNodes represent single systems in a tree-like hierachy of systems. To connect several systems (or systemTrees) together, you need to use the SystemLandscape class.
     * @param {?SystemNode} parent The parent of this tree-node
     * @param {any} data Data associated with this node
     */
    constructor(name?: string | null | undefined, parent?: null | SystemNode, data?: SystemData | object);
    getEdge(toId: ID): Edge | undefined;
    getVerticalLinks(includeLinkFromParent?: boolean): Edge[];
    changeSystemTree(systemTree: SystemTree | null): void;
    addChild(child: SystemNode): SystemNode;
    removeChild(id: ID): SystemNode | null;
    remove(): this;
}
