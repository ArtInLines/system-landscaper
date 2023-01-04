type Predicate<T> = (value: T, index: number) => boolean;
type Producer<I, O = I> = (value: I, index: number) => O;
type Reducer<T, S = T> = (previousValue: S, currentValue: T, currentIndex: number, array: T[]) => S;

export default class ExtendedSet<T> extends Set<T> {
	constructor(args: T[] | null | undefined) {
		super(args);
	}

	push(...args: T[]) {
		args.forEach((arg) => this.add(arg));
		return this;
	}

	find(cb: Predicate<T>): T | null {
		const vals = Array.from(this.values());
		for (let i = 0; i < vals.length; i++) {
			let v = vals[i];
			if (cb(v, i)) return v;
		}
		return null;
	}

	filter(cb: Predicate<T>, asArray: boolean = true) {
		let arr: T[] = [];
		let i = 0;
		this.forEach((v) => {
			if (cb(v, i)) arr.push(v);
			i++;
		});
		if (asArray) return arr;
		return new ExtendedSet(arr);
	}

	map<O = T>(cb: Producer<T, O>, asArray: true): O[];
	map<O = T>(cb: Producer<T, O>, asArray: false): ExtendedSet<O>;
	map<O = T>(cb: Producer<T, O>, asArray: boolean = true): O[] | ExtendedSet<O> {
		let arr: O[] = [];
		let i = 0;
		this.forEach((v) => {
			arr.push(cb(v, i));
			i++;
		});
		if (asArray === true) return arr;
		return new ExtendedSet(arr);
	}

	reduce<S = T>(cb: Reducer<T, S>, initialValue: S, asArray: boolean = true): S {
		return Array.from(this.values()).reduce(cb, initialValue);
	}
}
