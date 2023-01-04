import EventManager from './Utils/EventManager';
import Coordinate from './Geom/Coordinate';
/**
 * @typedef {object} timerRes
 * @property {function} stop
 * @property {function} restart
 */
/**
 * @typedef {function} timer
 * @param {?function} callback
 * @returns {timerRes}
 */
import SystemLandscape, { EdgeIdentifier, NodeIdentifier } from './Graphs/SystemLandscape';
import SystemNode from './Graphs/SystemNode';
import Edge from './Graphs/Edge';
import View from './Views/View';
import Rectangle from './Geom/Rectangle';
import Layout from './Layout/Layout';
import { ID } from './Utils/id';
/**
 * @typedef {Object} RendererSettings
 * @property {number} frameInterval number of milliseconds to wait between rendering each frame. Defaults to 30. Currently does nothing, because the main loop was exchanged for event-based rendering.
 * @property {HTMLElement} container Container elemnent, in which the svg-container is added.
 * @property {?Coordinate} maxSize Maximum rectangle size. Defaults to the whole size of `container`.
 * @property {View} view View to use for rendering.
 * @property {Layout} Layout Function to use for finding the position of a single new node.
 */
export type RendererSettings = {
    frameInterval: number;
    container: HTMLElement;
    maxSize: null | Coordinate;
    view: View;
    layout: Layout;
};
export type CoordLike = {
    x: number;
    y: number;
};
export type NodeUIContainer = HTMLElement & SVGGraphicsElement & {
    selected: boolean;
    drawnLine: null | EdgeUIContainer;
    node: SystemNode;
    drag: any;
    select: () => void;
    deselect: () => void;
};
export type EdgeUIContainer = SVGGraphicsElement & {
    edge?: Edge;
    nodeId?: ID;
    to?: Coordinate;
    selected: boolean;
    select: () => void;
    deselect: () => void;
    setPath: (x1: number, y1: number, x2: number, y2: number) => void;
    firstElementChild: SVGElement;
};
export default class Renderer extends EventManager {
    nodeHeight: number;
    nodeWidth: number;
    arrowSize: number;
    drawnNodes: Map<ID, NodeUIContainer>;
    drawnEdges: Map<ID, EdgeUIContainer>;
    userInteraction: boolean;
    Layout: Layout;
    selectedNodes: SystemNode[];
    selectedEdges: Edge[];
    just_selected: boolean;
    graph: SystemLandscape;
    view: View;
    nodePositions: Map<ID, Coordinate>;
    container: HTMLElement;
    svgRoot: SVGSVGElement;
    svgContainer: SVGGraphicsElement;
    dragContainer: any;
    zoomFactor: number;
    offset: Coordinate;
    maxSize: Coordinate;
    maxRect: Rectangle;
    frameInterval: number;
    isInitialized: boolean;
    /**
     * @param {SystemLandscape} graph Graph to render
     * @param {RendererSettings} settings Optional Settings that can be adjusted
     */
    constructor(graph: SystemLandscape, settings?: RendererSettings | object);
    _init(): void;
    _resetVisible(): void;
    /**
     * Get a Coordinate for the maxSize. If the input is set to null (default), then the maxSize will be calculated from the container-element's size. Otherwise, if the input is a Coordinate, object or Array, the coordinates will stay the same. This function always returns an instance of a Coordinate
     * @returns {Coordinate}
     */
    _setMaxSizeHelper(obj?: undefined | null | Coordinate | [number, number] | CoordLike): Coordinate;
    _onKeyDown(e: KeyboardEvent): void;
    /**
     * Get a list of all systemNodes, that are visible in the current view
     * @returns {Array<SystemNode>}
     */
    getVisibleNodes(): SystemNode[];
    run(): void;
    /**
     * Change the View to another
     * @param {View} View New View
     */
    changeView(View: View): void;
    _setViewListeners(): void;
    _rmViewListeners(): void;
    runLayout(Layout: Layout): void;
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
    _translateRel(offset: CoordLike): void;
    _scale(out: boolean, scrollPoint?: null | undefined | CoordLike): void;
    /**
     * Select a Node
     * @param {...SystemNode|String|Number} nodes Node to select. Can be the node itself, its id or its name.
     */
    selectNodes(...nodes: SystemNode[] | NodeIdentifier[]): void;
    deselectNodes(): void;
    selectEdges(...edges: Edge[] | EdgeIdentifier[]): void;
    deselectEdges(): void;
    moveNode(nodeId: ID, offset: CoordLike): void;
    moveCamera(x: number, y: number): void;
    centerCamera(id: ID): void;
    _buildLine(nodeId: ID, point: Coordinate): EdgeUIContainer;
    _moveLineBy(line: EdgeUIContainer & {
        to: CoordLike;
    }, offset: CoordLike): EdgeUIContainer;
    _moveLineTo(line: EdgeUIContainer, point: Coordinate): EdgeUIContainer;
    _buildNodeUI(node: SystemNode): NodeUIContainer;
    _addNode(node: SystemNode): void;
    _rmNode(node: SystemNode): void;
    _updateNode(node: SystemNode): void;
    _renderNodes(): void;
    _buildEdgeUI(): EdgeUIContainer;
    _addEdge(edge: Edge): void;
    _renderEdges(): void;
    _render(): boolean;
    _onResize(): void;
}
