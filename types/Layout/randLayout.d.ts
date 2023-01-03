/**
 * Gives each node a position based on all other visible nodes.
 * @param {Iterable<SystemNode>} nodes Iterable of all visible nodes
 * @param {NodeGroup} grouping Grouping of all visible nodes
 * @param {Map<Number, Coordinate>} currentNodePositions Mapping from Node-Ids to their current positions
 * @param {Coordinate} maxSize Sets the maximum values that are possible for the nodes
 */
export function randLayout(nodes: Iterable<SystemNode>, grouping: NodeGroup, currentNodePositions: Map<number, Coordinate>, maxSize: Coordinate): Map<any, any>;
/**
 * Gives a single node a position based on all other visible nodes.
 * @param {SystemNode} node Node to be positioned
 * @param {NodeGroup} grouping Grouping of all visible nodes
 * @param {Map<Number, Coordinate>} currentNodePositions Mapping from Node-Ids to their current positions
 * @param {Coordinate} maxSize Sets the maximum values that are possible for the nodes
 */
export function randSingleLayout(node: SystemNode, grouping: NodeGroup, currentNodePositions: Map<number, Coordinate>, maxSize: Coordinate): any;
import SystemNode = require("../Graphs/SystemNode.js");
import NodeGroup = require("../Graphs/NodeGroup.js");
