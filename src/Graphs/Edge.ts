import EventManager from '../Utils/EventManager';
import nextID, { ID } from '../Utils/id';
import SystemNode from './SystemNode';

export type EdgeData = object;

export default class Edge extends EventManager {
	id: ID;
	source: SystemNode;
	target: SystemNode;
	data: EdgeData;

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
	constructor(source: SystemNode, target: SystemNode, data: EdgeData = {}) {
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

	setSource(source: SystemNode) {
		this.source = source;
		this.emit('sourceChanged', this.fromId, this);
	}

	setTarget(target: SystemNode) {
		this.target = target;
		this.emit('targetChanged', this.toId, this);
	}

	setData(data: EdgeData) {
		this.data = data;
		this.emit('dataChanged', this.data, this);
	}

	addToData(data: EdgeData) {
		this.data = { ...this.data, ...data };
		this.emit('dataChanged', this.data, this);
	}

	copy() {
		return new Edge(this.source, this.target, { ...this.data });
	}
}
