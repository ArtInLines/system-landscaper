import Coordinate from '../Geom/Coordinate';
import SystemNode from '../Graphs/SystemNode';
import NodeGroup from '../Graphs/NodeGroup';
import { ID } from '../Utils/id';
/**
 * Gives each node a position based on all other visible nodes.
 * @param {Iterable<SystemNode>} nodes Iterable of all visible nodes
 * @param {NodeGroup} grouping Grouping of all visible nodes
 * @param {Map<Number, Coordinate>} currentNodePositions Mapping from Node-Ids to their current positions
 * @param {Coordinate} maxSize Sets the maximum values that are possible for the nodes
 */
export declare function randLayout(nodes: Iterable<SystemNode>, grouping: NodeGroup, currentNodePositions: Map<ID, Coordinate>, maxSize: Coordinate): Map<ID, Coordinate>;
/**
 * Gives a single node a position based on all other visible nodes.
 * @param {SystemNode} node Node to be positioned
 * @param {NodeGroup} grouping Grouping of all visible nodes
 * @param {Map<Number, Coordinate>} currentNodePositions Mapping from Node-Ids to their current positions
 * @param {Coordinate} maxSize Sets the maximum values that are possible for the nodes
 */
export declare function randSingleLayout(node: SystemNode, grouping: NodeGroup, currentNodePositions: Map<ID, Coordinate>, maxSize: Coordinate): Coordinate;
