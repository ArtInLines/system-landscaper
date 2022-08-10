const SystemLandscape = SystemMapper.Graph;
const Renderer = SystemMapper.Renderer;
const View = SystemMapper.views.SingleLayerView;

const sl = new SystemLandscape();

sl.addSystem('A');
sl.addSystem('B');
sl.addSystem('C', null, 'A');
sl.addSystem('D', null, 'A');
sl.addSystem('E', null, 'C');
sl.addSystem('F', null, 'C');

sl.linkSystems('C', 'B');
sl.linkSystems('C', 'D');
sl.linkSystemsUndirected('E', 'F');
sl.moveEdge(sl.getEdge('C', 'B'), 'A');
sl.updateSystemName('C', 'C2');
sl.moveSystem('C2', 'B');
sl.updateSystemName('D', 'D2');

sl.removeEdge(sl.getEdge('E', 'F'), false);

const renderer = new Renderer(sl, { view: new View(0) });
renderer.run();

setTimeout(() => {
	sl.addSystem('G');
	sl.linkSystems('G', 'B');
}, 1000);
