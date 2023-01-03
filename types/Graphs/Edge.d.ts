export = Edge;
declare class Edge extends EventManager {
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
    constructor(source: SystemNode, target: SystemNode, data?: any);
    id: number;
    source: SystemNode;
    target: SystemNode;
    data: any;
    get fromId(): number;
    get toId(): number;
    setSource(source: any): void;
    setTarget(target: any): void;
    setData(data: any): void;
    updateData(data: any): void;
    copy(): Edge;
}
import EventManager = require("../Utils/EventManager.js");
import SystemNode = require("./SystemNode.js");
