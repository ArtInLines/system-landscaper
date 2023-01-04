export default function createDocumentEvents(): {
    on: typeof on;
    off: typeof off;
};
declare function on(type: any, listener: (this: Window, ev: any) => any): void;
declare function off(type: any, listener: (this: Window, ev: any) => any): void;
export {};
