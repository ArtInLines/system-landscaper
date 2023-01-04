declare const _default: {
    on: typeof on;
    off: typeof off;
};
export default _default;
export declare function createDocumentEvents(): {
    on: typeof on;
    off: typeof off;
};
export declare function on(eventName: string, handler: any): void;
export declare function off(eventName: string, handler: any): void;
