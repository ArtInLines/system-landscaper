const SystemNode = require('./SystemNode');
const newID = require('../Utils/id');

/**
 * @typedef {Object} GroupData
 */

/** @type {GroupData} */
const defaultData = {};

class NodeGroup {
	/**
	 * Create a Group of Nodes. A group can contain further groups as well as direct children.
	 * @param {String} name Name of the group
	 * @param {GroupData} data Data associated with the group
	 * @param {SystemNode[]} nodes Direct Children-Nodes of this group
	 */
	constructor(id = newID(), name = '', data = {}, nodes = []) {
		/** @type {number} */
		this.id = id;
		/** @type {String} */
		this.name = name ?? '';
		/** @type {GroupData} */
		this.data = { ...defaultData, ...data };
		/** @type {SystemNode[]} */
		this.nodes = nodes ?? [];
		/** @type {NodeGroup[]} */
		this.groups = [];
		/** @type {?NodeGroup} */
		this.parentGroup = null;
	}

	findSubGroup(cb) {
		let found = this.groups.find(cb);
		if (found) return found;
		for (let group of this.groups) {
			found = group.findSubGroup(cb);
			if (found) return found;
		}
		return null;
	}

	addNodes(...nodes) {
		this.nodes.push(...nodes);
		return this;
	}

	addGroups(...groups) {
		this.groups.push(...groups);
		groups.forEach((group) => (group.parentGroup = this));
		return this;
	}

	removeNode(node) {
		let idx = this.nodes.indexOf(node);
		if (idx !== -1) {
			return this.nodes.splice(idx, 1)[0];
		}
		for (let group of this.groups) {
			let removed = group.removeNode(node);
			if (removed) return removed;
		}
		return null;
	}

	removeSubGroup(id) {
		let idx = this.groups.findIndex((group) => group.id === id);
		if (idx !== -1) {
			return this.groups.splice(idx, 1)[0];
		}
		for (let group of this.groups) {
			let removed = group.removeSubGroup(id);
			if (removed) return removed;
		}
		return null;
	}
}

module.exports = NodeGroup;
