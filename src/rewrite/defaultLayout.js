const Coordinate = require('../Utils/Coordinate.js');
const randint = require('../Utils/random').randint;

/**
 * Keeps each node at their current position or gives them a random position
 * @param {Iterable} nodes Iterable of all visible nodes
 * @param {Map<Number, Coordinate>} currentNodePositions Mapping from Node-Ids to their current positions
 * @param {Coordinate} maxSize Sets the maximum values i
 */
function defaultLayout(nodes, currentNodePositions, maxSize) {
	let nodePositions = new Map();

	for (const node of nodes) {
		const id = node?.id ?? node;
		let val = null;
		if (currentNodePositions.has(id)) val = currentNodePositions.get(id);
		else val = new Coordinate(randint(maxSize.x), randint(maxSize.y));
		nodePositions.set(id, val);
	}

	return nodePositions;
}

module.exports = defaultLayout;
