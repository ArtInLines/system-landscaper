const nextID = require('../Utils/id.js');

class Edge {
	constructor(source, target, data) {
		this.id = nextID();
		this.source = source;
		this.target = target;
		this.data = data;
	}
}

module.exports = Edge;
