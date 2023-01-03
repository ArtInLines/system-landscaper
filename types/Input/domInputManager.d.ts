declare function _exports(graph: any, graphics: any): DomInputManager;
export = _exports;
declare class DomInputManager {
    constructor(graph: any, graphics: any);
    nodeEvents: {};
    graph: any;
    graphics: any;
    /**
     * Called by renderer to listen to drag-n-drop events from node. E.g. for SVG
     * graphics we may listen to DOM events, whereas for WebGL the graphics
     * should provide custom eventing mechanism.
     *
     * @param node - to be monitored.
     * @param handlers - object with set of three callbacks:
     *   onStart: function(),
     *   onDrag: function(e, offset),
     *   onStop: function()
     */
    bindDragNDrop(node: any, handlers: any): void;
}
