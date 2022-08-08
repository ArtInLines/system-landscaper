const EventManager = require('../Utils/EventManager');
const Coordinate = require('../Utils/Coordinate');
const timer = require('../Utils/timer');

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
// - selectNode(nodeId)
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
 */

const defaultSettings = {
	frameInterval: 30,
	container: document.body,
	maxSize: null,
};

class Renderer extends EventManager {
	/**
	 * @param {SystemLandscaper} graph Graph to render
	 * @param {rendererSettings} settings Optional Settings that can be adjusted
	 */
	constructor(graph, settings) {
		super();
		settings = { ...defaultSettings, ...settings };

		this.graph = graph;
		this.view = null; // TODO: Set view
		this.nodePositions = new Map();
		this.container = settings.container;
		this.maxSize = this._setMaxSizeHelper(settings.maxSize);
		this.frameInterval = settings.frameInterval;
		this.isPaused = false;
		this.animationTimer = null;
	}

	_setMaxSizeHelper(obj) {
		if (obj === null) return new Coordinate(this.container.clientWidth, this.container.clientHeight);
		if (obj instanceof Coordinate) return obj;
		let x = obj?.x ?? obj[0];
		let y = obj?.y ?? obj[1];
		return new Coordinate(x, y);
	}

	getVisibleNodes() {
		return this.view.getVisibleNodes();
	}

	// layout(nodes::Array/Set<SystemNode>, currentNodePositions::Map<ID, (x,y)-Coordinate>, maxSize)
	//		Returns Map<ID, (x,y)-Coordinate>
	run(layout) {
		// TODO: Add initialization stuff
		if (typeof layout === 'function') this.nodePositions = layout(this.getVisibleNodes(), this.nodePositions);
		this.animationTimer = timer(() => this._renderFrame(), this.frameInterval);
	}

	pause() {
		this.isPaused = true;
		this.animationTimer.stop();
	}

	resume() {
		this.isPaused = false;
		this.animationTimer.restart();
	}

	changeView(View) {
		this.view = View.init(this.graph);
	}

	runLayout(layout) {}

	zoomIn() {}

	zoomOut() {}

	selectNode(nodeId) {}

	moveNode(nodeId, x, y) {}

	moveCamera(x, y) {}

	centerCamera(id) {}

	drawNode(node, x, y) {}
}

module.exports = Renderer;
