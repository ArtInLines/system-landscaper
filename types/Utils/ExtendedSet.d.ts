type Predicate<T> = (value: T, index: number) => boolean;
type Producer<I, O = I> = (value: I, index: number) => O;
type Reducer<T, S = T> = (previousValue: S, currentValue: T, currentIndex: number, array: T[]) => S;
export default class ExtendedSet<T> extends Set<T> {
    constructor(args: T[] | null | undefined);
    push(...args: T[]): this;
    find(cb: Predicate<T>): T | null;
    filter(cb: Predicate<T>, asArray?: boolean): ExtendedSet<T> | T[];
    map<O = T>(cb: Producer<T, O>, asArray: true): O[];
    map<O = T>(cb: Producer<T, O>, asArray: false): ExtendedSet<O>;
    reduce<S = T>(cb: Reducer<T, S>, initialValue: S, asArray?: boolean): S;
}
export {};
