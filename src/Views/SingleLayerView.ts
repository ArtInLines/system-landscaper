import View, { ViewSettings } from './View';
import Edge from '../Graphs/Edge';
import SystemNode from '../Graphs/SystemNode';

export default class SingleLayerView extends View {
	layer: number;

	/**
	 * This view only shows nodes that are at the same layer/depth as specified by `layer`.
	 * @param {number} layer
	 * @param {viewSettings} settings
	 */
	constructor(layer: number, settings: ViewSettings | object = {}) {
		super(settings);
		this.layer = layer;
	}

	_isNodeVisible(node: SystemNode) {
		return node.depth === this.layer;
	}

	getVisibleNodes(cached: boolean = true): SystemNode[] {
		if (!cached) {
			let nodes: SystemNode[] = [];
			this.graph?.systemTrees.forEach((tree) => {
				nodes.push(...tree.getSystems(this.layer));
			});
			this.visibleNodes = nodes;
		}
		return this.visibleNodes;
	}

	_isEdgeVisible(edge: Edge): boolean {
		return this._isNodeVisible(edge.source) && this._isNodeVisible(edge.target);
	}
}
