// const Main = {
// 	// TODO: Update Graph to use SystemLandscape
// 	graph: require('./Graphs/SystemLandscape.js'),

// 	serializer: {
// 		// TODO: Update Serializers
// 		loadFromJSON: require('ngraph.fromjson'),
// 		storeToJSON: require('ngraph.tojson'),
// 	},

// 	Geom: {
// 		intersect: require('gintersect'),
// 		intersectRect: require('./Geom/intersectRect.js'),
// 		Rect: require('./Geom/rect.js'),
// 	},

// 	Input: {
// 		domInputManager: require('./Input/domInputManager.js'),
// 		dragndrop: require('./Input/dragndrop.js'),
// 		findElementPosition: require('./Input/findElementPosition.js'),
// 		getDimension: require('./Input/getDimensions.js'),
// 	},

// 	Utils: {
// 		documentEvents: require('./Utils/documentEvents.js'),
// 		nullEvents: require('./Utils/nullEvents.js'),
// 		windowEvents: require('./Utils/windowEvents.js'),
// 		timer: require('./Utils/timer.js'),
// 		newID: require('./Utils/id.js'),
// 		EventManager: require('./Utils/EventManager.js'),
// 		Trie: require('./Utils/Trie.js'),
// 		Tree: require('./Utils/Tree.js'),
// 		ExtendedSet: require('./Utils/ExtendedSet.js'),
// 	},

// 	Layout: {
// 		forceDirected: require('ngraph.forcelayout'),
// 		constant: require('./Layout/constant.js'),
// 		interactive: require('./Layout/interactive.js'),
// 	},

// 	svgGraphics: require('./svgGraphics.js'),

// 	renderer: require('./renderer.js'),

// 	svg: require('simplesvg'),

// 	browserInfo: require('./Utils/browserInfo.js'),
// };

const SystemLandscape = require('./Graphs/SystemLandscape.js');
const Renderer = require('./Renderer.js');
const View = require('./Views/View.js');
const SingleLayerView = require('./Views/SingleLayerView.js');
const defaultLayout = require('./Layout/randLayout.js');

const Main = {
	Graph: SystemLandscape,
	views: {
		View: View,
		SingleLayerView: SingleLayerView,
	},
	Layouts: {
		defaultLayout: defaultLayout,
	},
	Renderer: Renderer,
};

global.SystemMapper = Main;
module.exports = Main;
