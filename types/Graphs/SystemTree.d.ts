import EventManager from '../Utils/EventManager';
import { ID } from '../Utils/id';
import Edge from './Edge';
import SystemNode from './SystemNode';
export type SystemTreeData = any;
export default class SystemTree extends EventManager {
    id: ID;
    data: SystemTreeData;
    root: null | SystemNode;
    /**
     * Create a new SystemTree object. SystemTrees store the tree-like structure of systems and allows easy interaction with them. This class also adds events to listen to changes in the tree.
     * @param {?SystemNode} root Root node of the systemTree.
     * @param {any} data Data to store with the systemTree.
     */
    constructor(root?: null | SystemNode, data?: SystemTreeData | object);
    get height(): number;
    isEmpty(): boolean;
    getSystems(startLayer?: number, endLayer?: number): SystemNode[];
    getSystem(id: ID): SystemNode | null;
    getEdge(toId: ID): Edge | undefined;
    getEdgesFrom(fromId: null | ID): Edge[];
    getVerticalLinks(nodeId?: null | ID, includeLinkFromParent?: boolean): Edge[];
    addChild(system: SystemNode): void;
    addSystem(system: SystemNode, parentId?: ID | null): void;
    /**
     * Change the Parent of a system in this tree.
     * @param {Number} systemId ID of the system to change the parent of
     * @param {?SystemNode} newParent The new parent of this system. If set to null, the system will have no parent.
     * @returns {Boolean} Indicates whether the system was found and the parent could thus be changed.
     */
    changeParent(systemId: ID, newParent?: null | SystemNode): boolean;
    removeSystem(systemId: ID): boolean;
}
