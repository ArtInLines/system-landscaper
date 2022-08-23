const Coordinate = require('../Geom/Coordinate');
const Rectangle = require('../Geom/Rectangle');

class Layout {
	constructor() {
		// TODO: Implement Layouts as classes
		// with the base class positioning nodes randomly
		// and with extended Layouts being able to use
		// many of the base functions defined here
	}

	/**
	 * Check whether the node is positioned within the confines set by the rect.
	 * @param {Coordinate} coord Coordinate of the node's center
	 * @param {Number} nodeWidth Width of the Node
	 * @param {Number} nodeHeight Height of the Node
	 * @param {Rectangle} rect Sets the maximum values that are possible for the nodes
	 * @returns {boolean}
	 */
	isNodePosInMaxSize(coord, nodeWidth, nodeHeight, rect) {
		let w = nodeWidth / 2;
		let h = nodeHeight / 2;
		return coord.x + w <= rect.right && coord.y + h <= rect.bottom && coord.x - w >= rect.left && coord.y - h >= rect.top;
	}

	/**
	 * Check whether the node is overlapping with any other already positioned node
	 * @param {Coordinate} coord Coordinate of the node's center
	 * @param {Number} nodeWidth Width of the Node
	 * @param {Number} nodeHeight Height of the Node
	 * @param {Map<Number, Coordinate>} currentNodePositions Mapping from NodeIds to the node' current positions
	 * @returns {boolean}
	 */
	areNodesOverlapping(coord, nodeWidth, nodeHeight, currentNodePositions) {
		for (let nodeId of currentNodePositions.keys()) {
			let nodePos = currentNodePositions.get(nodeId);
			if (Math.abs(coord.x - nodePos.x) < nodeWidth && Math.abs(coord.y - nodePos.y) < nodeHeight) return true;
		}
		return false;
	}

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
	layout(nodes, grouping, currentNodePositions, rect, nodeWidth, nodeHeight) {
		if (!Array.isArray(nodes) && !(nodes instanceof Set)) nodes = [nodes];

		let nodePositions = new Map();
		currentNodePositions.forEach((nodePos, nodeId) => {
			if (this.isNodePosInMaxSize(nodePos, nodeWidth, nodeHeight, rect)) {
				nodePositions.set(nodeId, nodePos);
			}
		});

		let w = nodeWidth / 2;
		let h = nodeHeight / 2;
		for (const node of nodes) {
			const id = node?.id ?? node;
			if (nodePositions.has(id)) continue;

			let val = null;
			do {
				let x = Math.floor(Math.random() * rect.width) + rect.left + w;
				let y = Math.floor(Math.random() * rect.height) + rect.top + h;
				val = new Coordinate(x, y);
			} while (this.areNodesOverlapping(val, nodeWidth, nodeHeight, nodePositions));
			nodePositions.set(id, val);
		}

		return nodePositions;
	}
}

module.exports = Layout;
