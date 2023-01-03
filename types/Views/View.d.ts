export = View;
declare class View extends EventManager {
    /**
     * Base-View Class. Probably you want to use a subclass of this.
     *
     * Emitted Events:
     * - "[type]-add"
     * - "[type]-remove"
     * - "[type]-update"
     *
     * where "type" is one of:
     * - node
     * - edge
     * - group
     */
    constructor(settings?: {});
    /** @type {?SystemLandscape} */
    graph: SystemLandscape | null;
    /** @type {SystemNode[]} */
    visibleNodes: SystemNode[];
    /** @type {Edge[]} */
    visibleEdges: Edge[];
    /** @type {NodeGroup} */
    grouping: NodeGroup;
    /** @type {boolean} */
    alloweUpwardEdgeInheritance: boolean;
    init(graph: any): this;
    /**
     * @param {Change[]} changes
     */
    _onGraphChange(changes: Change[]): void;
    _onNodeAdded(node: any): void;
    _onNodeUpdated(node: any): void;
    _onNodeRemoved(node: any): void;
    _onEdgeAdded(edge: any): void;
    _onEdgeUpdated(edge: any): void;
    _onEdgeRemoved(edge: any): void;
    _onSystemTreeAdded(systemTree: any): void;
    _onSystemTreeUpdated(systemTree: any): void;
    _onSystemTreeRemoved(systemTree: any): void;
    /**
     * Check whether the specified node is visible or not. This function should be overwritten by children classes.
     * @param {SystemNode} node
     * @returns {boolean}
     */
    _isNodeVisible(node: SystemNode): boolean;
    _isNodeOrAncestorVisible(node: any): any;
    /**
     * Get a list of all Nodes that are visible in this view.
     * @params {boolean} cached Wether to use the cached list or not. If not, the cache gets updated. Default: true
     * @returns {SystemNode[]}
     */
    getVisibleNodes(cached?: boolean): SystemNode[];
    /**
     *
     * @param {SystemNode} node
     */
    _addNodeToGroups(node: SystemNode): void;
    /**
     * Check whether the specified node is visible or not. This function should be overwritten by children classes.
     * @param {Edge} edge
     * @returns {boolean}
     */
    _isEdgeVisible(edge: Edge): boolean;
    /**
     * Goes up the system tree until a node is visible. That node is returned. If no parent-node is visible, then null is returned.
     * @param {SystemNode} node
     * @returns {?SystemNode}
     */
    _getFirstVisibleAncestor(node: SystemNode): SystemNode | null;
    /**
     * Get a list of all Edges that should be visible as edges/arrows in this view.
     * @params {boolean} cached Wether to use the cached list or not. If not, the cache gets updated. Default: true
     * @returns {Edge[]}
     */
    getVisibleEdges(cached?: boolean): Edge[];
}
declare namespace View {
    export { viewSettings };
}
import EventManager = require("../Utils/EventManager");
import SystemLandscape = require("../Graphs/SystemLandscape");
import SystemNode = require("../Graphs/SystemNode");
import Edge = require("../Graphs/Edge");
import NodeGroup = require("../Graphs/NodeGroup");
import Change = require("../Utils/Change");
type viewSettings = {
    /**
     * Let A be a parent node with B as its child node. If A is visible and B isn't, then this setting determines whether edges connecting B will be shown as connecting A. Defaults to true.
     */
    alloweUpwardEdgeInheritance: boolean;
};
