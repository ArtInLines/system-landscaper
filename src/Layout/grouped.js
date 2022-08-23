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

/**
 * @param {NodeGroup} group Group of nodes to layout
 */
function recGroupPositions(group) {
	let nodePositions = new Map();
	if (group.groups.length === 0) {
		let n = Math.ceil(Math.sqrt(group.nodes.length));
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n - 1; j++) {
				nodePositions.set(group.nodes[i * n + j], new Coordinate(i, j));
			}
		}
	}
}
