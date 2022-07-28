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

	get sourceSystem() {
		const Node = require('./Node');
		if (this.source instanceof Node) return this.source.system;
		else return this.source;
	}

	get targetSystem() {
		const Node = require('./Node');
		if (this.target instanceof Node) return this.target.system;
		else return this.target;
	}
}

module.exports = Edge;
