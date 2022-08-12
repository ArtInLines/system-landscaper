const SystemNode = require('../Graphs/SystemNode.js');
const NodeGroup = require('../Graphs/NodeGroup.js');
const Coordinate = require('../Geom/Coordinate.js');

/**
 * Gives each node a position based on all other visible nodes.
 * @param {Iterable<SystemNode>} nodes Iterable of all visible nodes
 * @param {NodeGroup} grouping Grouping of all visible nodes
 * @param {Map<Number, Coordinate>} currentNodePositions Mapping from Node-Ids to their current positions
 * @param {Coordinate} maxSize Sets the maximum values that are possible for the nodes
 */
function groupedLayout(nodes, grouping, currentNodePositions, maxSize) {
	let nodePositions = new Map();
}
