const View = require('./View');
const Edge = require('../Graphs/Edge');

class SingleLayerView extends View {
	/**
	 * This view only shows nodes that are at the same layer/depth as specified by `layer`.
	 * @param {number} layer
	 * @param {viewSettings} settings
	 */
	constructor(layer, settings = {}) {
		super(settings);
		this.layer = layer;
	}

	_isNodeVisible(node) {
		return node.depth === this.layer;
	}

	getVisibleNodes(cached) {
		if (!cached) {
			let nodes = [];
			this.graph.systemTrees.forEach((tree) => {
				nodes.push(...tree.getSystems(this.layer));
			});
			this.visibleNodes = nodes;
		}
		return this.visibleNodes;
	}

	_isEdgeVisible(edge) {
		return this._isNodeVisible(edge.source) && this._isNodeVisible(edge.target);
	}
}

module.exports = SingleLayerView;
