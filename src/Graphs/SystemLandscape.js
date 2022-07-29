const EventManager = require('../Utils/EventManager');
const Trie = require('../Utils/Trie');
const newID = require('../Utils/id');
const SystemTree = require('./SystemTree');
const System = require('./System');

const defaultOpts = {};

class SystemLandscape extends EventManager {
	constructor() {
		this.systemsByName = new Trie();
		this.systemsByID = new Map();
		this.systemTrees = [];
		this.edges = [];
	}

	// Getting Data

	getSystem(id) {
		if (this.systemsByID.has(id)) return this.systemsByID.get(id);
		else return null;
	}

	getSystemTree(id) {
		return this.systemTrees.find((tree) => tree.id === id);
	}

	getSystems(startLayer = 0, endLayer = startLayer, flatten = false) {
		let res = this.systemTrees.map((tree) => tree.getSystems(startLayer, endLayer));
		if (flatten) return res.flat(1);
		else return res;
	}

	getSystemsByName(name) {
		return this.systemsByName.findPrefix(name);
	}

	getLinksOfSystem(systemID, horizontal = true, vertical = true, includeLinksOfChildren = false) {
		return this.edges.filter((edge) => edge.source === systemID || edge.target === systemID);
	}

	getEdge(id) {
		return this.edges.find((edge) => edge.id === id);
	}

	// Adding Data

	addSystem(name, data, parent = null) {
		// TODO
	}

	linkSystems(from, to, data) {
		// TODO
	}

	linkSystemsUndirected(system1, system2, data) {
		this.linkSystems(system1, system2, data);
		this.linkSystems(system2, system1, data);
		// TODO: Anything else to do?
	}

	// Removing Data

	removeSystem(id, removeChildren = true) {
		// TODO
	}

	removeEdge(id) {
		// TODO
	}

	// Updating Data

	updateSystem(id, data) {
		// TODO
	}

	updateEdge(id, data) {
		// TODO
	}

	// Moving Data

	moveSystem(id, newParent, moveChildren = true) {
		// TODO
	}

	moveEdge(id, newSource = null, newTarget = null, keepBidirectiona = true) {
		// TODO
	}

	// Positioning

	positionSystem(id, x, y) {
		// TODO
	}

	positionSystemTree(id, x, y) {
		// TODO
	}

	automaticLayout(layout) {
		// TODO
	}

	positionEdge(params) {
		// TODO
	}

	// Saving / Loading

	save(format, location = null) {
		// TODO
	}

	load(location, format = null) {
		// TODO
	}

	saveView(name) {
		// TODO
	}

	deleteView(name) {
		// TODO
	}

	goBack(steps = 1) {
		// TODO
	}

	goForward(steps = 1) {
		// TODO
	}
}

module.exports = SystemLandscape;
