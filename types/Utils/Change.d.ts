export = Change;
declare class Change {
    /**
     *
     * @param {'add'|'remove'|'update'} type
     * @param {any} el
     * @param {?String|Sring[]} keys
     */
    constructor(type: 'add' | 'remove' | 'update', el: any, keys?: (string | Sring[]) | null);
    type: "update" | "add" | "remove";
    el: any;
    keys: string | Sring[] | null;
    getData(): any;
}
