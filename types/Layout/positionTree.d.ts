/**
 * @typedef {Object} PositionTreeOpts
 * @property {number} levelSeperation The distance between levels of the tree in relative y-coordinates.
 * @property {number} maxDepth The maximum depth of the tree, that should be positioned.
 * @property {number} siblingSeperation The distance between sibling-nodes in relative x-coordinates.
 * @property {number} subtreeSeperation The distance between subtree-nodes in relative x-coordinates. This is usually slightly larger than siblingSeperation.
 */
export type PositionTreeOpts = {
    levelSeperation: number;
    maxDepth: number;
    siblingSeperation: number;
    subtreeSeperation: number;
};
