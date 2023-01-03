export = SystemLandscape;
declare class SystemLandscape extends EventManager {
    /** @type {number} */
    id: number;
    /** @type {SystemTree[]} */
    systemTrees: SystemTree[];
    /** @type {Trie} */
    systemsByName: Trie;
    /** @type {Map<Number, SystemNode>} */
    systemsByID: Map<number, SystemNode>;
    /** @type {Edge[]} */
    edges: Edge[];
    /** @type {Object<Object<Change[]>>} */
    changes: any;
    hasSystem(id: any): boolean;
    hasEdgeId(id: any): boolean;
    hasEdge(from?: null, to?: null): boolean;
    isVerticalEdge(edge: any): boolean;
    sameNode(a: any, b: any): boolean;
    /**
     * Get the system uniquely identified by its ID or name.
     * @param {Number|String|SystemNode} id The unique ID or name of the system. If the system itself is inputted, it is simply returned.
     * @returns {?SystemNode}
     */
    getSystem(id: number | string | SystemNode): SystemNode | null;
    getNode(id: any): SystemNode | null;
    getSystemTree(id: any): SystemTree | undefined;
    getSystems(startLayer?: number, endLayer?: number, flatten?: boolean): import("../Utils/Tree")[] | import("../Utils/Tree")[][];
    getSystemsByName(name: any): string[];
    getSystemByName(name: any): any;
    getEdgesOfSystem(systemID: any, horizontal?: boolean, vertical?: boolean, includeLinksOfChildren?: boolean): Set<any>;
    getEdgeId(id: any): Edge | null;
    getLinkId(id: any): Edge | null;
    getEdge(from: any, to: any): Edge | undefined;
    getLink(from: any, to: any): Edge | undefined;
    getHorizontalEdges(): Edge[];
    getVerticalEdges(): Edge[];
    getMaxHeight(): number;
    getSystemsCount(): number;
    getNodesCount(): number;
    getNodeCount(): number;
    getSystemTreesCount(): number;
    getTreesCount(): number;
    getEdgesCount(): number;
    getLinksCount(): number;
    getLinkCount(): number;
    /**
     *
     * @param {'add'|'remove'|'update'} type
     * @param {any} el
     * @param {?String|String[]} keys
     */
    addChange(type: 'add' | 'remove' | 'update', el: any, keys?: (string | string[]) | null): Change;
    emitChanges(): void;
    onVerticalEdgeAdded(edge: any, parent: any, child: any): void;
    onVerticalEdgeRemoved(edge: any, parent: any, child: any): void;
    onSystemTreeChanged(systemTree: any, node: any): void;
    addEventListenersToSystem(system: any): void;
    addEventListenersToSystemTree(tree: any): void;
    addSystem(name?: null, data?: {}, parent?: null): SystemNode;
    _addEdge(edge: any): any;
    addEdge(edge: any): any;
    /**
     * Create a new edge to link two systems/systemTrees. If the systems are not in the landscape, they will be added. If an edge between the two systems already exists, it will be returned.
     * @param {?SystemNode|SystemTree} from SystemNode or SystemTree from which the edge comes from
     * @param {?SystemNode|SystemTree} to SystemNode or SystemTree to which the edge goes to
     * @param {any} data Data associated with the edge
     */
    _linkSystems(from: (SystemNode | SystemTree) | null, to: (SystemNode | SystemTree) | null, data?: any): Edge;
    /**
     * Create a new edge to link two systems/systemTrees. If the systems are not in the landscape, they will be added. If an edge between the two systems already exists, it will be returned.
     * @param {?SystemNode|SystemTree} from SystemNode or SystemTree from which the edge comes from
     * @param {?SystemNode|SystemTree} to SystemNode or SystemTree to which the edge goes to
     * @param {any} data Data associated with the edge
     */
    linkSystems(from: (SystemNode | SystemTree) | null, to: (SystemNode | SystemTree) | null, data?: any): Edge;
    linkSystemsUndirected(system1: any, system2: any, data: any): void;
    _removeSystemTree(id: any): SystemTree | undefined;
    removeSystem(id: any): any;
    _removeSystem(sys: any): any;
    _removeEdge(id: any, keepBidirectional?: boolean): boolean;
    removeEdge(id: any, keepBidirectional?: boolean): boolean;
    updateSystemName(id: any, newName: any): void;
    updateSystem(id: any, data: any): SystemNode | null;
    updateEdge(id: any, data: any): Edge | null;
    moveSystem(id: any, newParentId?: null): false | undefined;
    moveEdgeId(id: any, newSource?: null, newTarget?: null, keepBidirectional?: boolean): boolean;
    _moveEdge(edge: any, newSource?: null, newTarget?: null, keepBidirectional?: boolean): boolean;
    moveEdge(edge: any, newSource?: null, newTarget?: null, keepBidirectional?: boolean): boolean;
    forEachSystem(callback: any): void;
    forEachNode(callback: any): void;
    /**
     * @callback edgeCallback
     * @param {Edge} edge
     */
    /**
     * Calls the callback for each edge in the graph.
     * @param {edgeCallback} callback
     */
    forEachEdge(callback: (edge: Edge) => any): void;
    /**
     * Calls the callback for each edge in the graph.
     * @param {edgeCallback} callback
     */
    forEachLink(callback: (edge: Edge) => any): void;
    /**
     * Calls the callback for each horizontal edge in the graph
     * @param {edgeCallback} callback
     */
    forEachHorizontalEdge(callback: (edge: Edge) => any): void;
    /**
     * Calls the callback for each vertical edge in the graph
     * @param {edgeCallback} callback
     */
    forEachVerticalEdge(callback: (edge: Edge) => any): void;
    positionSystem(id: any, x: any, y: any): void;
    positionSystemTree(id: any, x: any, y: any): void;
    automaticLayout(layout: any): void;
    positionEdge(params: any): void;
    save(format: any, location?: null): void;
    load(location: any, format?: null): void;
    saveView(name: any): void;
    deleteView(name: any): void;
    goBack(steps?: number): void;
    goForward(steps?: number): void;
}
import EventManager = require("../Utils/EventManager");
import SystemTree = require("./SystemTree");
import Trie = require("../Utils/Trie");
import SystemNode = require("./SystemNode");
import Edge = require("./Edge");
import Change = require("../Utils/Change");
