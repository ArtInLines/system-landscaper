export type positionTreeOpts = {
    /**
     * The distance between levels of the tree in relative y-coordinates.
     */
    levelSeperation: number;
    /**
     * The maximum depth of the tree, that should be positioned.
     */
    maxDepth: number;
    /**
     * The distance between sibling-nodes in relative x-coordinates.
     */
    siblingSeperation: number;
    /**
     * The distance between subtree-nodes in relative x-coordinates. This is usually slightly larger than siblingSeperation.
     */
    subtreeSeperation: number;
};
