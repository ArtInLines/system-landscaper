class Trie {
	constructor() {
		/** @type {String[]} */
		this.chars = [];
		/** @type {Trie[]} */
		this.tries = [];
		/** @type {any} */
		this.val = null;
	}

	/**
	 * Check if this Node is empty - i.e. has no children and no value and is therefore ready to be removed.
	 * @returns {boolean}
	 */
	isEmpty() {
		return this.chars.length === 0 && this.val === null;
	}

	/**
	 * Find the value associated with the name `str`
	 * @param {String} str Name of the Node
	 * @returns {?any} If the Node doesn't exist, `null` is returned
	 */
	find(str) {
		if (str === '') return this.val;

		let idx = this.chars.indexOf(str[0]);
		if (idx === -1) return null;
		else return this.tries[idx].find(str.substr(1));
	}

	/**
	 * Insert a new value associated with some name
	 * @param {String} str Name of the Node
	 * @param {any} val Value to associate with the name `str`
	 * @returns {Trie} Returns this Trie to allow chained calls
	 */
	insert(str, val) {
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
	delete(str) {
		if (str === '') {
			this.val = null;
			return;
		}

		let idx = this.chars.indexOf(str[0]);
		if (idx === -1) return;
		this.tries[idx].delete(str.substr(1));
		if (this.tries[idx].isEmpty()) {
			this.chars.splice(idx, 1);
			this.tries.splice(idx, 1);
		}
	}

	// For String Completion

	/**
	 * Auxiliary function for #replacePrefix()
	 * @param {String} str
	 * @param {String} prefix
	 * @returns {String[]}
	 */
	#allKeys(str, prefix = '') {
		let res = [];
		if (this.val !== null) res.push(prefix);
		this.chars.forEach((c, i) => {
			res.push(...this.tries[i].#allKeys(str, prefix + c));
		});
		return res;
	}

	/**
	 * Auxiliary function for findPrefix()
	 * @param {String} str
	 * @param {String} prefix
	 * @returns {String[]}
	 */
	#replacePrefix(str, prefix = '') {
		if (str === '') return this.#allKeys(prefix);

		let idx = this.chars.indexOf(str[0]);
		if (idx === -1) return [];
		else return this.tries[idx].#replacePrefix(str.substring(1), prefix);
	}

	/**
	 * Find all keys in this Trie that start with `str`
	 * @param {String} str Prefix to search for
	 * @returns {String[]} Returns all valid names in the Trie that start with `str`
	 */
	findPrefix(str) {
		return this.#replacePrefix(str, str);
	}
}

module.exports = Trie;
