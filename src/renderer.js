/**
 * @fileOverview Defines a graph renderer that uses CSS based drawings.
 *
 * @author Andrei Kashcha (aka anvaka) / https://github.com/anvaka
 * @author Val Richter (aka ArtInLines) / https://github.com/ArtInLines - modified for System-Landscaper
 */

var eventify = require('ngraph.events');
var forceDirected = require('ngraph.forcelayout');
var svgGraphics = require('./svgGraphics.js');
var windowEvents = require('./Utils/windowEvents.js');
var domInputManager = require('./Input/domInputManager.js');
var timer = require('./Utils/timer.js');
var getDimension = require('./Input/getDimensions.js');
var dragndrop = require('./Input/dragndrop.js');
const EventManager = require('./Utils/EventManager.js');

/**
 * This is heart of the rendering. Class accepts graph to be rendered and rendering settings.
 * It monitors graph changes and depicts them accordingly.
 *
 * @param graph - Viva.Graph.graph() object to be rendered.
 * @param settings - rendering settings, composed from the following parts (with their defaults shown):
 *   settings = {
 *     // Represents a module that is capable of displaying graph nodes and links.
 *     // all graphics has to correspond to defined interface and can be later easily
 *     // replaced for specific needs (e.g. adding WebGL should be piece of cake as long
 *     // as WebGL has implemented required interface). See svgGraphics for example.
 *     graphics : Viva.Graph.View.svgGraphics(),
 *
 *     // Where the renderer should draw graph. Container size matters, because
 *     // renderer will attempt center graph to that size. Also graphics modules
 *     // might depend on it.
 *     container : document.body,
 *
 *     // Defines whether graph can respond to use input
 *     interactive: true,
 *
 *     // Layout algorithm to be used. The algorithm is expected to comply with defined
 *     // interface and is expected to be iterative. Renderer will use it then to calculate
 *     // graph's layout. For examples of the interface refer to Viva.Graph.Layout.forceDirected()
 *     layout : Viva.Graph.Layout.forceDirected(),
 *
 *     // Directs renderer to display links. Usually rendering links is the slowest part of this
 *     // library. So if you don't need to display links, consider settings this property to false.
 *     renderLinks : true,
 *
 *     // Number of layout iterations to run before displaying the graph. The bigger you set this number
 *     // the closer to ideal position graph will appear first time. But be careful: for large graphs
 *     // it can freeze the browser.
 *     prerender : 0
 *   }
 */

/**
 * @typedef {Object} rendererSettings
 * @property {any} layout - Layout algorithm to be used. The algorithm is expected to comply with defined interface and is expected to be iterative. Renderer will use it then to calculate graph's layout. For examples of the interface refer to Viva.Graph.Layout.forceDirected()
 * @property {any} graphics - Graphics module that is used to render nodes and links.
 * @property {HTMLElement} container - Where the renderer should draw graph. Container size matters, because renderer will attempt center graph to that size. Also graphics modules might depend on it.
 * @property {boolean|('node'|'scroll'|'drag')} interactive - Defines whether graph can respond to user input. Defaults to `true`. When set to a string, then only the specified action is interactive
 * @property {boolean} renderLinks - Directs renderer to display links. Defaults to `true`
 * @property {number} prerender - Number of layout iterations to run before displaying the graph. The bigger you set this number the closer to the ideal position the graph will appear first time. But be careful: for large graphs it can freeze the browser. Defaults to `0`.
 */

/** @type {rendererSettings} */
const defaultSettings = {
	layout: require('./Layout/interactive.js'),
	graphics: require('./svgGraphics.js'),
	container: document.body,
	interactive: true,
	renderLinks: true,
	prerender: 0,
};

class Renderer extends EventManager {
	/**
	 * @param {Graph} graph - Graph to be rendered.
	 * @param {rendererSettings} settings - Rendering settings.
	 */
	constructor(graph, settings) {
		super();
		this.FRAME_INTERVAL = 30;

		this.graph = graph;

		settings = { ...defaultSettings, ...settings };

		this.layout = settings.layout(graph, settings);
		this.graphics = settings.graphics();
		this.container = settings.container;
		this.interactive = settings.interactive;
		this.renderLinks = settings.renderLinks;
		this.prerender = settings.prerender;
		this.inputManager = (this.graphics.inputManager || domInputManager)(this.graph, this.graphics);
		this.animationTimer;
		this.isInitialized = false;
		this.updateCenterRequired = true;
		this.isStable = false;
		this.userInteraction = false;
		this.isPaused = false;
		this.transform = {
			offsetX: 0,
			offsetY: 0,
			scale: 1,
		};
		this.containerDrag;
	}

	// TODO: Update the following Getters to be actual getters

	/**
	 * Returns current transformation matrix.
	 */
	getTransform() {
		return transform;
	}

	/**
	 * Gets current graphics object
	 */
	getGraphics() {
		return graphics;
	}

	/**
	 * Gets current layout.
	 */
	getLayout() {
		return this.layout;
	}

	/**
	 * Performs rendering of the graph.
	 *
	 * @param iterationsCount if specified renderer will run only given number of iterations
	 * and then stop. Otherwise graph rendering is performed indefinitely.
	 *
	 * Note: if rendering stopped by used started dragging nodes or new nodes were added to the
	 * graph renderer will give run more iterations to reflect changes.
	 */
	run(iterationsCount) {
		if (!this.isInitialized) {
			this._prerender();

			this._initDom();
			this._updateCenter();
			this._listenToEvents();

			this.isInitialized = true;
		}

		this._renderIterations(iterationsCount);

		return this;
	}

	reset() {
		graphics.resetScale();
		this._updateCenter();
		this.transform.scale = 1;
	}

	pause() {
		this.isPaused = true;
		this.animationTimer.stop();
	}

	resume() {
		this.isPaused = false;
		this.animationTimer.restart();
	}

	rerender() {
		this._renderGraph();
		return this;
	}

	zoomOut() {
		return this._scale(true);
	}

	zoomIn() {
		return this._scale(false);
	}

	/**
	 * Centers renderer at x,y graph's coordinates
	 */
	moveTo(x, y) {
		this.graphics.graphCenterChanged(transform.offsetX - x * transform.scale, transform.offsetY - y * transform.scale);
		this._renderGraph();
	}

	/**
	 * Removes this renderer and deallocates all resources/timers
	 */
	dispose() {
		this._stopListenToEvents(); // I quit!
	}

	/**
	 * Checks whether given interaction (node/scroll) is enabled
	 */
	_isInteractive(interactionName) {
		if (typeof this.interactive === 'string') {
			return this.interactive.indexOf(interactionName) >= 0;
		} else return this.interactive;
	}

	_renderGraph() {
		this.graphics.beginRender();

		// TODO: move this check graphics
		if (this.renderLinks) this.graphics.renderLinks();

		this.graphics.renderNodes();
		this.graphics.endRender();
	}

	_onRenderFrame() {
		this.isStable = this.getLayout().step() && !this.userInteraction;
		this._renderGraph();

		return !this.isStable;
	}

	_renderIterations(iterationsCount) {
		if (this.animationTimer) return;

		if (typeof iterationsCount === 'number') {
			this.animationTimer = timer(() => {
				iterationsCount -= 1;
				if (iterationsCount < 0) return false;
				else return this._onRenderFrame();
			}, this.FRAME_INTERVAL);
		} else {
			this.animationTimer = timer(() => this._onRenderFrame(), this.FRAME_INTERVAL);
		}
	}

	_resetStable() {
		if (this.isPaused) return;

		this.isStable = false;
		this.animationTimer.restart();
	}

	_prerender() {
		// To get good initial positions for the graph
		// perform several prerender steps in background.
		for (let i = 0; i < this.prerender; i += 1) layout.step();
	}

	_updateCenter() {
		let graphRect = this.layout.getGraphRect();
		let containerSize = getDimension(this.container);

		var cx = (graphRect.x2 + graphRect.x1) / 2;
		var cy = (graphRect.y2 + graphRect.y1) / 2;
		this.transform.offsetX = containerSize.width / 2 - (cx * this.transform.scale - cx);
		this.transform.offsetY = containerSize.height / 2 - (cy * this.transform.scale - cy);
		this.graphics.graphCenterChanged(this.transform.offsetX, this.transform.offsetY);

		this.updateCenterRequired = false;
	}

	_createNodeUi(node) {
		let nodePosition = this.layout.getNodePosition(node.id);
		this.graphics.addNode(node, nodePosition);
	}

	_removeNodeUi(node) {
		this.graphics.releaseNode(node);
	}

	_createLinkUi(link) {
		let linkPosition = this.layout.getLinkPosition(link.id);
		this.graphics.addLink(link, linkPosition);
	}

	_removeLinkUi(link) {
		this.graphics.releaseLink(link);
	}

	_listenNodeEvents(node) {
		if (!this._isInteractive('node')) return;

		let wasPinned = false;

		// TODO: This may not be memory efficient. Consider reusing handlers object.
		this.inputManager.bindDragNDrop(node, {
			onStart: () => {
				wasPinned = this.layout.isNodePinned(node);
				this.layout.pinNode(node, true);
				this.userInteraction = true;
				this._resetStable();
			},
			onDrag: (e, offset) => {
				let oldPos = this.layout.getNodePosition(node.id);
				this.layout.setNodePosition(node.id, oldPos.x + offset.x / this.transform.scale, oldPos.y + offset.y / this.transform.scale);
				this.userInteraction = true;

				this._renderGraph();
			},
			onStop: () => {
				this.layout.pinNode(node, wasPinned);
				this.userInteraction = false;
			},
		});
	}

	_releaseNodeEvents(node) {
		this.inputManager.bindDragNDrop(node, null);
	}

	_initDom() {
		this.graphics.init(this.container);
		this.graph.forEachNode((node) => this._createNodeUi(node));

		if (this.renderLinks) this.graph.forEachLink((link) => this._createLinkUi(link));
	}

	_releaseDom() {
		this.graphics.release(this.container);
	}

	_processNodeChange(change) {
		let node = change.node;

		switch (change.changeType) {
			case 'add':
				this._createNodeUi(node);
				this._listenNodeEvents(node);
				if (this.updateCenterRequired) this._updateCenter();
				break;
			case 'remove':
				this._releaseNodeEvents(node);
				this._removeNodeUi(node);
				if (this.graph.getNodesCount() === 0) this.updateCenterRequired = true; // Next time when node is added - center the graph.
				break;
			case 'update':
				this._releaseNodeEvents(node);
				this._removeNodeUi(node);
				this._createNodeUi(node);
				this._listenNodeEvents(node);
				break;
		}
	}

	_processLinkChange(change) {
		if (!this.renderLinks) return;
		switch (change.changeType) {
			case 'add':
				this._createLinkUi(change.link);
				break;
			case 'remove':
				this._removeLinkUi(change.link);
				break;
			case 'update':
				throw 'Update type is not implemented. TODO: Implement me!';
		}
	}

	_onGraphChanged(changes) {
		for (let change of changes) {
			if (change.node) this._processNodeChange(change);
			else if (change.link) this._processLinkChange(change);
		}
		this._resetStable();
	}

	_onWindowResized() {
		this._updateCenter();
		this._onRenderFrame();
	}

	_releaseContainerDragManager() {
		if (this.containerDrag) {
			this.containerDrag.release();
			this.containerDrag = null;
		}
	}

	_releaseGraphEvents() {
		this.graph.off('changed', this._onGraphChanged);
	}

	_scale(out, scrollPoint) {
		if (!scrollPoint) {
			let containerSize = getDimension(container);
			scrollPoint = {
				x: containerSize.width / 2,
				y: containerSize.height / 2,
			};
		}
		let scaleFactor = Math.pow(1 + 0.4, out ? -0.2 : 0.2);
		this.transform.scale = this.graphics.scale(scaleFactor, scrollPoint);

		this._renderGraph();
		this.emit('scale', this.transform.scale);

		return this.transform.scale;
	}

	_listenToEvents() {
		windowEvents.on('resize', this._onWindowResized);

		this._releaseContainerDragManager();
		if (this._isInteractive('drag')) {
			this.containerDrag = dragndrop(this.container);
			this.containerDrag.onDrag((e, offset) => {
				this.graphics.translateRel(offset.x, offset.y);

				this._renderGraph();
				this.emit('drag', offset);
			});
		}

		if (this._isInteractive('scroll')) {
			if (!this.containerDrag) {
				this.containerDrag = dragndrop(this.container);
			}
			this.containerDrag.onScroll((e, scaleOffset, scrollPoint) => {
				this._scale(scaleOffset < 0, scrollPoint);
			});
		}

		this.graph.forEachNode((node) => this._listenNodeEvents(node));

		this._releaseGraphEvents();
		this.graph.on('changed', this._onGraphChanged);
	}

	_stopListenToEvents() {
		this.rendererInitialized = false;
		this._releaseGraphEvents();
		this._releaseContainerDragManager();
		windowEvents.off('resize', this._onWindowResized);
		this.off();
		this.animationTimer.stop();

		this.graph.forEachLink((link) => {
			if (this.renderLinks) this._removeLinkUi(link);
		});

		this.graph.forEachNode((node) => {
			this._releaseNodeEvents(node);
			this._removeNodeUi(node);
		});

		this.layout.dispose();
		this._releaseDom();
	}
}

function createRenderer(graph, settings) {
	return new Renderer(graph, settings);
}

module.exports = createRenderer;
