export = Renderer;
declare class Renderer extends EventManager {
    /**
     * @param {SystemLandscape} graph Graph to render
     * @param {rendererSettings} settings Optional Settings that can be adjusted
     */
    constructor(graph: SystemLandscape, settings?: rendererSettings);
    nodeHeight: number;
    nodeWidth: number;
    arrowSize: number;
    drawnNodes: Map<any, any>;
    drawnEdges: Map<any, any>;
    userInteraction: boolean;
    Layout: Layout;
    selectedNodes: any[];
    selectedEdges: any[];
    just_selected: boolean;
    /** @type {SystemLandscape} System-Landscape-Graph to render */
    graph: SystemLandscape;
    /** @type {View} Current View */
    view: View;
    /** @type {Map<Number, Coordinate>} Maps NodeIds to their nodes' coordinates */
    nodePositions: Map<number, Coordinate>;
    /** @type {HTMLElement} */
    container: HTMLElement;
    /** @type {SVGSVGElement} The top svg-root element */
    svgRoot: SVGSVGElement;
    /** @type {SVGGraphicsElement} The top container element, direct child of svgRoot */
    svgContainer: SVGGraphicsElement;
    /** TODO: Refactor dragndrop */
    dragContainer: {
        onStart: (callback: any) => any;
        onDrag: (callback: any) => any;
        onStop: (callback: any) => any;
        onScroll: (callback: any) => any;
        release: () => void;
    };
    /** @type {number} Factor indicating how far we are zoomed in/out of the system-map */
    zoomFactor: number;
    /** @type {Coordinate} camera offset */
    offset: Coordinate;
    /** @type {Coordinate} Maximum Size for the svg-container to take up */
    maxSize: Coordinate;
    /** @type {Rectangle} Rectangle defining the confines of the svg-container */
    maxRect: Rectangle;
    /** @type {number} How many ms to wait between rendering frames */
    frameInterval: number;
    /** @type {boolean} Indicates whether the Render has been started to run */
    isInitialized: boolean;
    _init(): void;
    _resetVisible(): void;
    /**
     * Get a Coordinate for the maxSize. If the input is set to null (default), then the maxSize will be calculated from the container-element's size. Otherwise, if the input is a Coordinate, object or Array, the coordinates will stay the same. This function always returns an instance of a Coordinate
     * @returns {Coordinate}
     */
    _setMaxSizeHelper(obj?: null): Coordinate;
    _onKeyDown(e: any): void;
    /**
     * Get a list of all systemNodes, that are visible in the current view
     * @returns {Array<SystemNode>}
     */
    getVisibleNodes(): Array<SystemNode>;
    run(): void;
    /**
     * Change the View to another
     * @param {View} View New View
     */
    changeView(View: View): void;
    _setViewListeners(): void;
    _rmViewListeners(): void;
    runLayout(Layout: any): void;
    zoomIn(): void;
    zoomOut(): void;
    /**
     * Apply a transformation matrix to this renderer's svg-container. This is used to zoom in/out and move around in the system-map.
     * @param {number} a Defaults to `this.zoomFactor`
     * @param {number} b Defaults to 0
     * @param {number} c Defaults to 0
     * @param {number} d Defaults to `this.zoomFactor`
     * @param {number} e Defaults to `this.offset.x`
     * @param {number} f Defaults to `this.offset.y`
     */
    _transform(a?: number, b?: number, c?: number, d?: number, e?: number, f?: number): void;
    _translateRel(offset: any): void;
    _scale(out: any, scrollPoint?: null): void;
    /**
     * Select a Node
     * @param {...SystemNode|String|Number} node Node to select. Can be the node itself, its id or its name.
     */
    selectNodes(...nodes: any[]): void;
    deselectNodes(): void;
    selectEdges(...edges: any[]): void;
    deselectEdges(): void;
    moveNode(nodeId: any, offset: any): void;
    moveCamera(x: any, y: any): void;
    centerCamera(id: any): void;
    _buildLine(nodeId: any, point: any): any;
    _moveLineBy(line: any, offset: any): any;
    _moveLineTo(line: any, point: any): any;
    _buildNodeUI(node: any): SVGElement;
    _addNode(node: any): void;
    _rmNode(node: any): void;
    _updateNode(node: any): void;
    _renderNodes(): void;
    _buildEdgeUI(): SVGElement;
    _addEdge(edge: any): void;
    _renderEdges(): void;
    _render(): boolean;
    _onResize(): void;
}
declare namespace Renderer {
    export { timerRes, timer, rendererSettings };
}
import EventManager = require("./Utils/EventManager");
import Layout = require("./Layout/Layout");
import SystemLandscape = require("./Graphs/SystemLandscape");
import View = require("./Views/View");
import Rectangle = require("./Geom/Rectangle");
import SystemNode = require("./Graphs/SystemNode");
type rendererSettings = {
    /**
     * number of milliseconds to wait between rendering each frame. Defaults to 30.
     */
    frameInterval: number;
    /**
     * Container elemnent, in which the svg-container is added.
     */
    container: HTMLElement;
    /**
     * Maximum rectangle size. Defaults to the whole size of `container`.
     */
    maxSize: Coordinate | null;
    /**
     * View to use for rendering.
     */
    view: View;
    /**
     * Function to use for finding the position of a single new node.
     */
    Layout: Layout;
};
type timerRes = {
    stop: Function;
    restart: Function;
};
type timer = Function;
