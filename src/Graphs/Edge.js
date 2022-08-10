const EventManager = require('../Utils/EventManager.js');
const nextID = require('../Utils/id.js');
const SystemNode = require('./SystemNode.js');

class Edge extends EventManager {
	/**
	 * Create a new Edge to connect to Nodes. This class offers certain events to listen to changes:
	 
	 - `sourceChanged`: When the source of this edge changes. Args: `(newSourceID, edge)`
	 - `targetChanged`: When the target of this edge changes. Args: `(newTargetID, edge)`
	 - `dataChanged`: When the data of this edge changes. Args: `(updatedData, edge)`
	 - `update`: When any of the above events occurs. Args: `(...args of the event - this edge is always the second argument)`
	 * @param {SystemNode} source ID of the source node
	 * @param {SystemNode} target ID of the target node
	 * @param {any} data Data associated with this edge. Defaults to an empty object.
	 */
	constructor(source, target, data = {}) {
		super();
		this.id = nextID();
		this.source = source;
		this.target = target;
		this.data = data || {};

		this.on('sourceChanged', (...args) => this.emit('update', ...args));
		this.on('targetChanged', (...args) => this.emit('update', ...args));
		this.on('dataChanged', (...args) => this.emit('update', ...args));
	}

	get fromId() {
		return this.source.id;
	}

	get toId() {
		return this.target.id;
	}

	setSource(source) {
		this.source = source;
		this.emit('sourceChanged', source, this);
	}

	setTarget(target) {
		this.target = target;
		this.emit('targetChanged', target, this);
	}

	setData(data) {
		this.data = data;
		this.emit('dataChanged', this.data, this);
	}

	updateData(data) {
		this.data = { ...this.data, ...data };
		this.emit('dataChanged', this.data, this);
	}
}

module.exports = Edge;
