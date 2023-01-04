export type EventCallback = (...args: any[]) => void;
export type EventsMap = {
    [index: string]: EventCallback[];
};
export default class EventManager {
    events: EventsMap;
    constructor();
    on(event: string, callback?: null | EventCallback): this;
    once(event: string, callback: null | EventCallback): this | undefined;
    off(event?: string | null, callback?: null | EventCallback): this;
    protected emit(event: string, ...args: any[]): this | undefined;
}
