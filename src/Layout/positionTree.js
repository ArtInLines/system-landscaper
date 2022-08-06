/**
 * @typedef {Object} positionTreeOpts
 * @property {number} levelSeperation The distance between levels of the tree in relative y-coordinates.
 * @property {number} maxDepth The maximum depth of the tree, that should be positioned.
 * @property {number} siblingSeperation The distance between sibling-nodes in relative x-coordinates.
 * @property {number} subtreeSeperation The distance between subtree-nodes in relative x-coordinates. This is usually slightly larger than siblingSeperation.
 */

const Tree = require('../Utils/Tree');

/**
 * Get the position for all nodes in a Tree, such that the Tree is aesthetically arranged. This is an implementation of the Walker's algorithm: https://www.cs.unc.edu/techreports/89-034.pdf. It works on general trees, not just binary trees.
 * @param {Tree} root Root of the (Sub)Tree
 * @param {positionTreeOpts} opts Options for the positionTree function. These are treated as constants by the function and are not changed.
 */
function positionTree(root, opts = { levelSeperation, maxDepth, siblingSeperation, subtreeSeperation }) {
	// Initialize the list of previous nodes at each level.
	initPrevNodes();

	// Do the preliminary positioning with a postorder walk
	firstWalk(root, 0, opts);

	// Determine how to adjust all the nodes with respect to the location of the root
	let xTopAdjustment = xcoord(root, opts) - prelim(root, opts);
	let yTopAdjustment = ycoord(root, opts);

	// Do the final positioning with a preorder walk
	return secondWalk(root, 0, 0, xTopAdjustment, yTopAdjustment, opts);
}

function initPrevNodes(node, parent, level, opts) {
	let T = new Tree(null, { node: root, level: 0, prevNode: null });
	// TODO: Recursive implementation
	if (level === opts.maxDepth) return T;
}

/**
 *
 * @param {Tree} node
 * @param {Number} level
 * @param {positionTreeOpts} opts
 */
function firstWalk(node, level, opts) {
	if (node.isLeaf() || level >= opts.maxDepth) {
		if (node.hasLeftSibling()) {
		} else {
		}
	}
}
