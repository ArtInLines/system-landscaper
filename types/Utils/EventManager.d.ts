export = EventManager;
declare class EventManager {
    events: {};
    on(event: any, callback: any): EventManager;
    once(event: any, callback: any): EventManager;
    off(event?: null, callback?: null): EventManager;
    emit(event: any, ...args: any[]): EventManager | undefined;
}
