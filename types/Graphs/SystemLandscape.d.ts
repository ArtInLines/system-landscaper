import { ID } from '../Utils/id';
import Trie from '../Utils/Trie';
import EventManager from '../Utils/EventManager';
import Change, { ChangeKind } from '../Utils/Change';
import SystemTree from './SystemTree';
import SystemNode from './SystemNode';
import Edge from './Edge';
export type NodeIdentifier = ID | string | SystemNode;
export type EdgeIdentifier = ID | Edge;
export type ChangeObj = {
    systems: Change<SystemNode>[];
    edges: Change<Edge>[];
    trees: Change<SystemTree>[];
    [index: string]: Change<SystemNode | SystemTree | Edge>[];
};
export type AllChangesObj = {
    [Property in ChangeKind]: ChangeObj;
};
export default class SystemLandscape extends EventManager {
    id: ID;
    systemTrees: SystemTree[];
    systemsByName: Trie<SystemNode>;
    systemsByID: Map<ID, SystemNode>;
    edges: Edge[];
    changes: AllChangesObj;
    constructor();
    hasSystem(id: ID): boolean;
    hasEdgeId(id: ID): boolean;
    hasEdge(from?: null | SystemNode, to?: null | SystemNode): boolean;
    isVerticalEdge(edge: Edge): boolean;
    sameNode(a: NodeIdentifier, b: NodeIdentifier): boolean;
    /**
     * Get the system uniquely identified by its ID or name.
     * @param {ID|String|SystemNode} id The unique ID or name of the system. If the system itself is inputted, it is simply returned.
     * @returns {?SystemNode}
     */
    getSystem(id: NodeIdentifier): SystemNode | null;
    getNode(id: NodeIdentifier): SystemNode | null;
    getSystemTree(id: ID): SystemTree | undefined;
    getSystems(startLayer: number, endLayer: number, flatten: true): SystemNode[];
    getSystems(startLayer: number, endLayer: number, flatten: false): SystemNode[][];
    getSystemsByName(name: string): string[];
    getSystemByName(name: string): SystemNode | null;
    getEdgesOfSystem(systemID: ID, horizontal?: boolean, vertical?: boolean, includeLinksOfChildren?: boolean): Set<Edge>;
    getEdgeFromId(id: EdgeIdentifier): Edge | null;
    getEdge(from: NodeIdentifier, to: NodeIdentifier): Edge | undefined;
    getHorizontalEdges(): Edge[];
    getVerticalEdges(): Edge[];
    getMaxHeight(): number;
    getNodesCount(): number;
    getSystemTreesCount(): number;
    getEdgesCount(): number;
    /**
     *
     * @param {'add'|'remove'|'update'} type
     * @param {any} el
     * @param {?String|String[]} subject
     */
    addChange(type: ChangeKind, el: any, subject?: null | string | string[]): Change<any>;
    emitChanges(): void;
    onVerticalEdgeAdded(edge: Edge): void;
    onVerticalEdgeRemoved(edge: Edge): void;
    onSystemTreeChanged(systemTree: SystemTree, node: SystemNode): void;
    addEventListenersToSystem(system: SystemNode): void;
    addEventListenersToSystemTree(tree: SystemTree): void;
    addSystem(name: string, data?: object, parent?: null | string | SystemNode): SystemNode;
    _addEdge(edge: Edge): Edge;
    addEdge(edge: Edge): Edge;
    /**
     * Create a new edge to link two systems/systemTrees. If the systems are not in the landscape, they will be added. If an edge between the two systems already exists, it will be returned.
     * @param {?SystemNode|SystemTree} from SystemNode or SystemTree from which the edge comes from
     * @param {?SystemNode|SystemTree} to SystemNode or SystemTree to which the edge goes to
     * @param {any} data Data associated with the edge
     */
    _linkSystems(from: NodeIdentifier, to: NodeIdentifier, data?: object): Edge | null;
    /**
     * Create a new edge to link two systems/systemTrees. If the systems are not in the landscape, they will be added. If an edge between the two systems already exists, it will be returned.
     * @param {?SystemNode|SystemTree} from SystemNode or SystemTree from which the edge comes from
     * @param {?SystemNode|SystemTree} to SystemNode or SystemTree to which the edge goes to
     * @param {any} data Data associated with the edge
     */
    linkSystems(from: NodeIdentifier, to: NodeIdentifier, data?: object): Edge | null;
    linkSystemsUndirected(system1: NodeIdentifier, system2: NodeIdentifier, data: object): void;
    _removeSystemTree(id: ID): SystemTree | null;
    _removeSystem(sys: SystemNode): SystemNode;
    removeSystem(id: ID): SystemNode | SystemTree | null;
    _removeEdge(id: EdgeIdentifier, keepBidirectional?: boolean): boolean;
    removeEdge(id: EdgeIdentifier, keepBidirectional?: boolean): boolean;
    updateSystemName(id: NodeIdentifier, newName: string): boolean;
    updateSystem(id: NodeIdentifier, data: {
        name?: string;
    }): boolean;
    updateEdge(id: EdgeIdentifier, data: object): Edge | null;
    moveSystem(id: NodeIdentifier, newParentId?: NodeIdentifier | null): boolean;
    _moveEdge(edge: null | Edge, newSource?: null | NodeIdentifier, newTarget?: null | NodeIdentifier, keepBidirectional?: boolean): boolean;
    moveEdge(edge: null | Edge, newSource?: null | NodeIdentifier, newTarget?: null | NodeIdentifier, keepBidirectional?: boolean): boolean;
    moveEdgeId(id: EdgeIdentifier, newSource?: null | NodeIdentifier, newTarget?: null | NodeIdentifier, keepBidirectional?: boolean): boolean;
    forEachSystem(callback: (value: SystemNode) => void): void;
    forEachNode(callback: (value: SystemNode) => void): void;
    /**
     * @callback edgeCallback
     * @param {Edge} edge
     */
    /**
     * Calls the callback for each edge in the graph.
     * @param {edgeCallback} callback
     */
    forEachEdge(callback: (value: Edge) => void): void;
    /**
     * Calls the callback for each edge in the graph.
     * @param {edgeCallback} callback
     */
    forEachLink(callback: (value: Edge) => void): void;
    /**
     * Calls the callback for each horizontal edge in the graph
     * @param {edgeCallback} callback
     */
    forEachHorizontalEdge(callback: (value: Edge) => void): void;
    /**
     * Calls the callback for each vertical edge in the graph
     * @param {edgeCallback} callback
     */
    forEachVerticalEdge(callback: (value: Edge) => void): void;
}
