class Change {
	/**
	 *
	 * @param {'add'|'remove'|'update'} type
	 * @param {any} el
	 * @param {?String|Sring[]} keys
	 */
	constructor(type, el, keys = null) {
		this.type = type;
		this.el = el;
		this.keys = keys;
	}

	getData() {
		let data = el;
		if (Array.isArray(keys)) {
			keys.forEach((key) => {
				data = data[key];
			});
		} else if (typeof keys === 'string') {
			data = data[keys];
		}
		return data;
	}
}

module.exports = Change;
