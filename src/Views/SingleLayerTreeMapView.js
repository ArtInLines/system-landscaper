const SingleLayerView = require('./SingleLayerView');

class SingleLayerTreeMapView extends SingleLayerView {
	_isEdgeVisible() {
		return false;
	}
}

module.exports = SingleLayerTreeMapView;
