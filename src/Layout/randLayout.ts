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
export function randLayout(nodes: Iterable<SystemNode>, grouping: NodeGroup, currentNodePositions: Map<ID, Coordinate>, maxSize: Coordinate): Map<ID, Coordinate> {
	let nodePositions = new Map();

	for (const node of nodes) {
		const id = node?.id ?? node;
		let val = null;
		if (currentNodePositions.has(id)) val = currentNodePositions.get(id);
		else val = Coordinate.rand(maxSize.x, maxSize.y, currentNodePositions);
		nodePositions.set(id, val);
	}

	return nodePositions;
}

/**
 * Gives a single node a position based on all other visible nodes.
 * @param {SystemNode} node Node to be positioned
 * @param {NodeGroup} grouping Grouping of all visible nodes
 * @param {Map<Number, Coordinate>} currentNodePositions Mapping from Node-Ids to their current positions
 * @param {Coordinate} maxSize Sets the maximum values that are possible for the nodes
 */
export function randSingleLayout(node: SystemNode, grouping: NodeGroup, currentNodePositions: Map<ID, Coordinate>, maxSize: Coordinate): Coordinate {
	return Coordinate.rand(maxSize.x, maxSize.y, currentNodePositions);
}
