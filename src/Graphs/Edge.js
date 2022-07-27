const newID = require('../Utils/id');

class Edge {
	/**
	 * Create a new Directed Edge (with associated data). Edges are used to connect nodess in a graph.
	 * @param {Node} source Source node of the edge.
	 * @param {Node} target Target node of the edge.
	 * @param {any} data Data associated with the edge. Defaults to an empty object.
	 */
	constructor(source, target, data) {
		this.id = newID();
		this.source = source;
		this.target = target;
		this.data = data || {};
	}
}

module.exports = Edge;
