export type ChangeKind = 'remove' | 'add' | 'update';
export type ChangeKeys = null | string | string[];
export default class Change<T> {
    type: ChangeKind;
    el: T;
    keys: ChangeKeys;
    constructor(type: ChangeKind, el: T, keys?: ChangeKeys);
    getData(): T | any;
}
