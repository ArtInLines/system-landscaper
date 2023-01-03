export = SingleLayerView;
declare class SingleLayerView extends View {
    /**
     * This view only shows nodes that are at the same layer/depth as specified by `layer`.
     * @param {number} layer
     * @param {viewSettings} settings
     */
    constructor(layer: number, settings?: viewSettings);
    layer: number;
    _isNodeVisible(node: any): boolean;
    getVisibleNodes(cached: any): import("../Graphs/SystemNode")[];
    _isEdgeVisible(edge: any): boolean;
}
import View = require("./View");
