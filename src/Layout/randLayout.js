const Coordinate = require('../Geom/Coordinate.js');
const SystemNode = require('../Graphs/SystemNode.js');
const NodeGroup = require('../Graphs/NodeGroup.js');

/**
 * Gives each node a position based on all other visible nodes.
 * @param {Iterable<SystemNode>} nodes Iterable of all visible nodes
 * @param {NodeGroup} grouping Grouping of all visible nodes
 * @param {Map<Number, Coordinate>} currentNodePositions Mapping from Node-Ids to their current positions
 * @param {Coordinate} maxSize Sets the maximum values that are possible for the nodes
 */
function randLayout(nodes, grouping, currentNodePositions, maxSize) {
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
function randSingleLayout(node, grouping, currentNodePositions, maxSize) {
	return Coordinate.rand(maxSize.x, maxSize.y, currentNodePositions);
}

module.exports = { randLayout, randSingleLayout };
