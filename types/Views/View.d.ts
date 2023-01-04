import SystemLandscape from '../Graphs/SystemLandscape';
import SystemNode from '../Graphs/SystemNode';
import SystemTree from '../Graphs/SystemTree';
import EventManager from '../Utils/EventManager';
import NodeGroup from '../Graphs/NodeGroup';
import Edge from '../Graphs/Edge';
import Change from '../Utils/Change';
/**
 * @typedef {Object} ViewSettings
 * @property {boolean} allowUpwardEdgeInheritance Let A be a parent node with B as its child node. If A is visible and B isn't, then this setting determines whether edges connecting B will be shown as connecting A. Defaults to true.
 */
export type ViewSettings = {
    allowUpwardEdgeInheritance: boolean;
};
export default class View extends EventManager {
    graph: null | SystemLandscape;
    visibleNodes: SystemNode[];
    visibleEdges: Edge[];
    grouping: NodeGroup;
    allowUpwardEdgeInheritance: boolean;
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
    constructor(settings?: object | ViewSettings);
    init(graph: SystemLandscape): this;
    /**
     * @param {Change[]} changes
     */
    _onGraphChange(changes: Change<SystemNode | SystemTree | Edge>[]): void;
    _onNodeAdded(node: SystemNode): void;
    _onNodeUpdated(node: SystemNode): void;
    _onNodeRemoved(node: SystemNode): void;
    _onEdgeAdded(edge: Edge): void;
    _onEdgeUpdated(edge: Edge): void;
    _onEdgeRemoved(edge: Edge): void;
    _onSystemTreeAdded(systemTree: SystemTree): void;
    _onSystemTreeUpdated(systemTree: SystemTree): void;
    _onSystemTreeRemoved(systemTree: SystemTree): void;
    /**
     * Check whether the specified node is visible or not. This function should be overwritten by children classes.
     * @param {SystemNode} node
     * @returns {boolean}
     */
    _isNodeVisible(node: SystemNode): boolean;
    _isNodeOrAncestorVisible(node: SystemNode): boolean;
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
