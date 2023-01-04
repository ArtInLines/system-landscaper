export default class Trie<T> {
	chars: string[];
	tries: Trie<T>[];
	val: T | null;

	constructor() {
		this.chars = [];
		this.tries = [];
		this.val = null;
	}

	/**
	 * Check if this Node is empty - i.e. has no children and no value and is therefore ready to be removed.
	 * @returns {boolean}
	 */
	isEmpty(): boolean {
		return this.chars.length === 0 && this.val === null;
	}

	/**
	 * Check whether the Trie contains a Node with the name `str`
	 * @param {String} str Name of the node
	 * @returns {boolean}
	 */
	has(str: string): boolean {
		return this.find(str) !== null;
	}

	/**
	 * Find the value associated with the name `str`
	 * @param {String} str Name of the Node
	 * @returns {?T} If the Node doesn't exist, `null` is returned
	 */
	find(str: string): T | null {
		if (str === '') return this.val;

		let idx = this.chars.indexOf(str[0]);
		if (idx === -1) return null;
		else return this.tries[idx].find(str.substring(1));
	}

	/**
	 * Insert a new value associated with some name
	 * @param {String} str Name of the Node
	 * @param {any} val Value to associate with the name `str`
	 * @returns {Trie} Returns this Trie to allow chained calls
	 */
	insert(str: string, val: T): this {
		if (str === '') {
			this.val = val;
			return this;
		}

		let idx = this.chars.indexOf(str[0]);
		if (idx === -1) {
			this.chars.push(str[0]);
			this.tries.push(new Trie());
			idx = this.chars.length - 1;
		}
		this.tries[idx].insert(str.substring(1), val);
		return this;
	}

	/**
	 * Remove the Node associated with `str`
	 * @param {String} str Name of the Node
	 * @returns {boolean} Indicates whether the Node was successfully removed. Should only be `false` if the Node didn't exist.
	 */
	delete(str: string): boolean {
		if (str === '') {
			let res = this.val !== null;
			this.val = null;
			return res;
		}

		let idx = this.chars.indexOf(str[0]);
		if (idx === -1) return false;
		this.tries[idx].delete(str.substring(1));
		if (this.tries[idx].isEmpty()) {
			this.chars.splice(idx, 1);
			this.tries.splice(idx, 1);
		}
		return true;
	}

	// For String Completion

	/**
	 * Auxiliary function for replacePrefix()
	 * @param {String} str
	 * @param {String} prefix
	 * @returns {String[]}
	 */
	protected allKeys(str: string, prefix: string = ''): string[] {
		let res = [];
		if (this.val !== null) res.push(prefix);
		this.chars.forEach((c, i) => {
			res.push(...this.tries[i].allKeys(str, prefix + c));
		});
		return res;
	}

	/**
	 * Auxiliary function for findPrefix()
	 * @param {String} str
	 * @param {String} prefix
	 * @returns {String[]}
	 */
	protected replacePrefix(str: string, prefix: string = ''): string[] {
		if (str === '') return this.allKeys(prefix);

		let idx = this.chars.indexOf(str[0]);
		if (idx === -1) return [];
		else return this.tries[idx].replacePrefix(str.substring(1), prefix);
	}

	/**
	 * Find all keys in this Trie that start with `str`
	 * @param {String} str Prefix to search for
	 * @returns {String[]} Returns all valid names in the Trie that start with `str`
	 */
	findPrefix(str: string): string[] {
		return this.replacePrefix(str, str);
	}
}
