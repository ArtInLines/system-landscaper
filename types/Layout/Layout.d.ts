export = Layout;
declare class Layout {
    constructor(nodeWidth: any, nodeHeight: any);
    nodeWidth: any;
    nodeHeight: any;
    /**
     * Check whether the node is positioned within the confines set by the rect.
     * @param {Coordinate} coord Coordinate of the node's center
     * @param {Number} nodeWidth Width of the Node
     * @param {Number} nodeHeight Height of the Node
     * @param {Rectangle} rect Sets the maximum values that are possible for the nodes
     * @returns {boolean}
     */
    isNodePosInMaxSize(coord: Coordinate, nodeWidth: number, nodeHeight: number, rect: Rectangle): boolean;
    /**
     * Check whether the node is overlapping with any other already positioned node
     * @param {Coordinate} coord Coordinate of the node's center
     * @param {Number} nodeWidth Width of the Node
     * @param {Number} nodeHeight Height of the Node
     * @param {Map<Number, Coordinate>} currentNodePositions Mapping from NodeIds to the node' current positions
     * @returns {boolean}
     */
    areNodesOverlapping(coord: Coordinate, nodeWidth: number, nodeHeight: number, currentNodePositions: Map<number, Coordinate>): boolean;
    /**
     * Gives each node a position based on all other visible nodes.
     * @param {Iterable<SystemNode>} nodes Iterable of all visible nodes
     * @param {NodeGroup} grouping Grouping of all visible nodes
     * @param {Map<Number, Coordinate>} currentNodePositions Mapping from Node-Ids to their current positions
     * @param {Rectangle} rect The rectangle in which all nodes are to be positioned
     * @param {Number} nodeWidth Width of the Node
     * @param {Number} nodeHeight Height of the Node
     * @returns {Map<Number, Coordinate>} Mapping from Node-Ids to their new positions
     */
    layout(nodes: Iterable<SystemNode>, grouping: NodeGroup, currentNodePositions: Map<number, Coordinate>, rect: Rectangle, nodeWidth: number, nodeHeight: number): Map<number, Coordinate>;
}
import Rectangle = require("../Geom/Rectangle");
