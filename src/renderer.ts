import EventManager from './Utils/EventManager';
import Coordinate from './Geom/Coordinate';
import svg from './Utils/svgHelper';
import { randLayout, randSingleLayout } from './Layout/randLayout';
import SingleLayerView from './Views/SingleLayerView';
import dragndrop from './Input/dragndrop';

import timer from './Utils/timer';
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

// For JSDocs:
import SystemLandscape, { EdgeIdentifier, NodeIdentifier } from './Graphs/SystemLandscape';
import SystemTree from './Graphs/SystemTree';
import SystemNode from './Graphs/SystemNode';
import Edge from './Graphs/Edge';
import View from './Views/View';
import Rectangle from './Geom/Rectangle';
import Layout from './Layout/Layout';
import { ID } from './Utils/id';

// Wanted API:
// - run(layout?)
//		Initialize Renderer & start rendering loop
//		layout determines the initial layout-function to be called to give the nodes their initial position
// - pause()
// - resume()
// - changeView(view)
//		Changes the View to a specified `view`
//		The view specifies which nodes are visible
//		The view also specifies how vertical links between nodes should be visualized
//		The View determines how nodes / edges are drawn
//		Further customizations might be added by the view (later)
// - runLayout(layout)
//		Calls a layout function
//		The function should return a mapping from nodeIds to new (x,y)-coordinates for them
// - zoomIn()
// - zoomOut()
// - selectNodes(nodeId)
// - moveNode(nodeId, x, y)
// - moveEdge() / shapeEdge() / something like that to create curves
// - moveCamera(x, y)
// - centerCamera(id)
//		centers camera on specified node / systemTree / graph
//		if undefined, centers on graph
// - drawNode(node, x, y)

// UI-Handling:
// - on node clicked
// - on edge clicked
//		If trees are drawn with groupings around the nodes, listen to those spaces being clicked too
// - on node drag-and-dropped
// For later
// 		Edge moved or drawn differently

// Events to allow listeners for:
// - nodeSelected
// - edgeSelected
// - nodeMoved

// Events the Renderer listens to (emitted by system-landscape):
// - newNode
// - newEdge
// - updated / removed node or edge

/**
 * @typedef {Object} RendererSettings
 * @property {number} frameInterval number of milliseconds to wait between rendering each frame. Defaults to 30. Currently does nothing, because the main loop was exchanged for event-based rendering.
 * @property {HTMLElement} container Container elemnent, in which the svg-container is added.
 * @property {?Coordinate} maxSize Maximum rectangle size. Defaults to the whole size of `container`.
 * @property {View} view View to use for rendering.
 * @property {Layout} Layout Function to use for finding the position of a single new node.
 */

export type RendererSettings = {
	frameInterval: number; // TODO: frameInterval does nothing atm, should be removed
	container: HTMLElement;
	maxSize: null | Coordinate;
	view: View;
	layout: Layout;
};

export type CoordLike = { x: number; y: number };

export type NodeUIContainer = HTMLElement &
	SVGGraphicsElement & {
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

/** @type {RendererSettings} */
const defaultSettings: RendererSettings = {
	frameInterval: 30,
	container: document.body,
	maxSize: null,
	view: new SingleLayerView(0),
	layout: new Layout(10, 10),
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
	constructor(graph: SystemLandscape, settings: RendererSettings | object = {}) {
		super();
		let fullSettings: RendererSettings = { ...defaultSettings, ...settings };

		// TODO:
		// this.nodeLength = 30; // How big should the nodes be drawn???
		this.nodeHeight = 30;
		this.nodeWidth = 80;
		this.arrowSize = 20;
		this.drawnNodes = new Map(); // Map<ID, SVG-Element>
		this.drawnEdges = new Map(); // Map<ID, SVG-Element>
		this.userInteraction = false;
		this.Layout = fullSettings.layout;
		this.selectedNodes = [];
		this.selectedEdges = [];
		this.just_selected = false;

		/** @type {SystemLandscape} System-Landscape-Graph to render */
		this.graph = graph;
		/** @type {View} Current View */
		this.view = fullSettings.view.init(this.graph); // TODO: Set view
		/** @type {Map<Number, Coordinate>} Maps NodeIds to their nodes' coordinates */
		this.nodePositions = new Map();

		/** @type {HTMLElement} */
		this.container = fullSettings.container;
		/** @type {SVGSVGElement} The top svg-root element */
		this.svgRoot = svg.createEl('svg');
		/** @type {SVGGraphicsElement} The top container element, direct child of svgRoot */
		this.svgContainer = svg.createEl('g');
		/** TODO: Refactor dragndrop */
		this.dragContainer = dragndrop(this.container);

		/** @type {number} Factor indicating how far we are zoomed in/out of the system-map */
		this.zoomFactor = 1;
		/** @type {Coordinate} camera offset */
		this.offset = new Coordinate(0, 0);

		/** @type {Coordinate} Maximum Size for the svg-container to take up */
		this.maxSize = this._setMaxSizeHelper(fullSettings.maxSize);
		/** @type {Rectangle} Rectangle defining the confines of the svg-container */
		this.maxRect = new Rectangle(0, 0, this.maxSize.x, this.maxSize.y);
		/** @type {number} How many ms to wait between rendering frames */
		this.frameInterval = fullSettings.frameInterval;

		/** @type {boolean} Indicates whether the Render has been started to run */
		this.isInitialized = false;
	}

	_init() {
		// Add HTML-Elements to DOM
		svg.setAttr(this.svgContainer, 'buffered-rendering', 'dynamic');
		this.svgRoot.appendChild(this.svgContainer);
		this.container.appendChild(this.svgRoot);

		// Initialize SVG-Stuff
		this._transform();
		let defs = svg.append(this.svgRoot, 'defs'); // Create <defs> element for definitions
		svg.append(defs, svg.createArrowMarker(this.arrowSize, 'Arrow'));

		// Initialize Event-Listeners
		window.addEventListener('resize', this._onResize.bind(this));
		window.addEventListener('keydown', this._onKeyDown.bind(this));
		this._setViewListeners();
		// TODO: Let the following event-listeners be changeable by the user
		this.dragContainer.onDrag((e: Event, offset: CoordLike) => {
			this._translateRel(offset);
			this._render();
		});
		this.dragContainer.onScroll((e: Event, scaleOffset: number, scrollPoint: null | CoordLike | undefined) => {
			this._scale(scaleOffset < 0, scrollPoint);
		});
		this.container.addEventListener('click', () => {
			if (!this.just_selected) {
				this.deselectEdges();
				this.deselectNodes();
			}
			this.just_selected = false;
		});

		// TODO: Listen to changes in the graph and update accordingly

		this._resetVisible();
	}

	_resetVisible() {
		this.svgContainer.innerHTML = '';
		this.drawnNodes.clear();
		this.drawnEdges.clear();
		this.nodePositions.clear();

		let nodes = this.getVisibleNodes();
		nodes.forEach((node) => {
			this._addNode(node);
		});
		let edges = this.view.getVisibleEdges();
		edges.forEach((edge) => {
			if (this.drawnNodes.has(edge.source.id) && this.drawnNodes.has(edge.target.id)) {
				this._addEdge(edge);
			}
			// TODO
		});
	}

	/**
	 * Get a Coordinate for the maxSize. If the input is set to null (default), then the maxSize will be calculated from the container-element's size. Otherwise, if the input is a Coordinate, object or Array, the coordinates will stay the same. This function always returns an instance of a Coordinate
	 * @returns {Coordinate}
	 */
	_setMaxSizeHelper(obj: undefined | null | Coordinate | [number, number] | CoordLike = null): Coordinate {
		if (!obj) return new Coordinate(this.container.clientWidth, this.container.clientHeight);
		else if (obj instanceof Coordinate) return obj;
		else if (Array.isArray(obj)) return new Coordinate(...obj);
		else return new Coordinate(obj.x, obj.y);
	}

	_onKeyDown(e: KeyboardEvent) {
		// If backspace is pressed, delete all selected nodes
		if (e.key === 'Backspace') {
			for (const node of this.selectedNodes) {
				this.graph.removeSystem(node.id);
			}
			this.selectedNodes = [];
		}
	}

	/**
	 * Get a list of all systemNodes, that are visible in the current view
	 * @returns {Array<SystemNode>}
	 */
	getVisibleNodes() {
		return this.view.getVisibleNodes();
	}

	run() {
		if (!this.isInitialized) this._init();

		this.nodePositions = this.Layout.layout(this.getVisibleNodes(), this.view.grouping, this.nodePositions, this.maxRect, this.nodeWidth, this.nodeHeight);

		// timer(this._render.bind(this), this.frameInterval);
		this._render();
	}

	/**
	 * Change the View to another
	 * @param {View} View New View
	 */
	changeView(View: View) {
		this._rmViewListeners();
		this.view = View.init(this.graph);
		this.zoomFactor = 1;
		this.offset = new Coordinate(0, 0);
		this._transform();
		this._resetVisible();
		this._setViewListeners();
	}

	_setViewListeners() {
		this.view
			.on('node-add', (node) => {
				this._addNode(node);
			})
			.on('node-update', (node) => {
				this._updateNode(node);
			})
			.on('node-remove', (node) => {
				this._rmNode(node);
			})
			.on('edge-add', (edge) => {
				this._addEdge(edge);
			})
			.on('edge-update')
			.on('edge-remove')
			.on('group-add')
			.on('group-update')
			.on('group-remove');
	}

	_rmViewListeners() {
		this.view.off(null);
	}

	runLayout(Layout: Layout) {
		this.nodePositions = Layout.layout(this.getVisibleNodes(), this.view.grouping, this.nodePositions, this.maxRect, this.nodeWidth, this.nodeHeight);
		this._render();
	}

	zoomIn() {
		this._scale(false);
	}

	zoomOut() {
		this._scale(true);
	}

	/**
	 * Apply a transformation matrix to this renderer's svg-container. This is used to zoom in/out and move around in the system-map.
	 * @param {number} a Defaults to `this.zoomFactor`
	 * @param {number} b Defaults to 0
	 * @param {number} c Defaults to 0
	 * @param {number} d Defaults to `this.zoomFactor`
	 * @param {number} e Defaults to `this.offset.x`
	 * @param {number} f Defaults to `this.offset.y`
	 */
	_transform(a: number = this.zoomFactor, b: number = 0, c: number = 0, d: number = this.zoomFactor, e: number = this.offset.x, f: number = this.offset.y) {
		let transform = `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;
		svg.setAttr(this.svgContainer, 'transform', transform);
	}

	_translateRel(offset: CoordLike): void {
		let p = this.svgRoot.createSVGPoint();
		p.x = offset.x;
		p.y = offset.y;
		let t = this.svgContainer.getCTM();
		if (!t) return;
		let origin = this.svgRoot.createSVGPoint().matrixTransform(t.inverse());

		p = p.matrixTransform(t.inverse());
		p.x = (p.x - origin.x) * t.a;
		p.y = (p.y - origin.y) * t.d;

		t.e += p.x;
		t.f += p.y;
		this._transform(t.a, 0, 0, t.d, t.e, t.f);
	}

	_scale(out: boolean, scrollPoint: null | undefined | CoordLike = null) {
		if (!scrollPoint)
			scrollPoint = {
				x: this.maxSize.x / 2,
				y: this.maxSize.y / 2,
			};
		// TODO: Let user change this formula via settings, to allow for slower/faster scaling
		let scaleFactor = Math.pow(1 + 0.4, out ? -0.2 : 0.2);
		let p = this.svgRoot.createSVGPoint();
		p.x = scrollPoint.x;
		p.y = scrollPoint.y;
		// Translate to SVG coordinates
		p = p.matrixTransform(this.svgContainer.getCTM()?.inverse());

		// Compute new scale matrix in current mouse position
		let k = this.svgRoot.createSVGMatrix().translate(p.x, p.y).scale(scaleFactor).translate(-p.x, -p.y);
		let t = this.svgContainer.getCTM()?.multiply(k);
		if (!t) return;

		// Apply new scale matrix & update properties
		this.zoomFactor = t.a;
		// this.maxRect.width = this.maxSize.x / t.a;
		// this.maxRect.height = this.maxSize.y / t.a;
		// console.log({ zoomFactor: this.zoomFactor, maxRect: this.maxRect });
		this.offset.update(t.e, t.f);
		this._transform(t.a, 0, 0, t.d, t.e, t.f);
	}

	/**
	 * Select a Node
	 * @param {...SystemNode|String|Number} nodes Node to select. Can be the node itself, its id or its name.
	 */
	selectNodes(...nodes: SystemNode[] | NodeIdentifier[]) {
		this.deselectNodes();
		for (let node of nodes) {
			let n = node;
			if (!(n instanceof SystemNode)) {
				let tmp = this.graph.getNode(n);
				if (!tmp) continue;
				n = tmp;
			}
			this.drawnNodes.get(n.id)?.select();
			this.selectedNodes.push(n);
		}
		this.just_selected = true;
		this.emit('selected-nodes', this.selectedNodes);
	}

	deselectNodes() {
		for (let node of this.selectedNodes) this.drawnNodes.get(node.id)?.deselect();
		this.selectedNodes = [];
		this.emit('deselected-nodes');
	}

	selectEdges(...edges: Edge[] | EdgeIdentifier[]) {
		this.deselectEdges();
		for (let edge of edges) {
			let e = edge;
			if (!(e instanceof Edge)) {
				let tmp = this.graph.getEdgeFromId(e);
				if (!tmp) continue;
				e = tmp;
			}
			this.drawnEdges.get(e.id)?.select();
			this.selectedEdges.push(e);
		}
		this.just_selected = true;
		this.emit('selected-edges', this.selectedEdges);
	}

	deselectEdges() {
		for (let edge of this.selectedEdges) this.drawnEdges.get(edge.id)?.deselect();
		this.selectedEdges = [];
		this.emit('deselected-edges');
	}

	moveNode(nodeId: ID, offset: CoordLike) {
		let oldPos = this.nodePositions.get(nodeId);
		if (!oldPos) return;
		let newPos = oldPos.copy().map((v: number, i: number) => v + (i ? offset.y : offset.x) / this.zoomFactor);

		this.nodePositions.set(nodeId, newPos);
		this._render();
	}

	moveCamera(x: number, y: number) {}

	centerCamera(id: ID) {}

	_buildLine(nodeId: ID, point: Coordinate) {
		let line = this._buildEdgeUI();
		line.nodeId = nodeId;
		this.svgContainer.appendChild(line);
		return this._moveLineTo(line, point);
	}

	_moveLineBy(line: EdgeUIContainer & { to: CoordLike }, offset: CoordLike) {
		let point = new Coordinate(line.to.x + offset.x, line.to.y + offset.y);
		return this._moveLineTo(line, point);
	}

	_moveLineTo(line: EdgeUIContainer, point: Coordinate): EdgeUIContainer {
		let nodePos = this.nodePositions.get(line.nodeId!) ?? point;
		let from = nodePos.rect(this.nodeWidth, this.nodeHeight, 'c').intersect(nodePos, point);

		if (from === null) return line;
		line.setPath(from.x, from.y, point.x, point.y);
		line.to = point;
		return line;
	}

	_buildNodeUI(node: SystemNode): NodeUIContainer {
		let nodeContainer = svg.createEl('g') as NodeUIContainer;
		let rect = svg.createEl('rect', { width: String(this.nodeWidth), height: String(this.nodeHeight), fill: String(node?.data?.color || '#00a2e8') });
		let name = svg.createEl('text', { y: `${(2 * this.nodeHeight) / 3}px` });
		name.textContent = node.name;

		nodeContainer.select = () => {
			svg.setAttrs(rect, { stroke: 'black', 'stroke-width': '2' });
			nodeContainer.selected = true;
		};
		nodeContainer.deselect = () => {
			svg.setAttrs(rect, { stroke: 'none' });
			nodeContainer.selected = false;
		};

		nodeContainer.selected = false;
		nodeContainer.drawnLine = null;
		nodeContainer.node = node;
		nodeContainer.appendChild(rect);
		nodeContainer.appendChild(name);
		return nodeContainer;
	}

	_addNode(node: SystemNode) {
		const nodeContainer = this._buildNodeUI(node);

		nodeContainer.addEventListener('dblclick', (e) => this.selectNodes(node));
		nodeContainer.drag = dragndrop(nodeContainer);
		nodeContainer.drag
			.onStart(() => {
				this.userInteraction = true;
			})
			.onDrag((e: Coordinate, offset: CoordLike) => {
				this.userInteraction = true;
				if (!nodeContainer.selected) {
					this.moveNode(node.id, offset);
					return;
				}

				if (!nodeContainer.drawnLine) nodeContainer.drawnLine = this._buildLine(node.id, e);
				else {
					this._moveLineTo(nodeContainer.drawnLine, e);
				}
			})
			.onStop(() => {
				const insideRectRadius = 10;
				if (nodeContainer.drawnLine) {
					let p = nodeContainer.drawnLine.to;
					if (!p) return;
					for (let id of this.nodePositions.keys()) {
						if (id !== node.id) {
							let nodePos = this.nodePositions.get(id);
							let t = nodePos?.rect(this.nodeWidth, this.nodeHeight, 'c').isPointInside(p, insideRectRadius);
							if (t) {
								let source = this.graph.getSystem(node.id);
								let target = this.graph.getSystem(id);
								if (source && target) {
									let edge = new Edge(source, target);
									this.graph.addEdge(edge);
									break;
								}
							}
						}
					}
					nodeContainer.drawnLine.remove();
					nodeContainer.drawnLine = null;
				}

				this.userInteraction = false;
			});

		const coord = this.Layout.layout([node], this.view.grouping, this.nodePositions, this.maxRect, this.nodeWidth, this.nodeHeight).get(node.id);
		if (!coord) return;
		this.nodePositions.set(node.id, coord);
		this.drawnNodes.set(node.id, nodeContainer);
		this.svgContainer.insertAdjacentElement('beforeend', nodeContainer);
		this._render();
	}

	_rmNode(node: SystemNode) {
		this.drawnNodes.get(node.id)?.remove();
		this.drawnNodes.delete(node.id);
		this.nodePositions.delete(node.id);
		this._render();
	}

	_updateNode(node: SystemNode) {
		this.drawnNodes.get(node.id)?.remove();
		this._addNode(node);
	}

	_renderNodes() {
		this.drawnNodes.forEach((nodeContainer, id) => {
			let coord = this.nodePositions.get(id);
			if (coord) svg.setAttr(nodeContainer, 'transform', `translate(${coord.x - this.nodeWidth / 2}, ${coord.y - this.nodeHeight / 2})`);
		});
	}

	_buildEdgeUI(): EdgeUIContainer {
		let container = svg.createEl('g') as EdgeUIContainer;
		let arrow = svg.createEl('path', { stroke: 'gray', 'stroke-width': '2', 'marker-end': 'url(#Arrow)' });

		container.selected = false;
		container.select = () => {
			svg.setAttrs(arrow, { stroke: 'blue', 'stroke-width': '3' });
			container.selected = true;
		};
		container.deselect = () => {
			svg.setAttrs(arrow, { stroke: 'gray', 'stroke-width': '2' });
			container.selected = false;
		};
		container.setPath = (x1, y1, x2, y2) => {
			svg.setAttr(arrow, 'd', `M ${x1} ${y1} L ${x2} ${y2}`);
		};
		container.appendChild(arrow);
		return container;
	}

	_addEdge(edge: Edge) {
		let edgeUI = this._buildEdgeUI();
		edgeUI.edge = edge;
		edgeUI.addEventListener('dblclick', (e) => {
			this.selectEdges(edge);
		});
		this.svgContainer.insertAdjacentElement('afterbegin', edgeUI);
		this.drawnEdges.set(edge.id, edgeUI);
		this._render();
	}

	_renderEdges() {
		this.drawnEdges.forEach((edgeUI, id) => {
			/** @type {Edge} */
			let edge = edgeUI.edge;
			if (!edge) return;
			let sourceCoord = this.nodePositions.get(edge.source.id);
			let targetCoord = this.nodePositions.get(edge.target.id);
			if (!sourceCoord || !targetCoord) return;
			let from = sourceCoord.rect(this.nodeWidth, this.nodeHeight, 'c').intersect(sourceCoord, targetCoord);
			let to = targetCoord.rect(this.nodeWidth, this.nodeHeight, 'c').intersect(targetCoord, sourceCoord);

			edgeUI.setPath(from.x, from.y, to.x, to.y);
		});
	}

	// TODO: render vertical edges in potentially different ways

	_render() {
		this._renderNodes();
		this._renderEdges();
		return this.userInteraction;
	}

	_onResize() {
		// TODO: Maybe add: this.updateCenter();
		this.maxSize = this._setMaxSizeHelper(null);
		this.maxRect = this.maxSize.rect(0, 0, 'br');
		this._render();
	}
}
