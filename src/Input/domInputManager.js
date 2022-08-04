/**
 * @author Andrei Kashcha (aka anvaka) / https://github.com/anvaka
 */

let dragndrop = require('./dragndrop.js');

class DomInputManager {
	constructor(graph, graphics) {
		this.nodeEvents = {};
		this.graph = graph;
		this.graphics = graphics;
	}

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
	bindDragNDrop(node, handlers) {
		let events;
		if (handlers) {
			let nodeUI = this.graphics.getNodeUI(node.id);
			events = dragndrop(nodeUI);
			if (typeof handlers.onStart === 'function') {
				events.onStart(handlers.onStart);
			}
			if (typeof handlers.onDrag === 'function') {
				events.onDrag(handlers.onDrag);
			}
			if (typeof handlers.onStop === 'function') {
				events.onStop(handlers.onStop);
			}

			this.nodeEvents[node.id] = events;
		} else if ((events = this.nodeEvents[node.id])) {
			events.release();
			delete this.nodeEvents[node.id];
		}
	}
}

module.exports = (graph, graphics) => new DomInputManager(graph, graphics);
