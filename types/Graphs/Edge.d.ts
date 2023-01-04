import EventManager from '../Utils/EventManager';
import { ID } from '../Utils/id';
import SystemNode from './SystemNode';
export type EdgeData = object;
export default class Edge extends EventManager {
    id: ID;
    source: SystemNode;
    target: SystemNode;
    data: EdgeData;
    /**
     * Create a new Edge to connect to Nodes. This class offers certain events to listen to changes:

     - `sourceChanged`: When the source of this edge changes. Args: `(newSourceID, edge)`
     - `targetChanged`: When the target of this edge changes. Args: `(newTargetID, edge)`
     - `dataChanged`: When the data of this edge changes. Args: `(updatedData, edge)`
     - `update`: When any of the above events occurs. Args: `(...args of the event - this edge is always the second argument)`
     * @param {SystemNode} source ID of the source node
     * @param {SystemNode} target ID of the target node
     * @param {any} data Data associated with this edge. Defaults to an empty object.
     */
    constructor(source: SystemNode, target: SystemNode, data?: EdgeData);
    get fromId(): number;
    get toId(): number;
    setSource(source: SystemNode): void;
    setTarget(target: SystemNode): void;
    setData(data: EdgeData): void;
    addToData(data: EdgeData): void;
    copy(): Edge;
}
