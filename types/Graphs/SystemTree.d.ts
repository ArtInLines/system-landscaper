export = SystemTree;
declare class SystemTree extends EventManager {
    /**
     * Create a new SystemTree object. SystemTrees store the tree-like structure of systems and allows easy interaction with them. This class also adds events to listen to changes in the tree.
     * @param {?SystemNode} root Root node of the systemTree.
     * @param {any} data Data to store with the systemTree.
     */
    constructor(root?: SystemNode | null, data?: any);
    id: number;
    data: any;
    root: SystemNode | null;
    get height(): number;
    isEmpty(): boolean;
    getSystems(startLayer?: number, endLayer?: number): import("../Utils/Tree")[];
    getSystem(id: any): import("../Utils/Tree") | null;
    getEdge(toId: any): any;
    getEdgesFrom(fromId: any): any;
    getVerticalLinks(nodeId?: null, includeLinkFromParent?: boolean): any;
    addChild(system: any): void;
    addSystem(system: any, parentId?: null): void;
    /**
     * Change the Parent of a system in this tree.
     * @param {Number} systemId ID of the system to change the parent of
     * @param {?SystemTree} newParent The new parent of this system. If set to null, the system will have no parent.
     * @returns {Boolean} Indicates whether the system was found and the parent could thus be changed.
     */
    changeParent(systemId: number, newParent?: SystemTree | null): boolean;
    removeChild(id: any): boolean;
    removeSystem(systemId: any): boolean;
}
import EventManager = require("../Utils/EventManager");
import SystemNode = require("./SystemNode");
