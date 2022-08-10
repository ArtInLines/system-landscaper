const graphContainer = document.getElementById('graph-root');

const SystemLandscape = SystemMapper.Graph;
const Renderer = SystemMapper.Renderer;
const View = SystemMapper.views.SingleLayerView;

const sl = new SystemLandscape();

sl.addSystem('A');
sl.addSystem('B');
sl.linkSystems('A', 'B');

const renderer = new Renderer(sl, { view: new View(0), container: graphContainer });
renderer.run();

setTimeout(() => {
	sl.addSystem('C');
	sl.linkSystems('C', 'B');
}, 1000);
