const SystemLandscape = require('./Graphs/SystemLandscape.js');
const SystemTree = require('./Graphs/SystemTree.js');
const SystemNode = require('./Graphs/SystemNode.js');
const Edge = require('./Graphs/Edge.js');
const Renderer = require('./Renderer.js');
const View = require('./Views/View.js');
const SingleLayerView = require('./Views/SingleLayerView.js');
const SingleLayerTreeMapView = require('./Views/SingleLayerTreeMapView.js');
const Layout = require('./Layout/Layout.js');

const Main = {
	Graph: {
		SystemLandscape,
		SystemTree,
		SystemNode,
		Edge,
	},
	Views: {
		View,
		SingleLayerView,
		SingleLayerTreeMapView,
	},
	Layouts: {
		Layout,
	},
	Renderer: Renderer,
};

global.SystemMapper = Main;
module.exports = Main;
