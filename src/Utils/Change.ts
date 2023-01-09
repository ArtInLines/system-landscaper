export type ChangeKind = 'remove' | 'add' | 'update';
export type ChangeKeys = null | string | string[];

export default class Change<T> {
	type: ChangeKind;
	el: T;
	keys: ChangeKeys;

	constructor(type: ChangeKind, el: T, keys: ChangeKeys = null) {
		this.type = type;
		this.el = el;
		this.keys = keys;
	}

	getData(): T | any {
		let data: T | any = this.el;
		if (Array.isArray(this.keys)) {
			this.keys.forEach((key) => {
				data = data[key];
			});
		} else if (typeof this.keys === 'string') {
			data = data[this.keys];
		}
		return data;
	}
}
