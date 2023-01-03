export = ExtendedSet;
declare class ExtendedSet extends Set<any> {
    constructor(...args: any[]);
    push(...args: any[]): ExtendedSet;
    find(cb: any): any;
    filter(cb: any, asArray?: boolean): any[] | ExtendedSet;
    map(cb: any, asArray?: boolean): any[] | ExtendedSet;
    reduce(cb: any, initialValue: any, asArray?: boolean): any;
}
