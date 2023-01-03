export = Tree;
declare class Tree extends EventManager {
    /**
     * Create a new Tree object. All nodes in the Tree are instances of this Tree class.
     * @param {?Tree} parent The parent of this tree-node
     * @param {any} data Data associated with this node
     */
    constructor(parent?: Tree | null, data?: any);
    /** @type {Number} */
    id: number;
    /** @type {any} */
    data: any;
    /** @type {?Tree} */
    parent: Tree | null;
    /** @type {Tree[]} */
    children: Tree[];
    /**
     * Returns how many levels deep this node is in the tree.
     * @returns {Number}
     */
    get depth(): number;
    /**	Synonym for this.depth */
    get layer(): number;
    /**
     * Returns how many levels the tree goes deeper from here
     * @returns {Number}
     */
    get height(): number;
    /**
     * Get the root-node of this tree.
     * @returns {Tree}
     */
    get root(): Tree;
    /**
     * Check if this Tree-Node is empty - i.e. has no children and no data associated with it.
     * @returns {Boolean}
     */
    isEmpty(): boolean;
    /**
     * Check if this Tree-Node is a leaf - i.e. has no children.
     * @returns {Boolean}
     */
    isLeaf(): boolean;
    /**
     * Check if this Tree-Node is the root of its tree - i.e. it has no parent.
     * @returns {Boolean}
     */
    isRoot(): boolean;
    /**
     * Check if the node has any siblings - i.e. it's not the only child of its parent.
     * @returns {Boolean}
     */
    hasSiblings(): boolean;
    /**
     * Check if the node has any siblings to its left
     * @returns {Boolean}
     */
    hasLeftSibling(): boolean;
    /**
     * Check if the node has any siblings to its right
     * @returns {Boolean}
     */
    hasRightSibling(): boolean;
    /**
     * Get all nodes in the tree, that are in startLayer, endLayer or any layer in between. The layers are counted from this node onward. That is done to implement this method recursively, as users will mainly call it from the root only anyways.
     
     If startLayer is 0, this node is included in the result as well.
     
     Defaults to get all nodes in the tree, starting from layer 0 and going to layer Infinity (that is until the tree ended).
     * @param {Number} startLayer The first layer to get nodes from
     * @param {Number} endLayer The last layer to get nodes from
     * @returns {Tree[]} List of Nodes in the specified range of layers.
     */
    getChildren(startLayer?: number, endLayer?: number): Tree[];
    /**
     * Get the Node with the specified id. If it doesn't exist in this Tree, `null` is returned instead.
     * @param {Number} id The ID of the node to get
     * @returns {?Tree}
     */
    getByID(id: number): Tree | null;
    /**
     * Add a child-node to this node.
     * @param {Tree} child The child to add to this tree
     * @returns {Tree} The child that was added
     */
    addChild(child: Tree): Tree;
    /**
     * Move a child-node to a new index in the children-array. This is specifically useful when children-order matters, like with certain tree-drawing algorithms.
     * @param {Tree | Number} child The child to move or its ID.
     * @param {Number} idx The new index that the child should be moved to.
     * @returns
     */
    moveChildToIdx(child: Tree | number, idx: number): boolean;
    /**
     * Change this node's parent.
     * @param {?Tree} newParent The new parent of this node. If set to null, this system will have no parent.
     */
    changeParent(newParent?: Tree | null): void;
    /**
     * Remove a child of this tree. To remove this node itself, set all references to it to `null` and let the garbage collector handle it. All children of the node will be removed as well, unless you save another reference to them before.
     * @param {Number} id The ID of the node to remove
     * @returns {?Tree} Returns the removed child or `null` if the child couldn't be found.
     */
    removeChild(id: number): Tree | null;
    removeAllChildren(): Tree;
    remove(): Tree;
}
import EventManager = require("./EventManager");
