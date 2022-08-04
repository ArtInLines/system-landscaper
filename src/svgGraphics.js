/**
 * @fileOverview Defines a graph renderer that uses SVG based drawings.
 *
 * @author Andrei Kashcha (aka anvaka) / https://github.com/anvaka
 */

module.exports = svgGraphics;

let svg = require('simplesvg');
let eventify = require('ngraph.events');
let domInputManager = require('./Input/domInputManager.js');
let intersectRect = require('./Geom/intersectRect.js');

/**
 * Performs svg-based graph rendering. This module does not perform
 * layout, but only visualizes nodes and edges of the graph.
 */
function svgGraphics() {
	// TODO: Let settings be passed in the constructor, so the user can customize them
	let svgContainer,
		svgRoot,
		offsetX = 0,
		offsetY = 0,
		initCallback,
		actualScale = 1,
		allNodes = {},
		allLinks = {},
		nodeLength = 30,
		nodeBuilder = function (node) {
			let container = svg('g');
			let rect = svg('rect').attr('width', nodeLength).attr('height', nodeLength).attr('fill', '#00a2e8');
			// Center text: https://stackoverflow.com/questions/5546346/how-to-place-and-center-text-in-an-svg-rectangle
			// To do that, the building process needs access to the position of the rectangle -> the class' architecture needs to be changed for this.
			// For now this hardcoded solution is good enough.
			let name = svg('text')
				.attr('y', `${(2 * nodeLength) / 3}px`)
				.text(node.name);

			container.append(rect);
			container.append(name);
			return container;
		},
		nodePositionCallback = function (nodeUI, pos) {
			nodeUI.attr('transform', 'translate(' + (pos.x - nodeLength / 2) + ',' + (pos.y - nodeLength / 2) + ')');
		},
		linkBuilder = function (link) {
			return svg('path').attr('stroke', 'gray').attr('marker-end', 'url(#Triangle)');
		},
		linkPositionCallback = function (linkUI, fromPos, toPos) {
			// Here we should take care about
			//  "Links should start/stop at node's bounding box, not at the node center."

			// For rectangular nodes Viva.Graph.geom() provides efficient way to find
			// an intersection point between segment and rectangle
			let toNodeSize = nodeLength;
			let fromNodeSize = nodeLength;

			let from =
				intersectRect(
					// rectangle:
					fromPos.x - fromNodeSize / 2, // left
					fromPos.y - fromNodeSize / 2, // top
					fromPos.x + fromNodeSize / 2, // right
					fromPos.y + fromNodeSize / 2, // bottom
					// segment:
					fromPos.x,
					fromPos.y,
					toPos.x,
					toPos.y
				) || fromPos; // if no intersection found - return center of the node

			let to =
				intersectRect(
					// rectangle:
					toPos.x - toNodeSize / 2, // left
					toPos.y - toNodeSize / 2, // top
					toPos.x + toNodeSize / 2, // right
					toPos.y + toNodeSize / 2, // bottom
					// segment:
					toPos.x,
					toPos.y,
					fromPos.x,
					fromPos.y
				) || toPos; // if no intersection found - return center of the node

			let data = 'M' + from.x + ',' + from.y + 'L' + to.x + ',' + to.y;

			linkUI.attr('d', data);
		},
		fireRescaled = function (graphics) {
			// TODO: maybe we shall copy changes?
			graphics.fire('rescaled');
		},
		cachedPos = { x: 0, y: 0 },
		cachedFromPos = { x: 0, y: 0 },
		cachedToPos = { x: 0, y: 0 },
		updateTransform = function () {
			if (svgContainer) {
				let transform = 'matrix(' + actualScale + ', 0, 0,' + actualScale + ',' + offsetX + ',' + offsetY + ')';
				svgContainer.attr('transform', transform);
			}
		};

	svgRoot = createSvgRoot();

	let graphics = {
		getNodeUI: function (nodeId) {
			return allNodes[nodeId];
		},

		getLinkUI: function (linkId) {
			return allLinks[linkId];
		},

		/**
		 * Sets the callback that creates node representation.
		 *
		 * @param builderCallback a callback function that accepts graph node
		 * as a parameter and must return an element representing this node.
		 *
		 * @returns If builderCallbackOrNode is a valid callback function, instance of this is returned;
		 * Otherwise undefined value is returned
		 */
		node: function (builderCallback) {
			if (typeof builderCallback !== 'function') {
				return; // todo: throw? This is not compatible with old versions
			}

			nodeBuilder = builderCallback;

			return this;
		},

		/**
		 * Sets the callback that creates link representation
		 *
		 * @param builderCallback a callback function that accepts graph link
		 * as a parameter and must return an element representing this link.
		 *
		 * @returns If builderCallback is a valid callback function, instance of this is returned;
		 * Otherwise undefined value is returned.
		 */
		link: function (builderCallback) {
			if (typeof builderCallback !== 'function') {
				return; // todo: throw? This is not compatible with old versions
			}

			linkBuilder = builderCallback;
			return this;
		},

		/**
		 * Allows to override default position setter for the node with a new
		 * function. newPlaceCallback(nodeUI, position, node) is function which
		 * is used by updateNodePosition().
		 */
		placeNode: function (newPlaceCallback) {
			nodePositionCallback = newPlaceCallback;
			return this;
		},

		placeLink: function (newPlaceLinkCallback) {
			linkPositionCallback = newPlaceLinkCallback;
			return this;
		},

		/**
		 * Called every before renderer starts rendering.
		 */
		beginRender: function () {},

		/**
		 * Called every time when renderer finishes one step of rendering.
		 */
		endRender: function () {},

		/**
		 * Sets translate operation that should be applied to all nodes and links.
		 */
		graphCenterChanged: function (x, y) {
			offsetX = x;
			offsetY = y;
			updateTransform();
		},

		/**
		 * Default input manager listens to DOM events to process nodes drag-n-drop
		 */
		inputManager: domInputManager,

		translateRel: function (dx, dy) {
			let p = svgRoot.createSVGPoint(),
				t = svgContainer.getCTM(),
				origin = svgRoot.createSVGPoint().matrixTransform(t.inverse());

			p.x = dx;
			p.y = dy;

			p = p.matrixTransform(t.inverse());
			p.x = (p.x - origin.x) * t.a;
			p.y = (p.y - origin.y) * t.d;

			t.e += p.x;
			t.f += p.y;

			let transform = 'matrix(' + t.a + ', 0, 0,' + t.d + ',' + t.e + ',' + t.f + ')';
			svgContainer.attr('transform', transform);
		},

		scale: function (scaleFactor, scrollPoint) {
			let p = svgRoot.createSVGPoint();
			p.x = scrollPoint.x;
			p.y = scrollPoint.y;

			p = p.matrixTransform(svgContainer.getCTM().inverse()); // translate to SVG coordinates

			// Compute new scale matrix in current mouse position
			let k = svgRoot.createSVGMatrix().translate(p.x, p.y).scale(scaleFactor).translate(-p.x, -p.y),
				t = svgContainer.getCTM().multiply(k);

			actualScale = t.a;
			offsetX = t.e;
			offsetY = t.f;
			let transform = 'matrix(' + t.a + ', 0, 0,' + t.d + ',' + t.e + ',' + t.f + ')';
			svgContainer.attr('transform', transform);

			fireRescaled(this);
			return actualScale;
		},

		resetScale: function () {
			actualScale = 1;
			let transform = 'matrix(1, 0, 0, 1, 0, 0)';
			svgContainer.attr('transform', transform);
			fireRescaled(this);
			return this;
		},

		/**
		 * Called by Viva.Graph.View.renderer to let concrete graphic output
		 * provider prepare to render.
		 */
		init: function (container) {
			container.appendChild(svgRoot);
			updateTransform();

			// To render an arrow we have to address two problems:
			//  1. Links should start/stop at node's bounding box, not at the node center.
			//  2. Render an arrow shape at the end of the link.

			// Rendering arrow shape is achieved by using SVG markers, part of the SVG
			// standard: http://www.w3.org/TR/SVG/painting.html#Markers

			// Add Triangle Marker to svg definitions. This marker is used to display edges with arrows.
			let marker = svg('marker')
				.attr('id', 'Triangle')
				.attr('viewBox', `0 0 ${nodeLength} ${nodeLength}`)
				.attr('refX', `${nodeLength}`)
				.attr('refY', `${nodeLength / 2}`)
				.attr('markerUnits', 'strokeWidth')
				.attr('markerWidth', `${nodeLength}`)
				.attr('markerHeight', `${nodeLength / 2}`)
				.attr('fill', '#333')
				.attr('orient', 'auto');
			marker.append('path').attr('d', `M 0 0 L ${nodeLength} ${nodeLength / 2} L 0 ${nodeLength} z`);
			// Marker should be defined only once in <defs> child element of root <svg> element:
			let defs = svgRoot.append('defs');
			defs.append(marker);

			// Notify the world if someone waited for update. TODO: should send an event
			if (typeof initCallback === 'function') {
				initCallback(svgRoot);
			}
		},

		/**
		 * Called by Viva.Graph.View.renderer to let concrete graphic output
		 * provider release occupied resources.
		 */
		release: function (container) {
			if (svgRoot && container) {
				container.removeChild(svgRoot);
			}
		},

		/**
		 * Called by Viva.Graph.View.renderer to let concrete graphic output
		 * provider prepare to render given link of the graph
		 *
		 * @param link - model of a link
		 */
		addLink: function (link, pos) {
			let linkUI = linkBuilder(link);
			if (!linkUI) {
				return;
			}
			linkUI.position = pos;
			linkUI.link = link;
			allLinks[link.id] = linkUI;
			if (svgContainer.childElementCount > 0) {
				svgContainer.insertBefore(linkUI, svgContainer.firstChild);
			} else {
				svgContainer.appendChild(linkUI);
			}
			return linkUI;
		},

		/**
		 * Called by Viva.Graph.View.renderer to let concrete graphic output
		 * provider remove link from rendering surface.
		 *
		 * @param linkUI visual representation of the link created by link() execution.
		 **/
		releaseLink: function (link) {
			let linkUI = allLinks[link.id];
			if (linkUI) {
				svgContainer.removeChild(linkUI);
				delete allLinks[link.id];
			}
		},

		/**
		 * Called by Viva.Graph.View.renderer to let concrete graphic output
		 * provider prepare to render given node of the graph.
		 *
		 * @param nodeUI visual representation of the node created by node() execution.
		 **/
		addNode: function (node, pos) {
			let nodeUI = nodeBuilder(node);
			if (!nodeUI) {
				return;
			}
			nodeUI.position = pos;
			nodeUI.node = node;
			allNodes[node.id] = nodeUI;

			svgContainer.appendChild(nodeUI);

			return nodeUI;
		},

		/**
		 * Called by Viva.Graph.View.renderer to let concrete graphic output
		 * provider remove node from rendering surface.
		 *
		 * @param node graph's node
		 **/
		releaseNode: function (node) {
			let nodeUI = allNodes[node.id];
			if (nodeUI) {
				svgContainer.removeChild(nodeUI);
				delete allNodes[node.id];
			}
		},

		renderNodes: function () {
			for (let key in allNodes) {
				if (allNodes.hasOwnProperty(key)) {
					let nodeUI = allNodes[key];
					cachedPos.x = nodeUI.position.x;
					cachedPos.y = nodeUI.position.y;
					nodePositionCallback(nodeUI, cachedPos, nodeUI.node);
				}
			}
		},

		renderLinks: function () {
			for (let key in allLinks) {
				if (allLinks.hasOwnProperty(key)) {
					let linkUI = allLinks[key];
					cachedFromPos.x = linkUI.position.from.x;
					cachedFromPos.y = linkUI.position.from.y;
					cachedToPos.x = linkUI.position.to.x;
					cachedToPos.y = linkUI.position.to.y;
					linkPositionCallback(linkUI, cachedFromPos, cachedToPos, linkUI.link);
				}
			}
		},

		/**
		 * Returns root element which hosts graphics.
		 */
		getGraphicsRoot: function (callbackWhenReady) {
			// todo: should fire an event, instead of having this context.
			if (typeof callbackWhenReady === 'function') {
				if (svgRoot) {
					callbackWhenReady(svgRoot);
				} else {
					initCallback = callbackWhenReady;
				}
			}
			return svgRoot;
		},
		/**
		 * Returns root SVG element.
		 *
		 * Note: This is internal method specific to this renderer
		 */
		getSvgRoot: function () {
			return svgRoot;
		},
	};

	// Let graphics fire events before we return it to the caller.
	eventify(graphics);

	return graphics;

	function createSvgRoot() {
		let svgRoot = svg('svg');

		svgContainer = svg('g').attr('buffered-rendering', 'dynamic');

		svgRoot.appendChild(svgContainer);
		return svgRoot;
	}
}
