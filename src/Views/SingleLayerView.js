const View = require('./View');

class SingleLayerView extends View {
	constructor(layer) {
		super();
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
		if (this._isNodeOrAncestorVisible(edge.source) && this._isNodeOrAncestorVisible(edge.target)) {
			return true;
		}
	}
}

module.exports = SingleLayerView;
