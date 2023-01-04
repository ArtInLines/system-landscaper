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
    constructor(layer: number, settings?: ViewSettings | object);
    _isNodeVisible(node: SystemNode): boolean;
    getVisibleNodes(cached?: boolean): SystemNode[];
    _isEdgeVisible(edge: Edge): boolean;
}
