const EventManager = require('./Utils/EventManager');
const Coordinate = require('./Geom/Coordinate');
const svg = require('./Utils/svgHelper');
const { randLayout, randSingleLayout } = require('./Layout/randLayout');
const SingleLayerView = require('./Views/SingleLayerView');
const dragndrop = require('./Input/dragndrop');

const timer = require('./Utils/timer');
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
const SystemLandscape = require('./Graphs/SystemLandscape');
const SystemTree = require('./Graphs/SystemTree');
const SystemNode = require('./Graphs/SystemNode');
const Edge = require('./Graphs/Edge');
const View = require('./Views/View');

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
 * @typedef {Object} rendererSettings
 * @property {number} frameInterval number of milliseconds to wait between rendering each frame. Defaults to 30.
 * @property {HTMLElement} container Container elemnent, in which the svg-container is added.
 * @property {?Coordinate} maxSize Maximum rectangle size. Defaults to the whole size of `container`.
 * @property {View} view View to use for rendering.
 * @property {layout} newNodeLayout Function to use for finding the position of a single new node.
 */

/** @type {rendererSettings} */
const defaultSettings = {
	frameInterval: 30,
	container: document.body,
	maxSize: null,
	view: new SingleLayerView(0),
	newNodeLayout: randSingleLayout,
};

class Renderer extends EventManager {
	/**
	 * @param {SystemLandscape} graph Graph to render
	 * @param {rendererSettings} settings Optional Settings that can be adjusted
	 */
	constructor(graph, settings = {}) {
		super();
		settings = { ...defaultSettings, ...settings };

		// TODO:
		// this.nodeLength = 30; // How big should the nodes be drawn???
		this.nodeHeight = 30;
		this.nodeWidth = 80;
		this.arrowSize = 20;
		this.drawnNodes = new Map(); // Map<ID, SVG-Element>
		this.drawnEdges = new Map(); // Map<ID, SVG-Element>
		this.userInteraction = false;
		this.newNodeLayout = settings.newNodeLayout;
		this.selectedNodes = [];

		/** @type {SystemLandscape} System-Landscape-Graph to render */
		this.graph = graph;
		/** @type {View} Current View */
		this.view = settings.view.init(this.graph); // TODO: Set view
		/** @type {Map<Number, Coordinate>} Maps NodeIds to their nodes' coordinates */
		this.nodePositions = new Map();

		/** @type {HTMLElement} */
		this.container = settings.container;
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
		this.maxSize = this._setMaxSizeHelper(settings.maxSize);
		/** @type {number} How many ms to wait between rendering frames */
		this.frameInterval = settings.frameInterval;

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
		window.addEventListener('dblclick', (e) => {
			// TODO:
		});
		this._setViewListeners();
		// TODO: Let the following event-listeners be changeable by the user
		this.dragContainer.onDrag((e, offset) => {
			this._translateRel(offset);
			this._render();
		});
		this.dragContainer.onScroll((e, scaleOffset, scrollPoint) => {
			this._scale(scaleOffset < 0, scrollPoint);
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
			if (this.drawnNodes.has(edge.source.id) && this.drawnNodes.has(edge.target.id)) this._addEdge(edge);
			// TODO
		});
	}

	/**
	 * Only used in the constructor to set the maxSize
	 * @returns {Coordinate}
	 */
	_setMaxSizeHelper(obj) {
		if (obj === null) return new Coordinate(this.container.clientWidth, this.container.clientHeight);
		if (obj instanceof Coordinate) return obj;
		let x = obj?.x ?? obj[0];
		let y = obj?.y ?? obj[1];
		return new Coordinate(x, y);
	}

	/**
	 * Get a list of all systemNodes, that are visible in the current view
	 * @returns {Array<SystemNode>}
	 */
	getVisibleNodes() {
		return this.view.getVisibleNodes();
	}

	// layout(nodes::Array/Set<SystemNode>, grouping::NodeGroup, currentNodePositions::Map<ID, (x,y)-Coordinate>, maxSize)
	//		Returns Map<ID, (x,y)-Coordinate>
	run(layout = randLayout) {
		if (!this.isInitialized) this._init();

		if (typeof layout === 'function') {
			this.nodePositions = layout(this.getVisibleNodes(), this.view.grouping, this.nodePositions, this.maxSize);
		}
		timer(this._render.bind(this), this.frameInterval);
		// this._render();
	}

	/**
	 * Change the View to another
	 * @param {View} View New View
	 */
	changeView(View) {
		this.view = View.init(this.graph);
		this._resetVisible();
		this._rmViewListeners();
		this._setViewListeners();
		// TODO: ???
	}

	_setViewListeners() {
		this.view
			.on('node-add', (node) => {
				this._addNode(node);
			})
			.on('node-update')
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

	runLayout(layout) {
		this.nodePositions = layout(this.getVisibleNodes(), this.view.grouping, this.nodePositions, this.maxSize);
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
	_transform(a = this.zoomFactor, b = 0, c = 0, d = this.zoomFactor, e = this.offset.x, f = this.offset.y) {
		let transform = `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;
		svg.setAttr(this.svgContainer, 'transform', transform);
	}

	_translateRel(offset) {
		let p = this.svgRoot.createSVGPoint();
		p.x = offset.x;
		p.y = offset.y;
		let t = this.svgContainer.getCTM();
		let origin = this.svgRoot.createSVGPoint().matrixTransform(t.inverse());

		p = p.matrixTransform(t.inverse());
		p.x = (p.x - origin.x) * t.a;
		p.y = (p.y - origin.y) * t.d;

		t.e += p.x;
		t.f += p.y;
		this._transform(t.a, 0, 0, t.d, t.e, t.f);
	}

	_scale(out, scrollPoint = null) {
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
		p = p.matrixTransform(this.svgContainer.getCTM().inverse());

		// Compute new scale matrix in current mouse position
		let k = this.svgRoot.createSVGMatrix().translate(p.x, p.y).scale(scaleFactor).translate(-p.x, -p.y);
		let t = this.svgContainer.getCTM().multiply(k);

		// Apply new scale matrix & update properties
		this.zoomFactor = t.a;
		this.offset.update(t.e, t.f);
		this._transform(t.a, 0, 0, t.d, t.e, t.f);
	}

	/**
	 * Select a Node
	 * @param {...SystemNode|String|Number} node Node to select. Can be the node itself, its id or its name.
	 */
	selectNodes(...nodes) {
		for (let nodeContainer of this.selectedNodes) nodeContainer.deselect();
		this.selectedNodes = [];
		for (let node of nodes) {
			if (!(node instanceof SystemNode)) node = this.graph.getNode(node);
			const containerNode = this.drawnNodes.get(node.id);
			if (!containerNode) return;
			containerNode.select();
			this.selectedNodes.push(containerNode);
		}
	}

	moveNode(nodeId, offset) {
		let oldPos = this.nodePositions.get(nodeId);
		let newPos = oldPos.copy().map((v, i) => v + (i ? offset.y : offset.x) / this.zoomFactor);

		this.nodePositions.set(nodeId, newPos);
		this._render();
	}

	moveCamera(x, y) {}

	centerCamera(id) {}

	_buildNodeUI(node) {
		let nodeContainer = svg.createEl('g');
		let rect = svg.createEl('rect', { width: this.nodeWidth, height: this.nodeHeight, fill: node?.data?.color || '#00a2e8' });
		let name = svg.createEl('text', { y: `${(2 * this.nodeHeight) / 3}px` });
		name.textContent = node.name;

		nodeContainer.select = () => {
			svg.setAttrs(rect, { stroke: 'black', 'stroke-width': '2' });
		};
		nodeContainer.deselect = () => {
			svg.setAttrs(rect, { stroke: 'none' });
		};

		nodeContainer.node = node;
		nodeContainer.appendChild(rect);
		nodeContainer.appendChild(name);
		return nodeContainer;
	}

	_addNode(node) {
		const nodeContainer = this._buildNodeUI(node);

		nodeContainer.addEventListener('click', (e) => this.selectNodes(node));
		nodeContainer.drag = dragndrop(nodeContainer);
		nodeContainer.drag
			.onStart(() => {
				this.userInteraction = true;
			})
			.onDrag((e, offset) => {
				this.userInteraction = true;
				this.moveNode(node.id, offset);
			})
			.onStop(() => {
				this.userInteraction = false;
			});

		const coord = this.newNodeLayout(node, this.view.grouping, this.nodePositions, this.maxSize);
		this.nodePositions.set(node.id, coord);
		this.drawnNodes.set(node.id, nodeContainer);
		this.svgContainer.appendChild(nodeContainer);
		this._render();
	}

	_rmNode(node) {
		this.drawnNodes.delete(node.id);
		this.nodePositions.delete(node.id);
		this._render();
	}

	_renderNodes() {
		this.drawnNodes.forEach((nodeContainer, id) => {
			let coord = this.nodePositions.get(id);
			svg.setAttr(nodeContainer, 'transform', `translate(${coord.x - this.nodeWidth / 2}, ${coord.y - this.nodeHeight / 2})`);
		});
	}

	_addEdge(edge) {
		let edgeUI = svg.createEl('path', { stroke: 'gray', 'stroke-width': '2', 'marker-end': 'url(#Arrow)' });
		edgeUI.edge = edge;
		this.svgContainer.appendChild(edgeUI);
		this.drawnEdges.set(edge.id, edgeUI);
		this._render();
	}

	_renderEdges() {
		this.drawnEdges.forEach((edgeUI, id) => {
			/** @type {Edge} */
			let edge = edgeUI.edge;
			let sourceCoord = this.nodePositions.get(edge.source.id);
			let targetCoord = this.nodePositions.get(edge.target.id);
			let from = sourceCoord.rect(this.nodeWidth, this.nodeHeight, true).intersect(sourceCoord, targetCoord);
			let to = targetCoord.rect(this.nodeWidth, this.nodeHeight, true).intersect(targetCoord, sourceCoord);

			let d = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
			svg.setAttr(edgeUI, 'd', d);
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
		this._render();
	}
}

module.exports = Renderer;
