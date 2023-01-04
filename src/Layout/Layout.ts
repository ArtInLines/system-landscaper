import Coordinate from '../Geom/Coordinate';
import Rectangle from '../Geom/Rectangle';
import NodeGroup from '../Graphs/NodeGroup';
import SystemNode from '../Graphs/SystemNode';
import { ID } from '../Utils/id';

export default class Layout {
	nodeWidth: number;
	nodeHeight: number;

	constructor(nodeWidth: number, nodeHeight: number) {
		// TODO: Implement Layouts as classes
		// with the base class positioning nodes randomly
		// and with extended Layouts being able to use
		// many of the base functions defined here
		this.nodeWidth = nodeWidth;
		this.nodeHeight = nodeHeight;
	}

	/**
	 * Check whether the node is positioned within the confines set by the rect.
	 * @param {Coordinate} coord Coordinate of the node's center
	 * @param {Number} nodeWidth Width of the Node
	 * @param {Number} nodeHeight Height of the Node
	 * @param {Rectangle} rect Sets the maximum values that are possible for the nodes
	 * @returns {boolean}
	 */
	isNodePosInMaxSize(coord: Coordinate, nodeWidth: number, nodeHeight: number, rect: Rectangle): boolean {
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
	areNodesOverlapping(coord: Coordinate, nodeWidth: number, nodeHeight: number, currentNodePositions: Map<ID, Coordinate>): boolean {
		for (let nodeId of currentNodePositions.keys()) {
			let nodePos = currentNodePositions.get(nodeId);
			if (!!nodePos && Math.abs(coord.x - nodePos.x) < nodeWidth && Math.abs(coord.y - nodePos.y) < nodeHeight) return true;
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
	layout(nodes: SystemNode | Iterable<SystemNode>, grouping: NodeGroup, currentNodePositions: Map<ID, Coordinate>, rect: Rectangle, nodeWidth: number, nodeHeight: number): Map<ID, Coordinate> {
		if (nodes instanceof SystemNode) nodes = [nodes];

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
				// this.isNodePosInMaxSize() doesn't have to be checked
				// bcause the x,y coordinates are calculated in a way,
				// that they can't be outside the maxRect
				let x = Math.floor(Math.random() * (rect.width - nodeWidth)) + rect.left + w;
				let y = Math.floor(Math.random() * (rect.height - nodeHeight)) + rect.top + h;
				val = new Coordinate(x, y);
			} while (this.areNodesOverlapping(val, nodeWidth, nodeHeight, nodePositions));
			nodePositions.set(id, val);
		}

		return nodePositions;
	}
}
