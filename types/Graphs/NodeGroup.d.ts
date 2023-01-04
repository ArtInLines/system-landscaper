import SystemNode from './SystemNode';
import { ID } from '../Utils/id';
/**
 * @typedef {Object} GroupData
 */
type GroupData = object;
export default class NodeGroup {
    id: ID;
    name: string;
    data: GroupData;
    nodes: SystemNode[];
    groups: NodeGroup[];
    parentGroup: null | NodeGroup;
    /**
     * Create a Group of Nodes. A group can contain further groups as well as direct children.
     * @param {String} name Name of the group
     * @param {GroupData} data Data associated with the group
     * @param {SystemNode[]} nodes Direct Children-Nodes of this group
     */
    constructor(id?: ID, name?: null | string, data?: GroupData, nodes?: null | SystemNode[]);
    findSubGroup(cb: (this: void, value: NodeGroup, index?: number, obj?: NodeGroup[]) => boolean): NodeGroup | null;
    addNodes(...nodes: SystemNode[]): this;
    addGroups(...groups: NodeGroup[]): this;
    removeNode(node: SystemNode): SystemNode | null;
    removeSubGroup(id: ID): NodeGroup | null;
}
export {};
