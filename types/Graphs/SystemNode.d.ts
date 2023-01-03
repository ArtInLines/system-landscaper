export = SystemNode;
declare class SystemNode extends Tree {
    /**
     * Create a new SystemNode. SystemNodes represent single systems in a tree-like hierachy of systems. To connect several systems (or systemTrees) together, you need to use the SystemLandscape class.
     * @param {?SystemNode} parent The parent of this tree-node
     * @param {any} data Data associated with this node
     */
    constructor(name?: null, parent?: SystemNode | null, data?: any);
    name: any;
    systemTree: any;
    edgesToChildren: any[];
    /** @type {?SystemNode} (For documentation only, remove this and use typescript type-annotations instead in the future) */
    parent: SystemNode | null;
    getEdge(toId: any): any;
    getVerticalLinks(includeLinkFromParent?: boolean): any[];
    changeSystemTree(systemTree: any): void;
    addChild(child: any): any;
    removeChild(id: any): Tree | null;
    remove(): SystemNode;
}
import Tree = require("../Utils/Tree");
