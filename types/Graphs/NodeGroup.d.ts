export = NodeGroup;
declare class NodeGroup {
    /**
     * Create a Group of Nodes. A group can contain further groups as well as direct children.
     * @param {String} name Name of the group
     * @param {GroupData} data Data associated with the group
     * @param {SystemNode[]} nodes Direct Children-Nodes of this group
     */
    constructor(id?: number, name?: string, data?: GroupData, nodes?: SystemNode[]);
    /** @type {number} */
    id: number;
    /** @type {String} */
    name: string;
    /** @type {GroupData} */
    data: GroupData;
    /** @type {SystemNode[]} */
    nodes: SystemNode[];
    /** @type {NodeGroup[]} */
    groups: NodeGroup[];
    /** @type {?NodeGroup} */
    parentGroup: NodeGroup | null;
    findSubGroup(cb: any): any;
    addNodes(...nodes: any[]): this;
    addGroups(...groups: any[]): this;
    removeNode(node: any): any;
    removeSubGroup(id: any): any;
}
declare namespace NodeGroup {
    export { GroupData };
}
type GroupData = Object;
import SystemNode = require("./SystemNode");
