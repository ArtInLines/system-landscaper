class ExtendedSet extends Set {
	constructor(...args) {
		super(...args);
	}

	push(...args) {
		args.forEach((arg) => this.add(arg));
		return this;
	}

	find(cb) {
		let i = 0;
		let vals = this.values;
		for (let i = 0; i < vals.length; i++) {
			if (cb(v, i)) return v;
		}
		return null;
	}

	filter(cb, asArray = true) {
		let arr = [];
		let i = 0;
		this.forEach((v) => {
			if (cb(v, i)) arr.push(v);
			i++;
		});
		if (asArray) return arr;
		return new ExtendedSet(arr);
	}

	map(cb, asArray = true) {
		let arr = [];
		let i = 0;
		this.forEach((v) => {
			arr.push(cb(v, i));
			i++;
		});
		if (asArray) return arr;
		return new ExtendedSet(arr);
	}

	reduce(cb, initialValue, asArray = true) {
		let arr = Array.from(this.values).reduce(cb, initialValue);
		if (asArray) return arr;
		return new ExtendedSet(arr);
	}
}

module.exports = ExtendedSet;
