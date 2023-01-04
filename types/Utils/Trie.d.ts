export default class Trie<T> {
    chars: string[];
    tries: Trie<T>[];
    val: T | null;
    constructor();
    /**
     * Check if this Node is empty - i.e. has no children and no value and is therefore ready to be removed.
     * @returns {boolean}
     */
    isEmpty(): boolean;
    /**
     * Check whether the Trie contains a Node with the name `str`
     * @param {String} str Name of the node
     * @returns {boolean}
     */
    has(str: string): boolean;
    /**
     * Find the value associated with the name `str`
     * @param {String} str Name of the Node
     * @returns {?T} If the Node doesn't exist, `null` is returned
     */
    find(str: string): T | null;
    /**
     * Insert a new value associated with some name
     * @param {String} str Name of the Node
     * @param {any} val Value to associate with the name `str`
     * @returns {Trie} Returns this Trie to allow chained calls
     */
    insert(str: string, val: T): this;
    /**
     * Remove the Node associated with `str`
     * @param {String} str Name of the Node
     * @returns {boolean} Indicates whether the Node was successfully removed. Should only be `false` if the Node didn't exist.
     */
    delete(str: string): boolean;
    /**
     * Auxiliary function for replacePrefix()
     * @param {String} str
     * @param {String} prefix
     * @returns {String[]}
     */
    protected allKeys(str: string, prefix?: string): string[];
    /**
     * Auxiliary function for findPrefix()
     * @param {String} str
     * @param {String} prefix
     * @returns {String[]}
     */
    protected replacePrefix(str: string, prefix?: string): string[];
    /**
     * Find all keys in this Trie that start with `str`
     * @param {String} str Prefix to search for
     * @returns {String[]} Returns all valid names in the Trie that start with `str`
     */
    findPrefix(str: string): string[];
}
