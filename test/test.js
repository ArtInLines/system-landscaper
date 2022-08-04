const sl = SystemLandscaper.graph();

sl.addSystem('A');
sl.addSystem('B');
sl.addSystem('C', null, 'A');
sl.addSystem('D', null, 'A');
sl.addSystem('E', null, 'C');
sl.addSystem('F', null, 'C');

sl.linkSystems('C', 'B');
sl.linkSystemsUndirected('E', 'F');
sl.moveEdge(sl.getEdge('C', 'B'), 'A');
sl.updateSystemName('C', 'C2');
sl.moveSystem('C2', 'B');

sl.updateSystemName('D', 'D2');

// sl.removeEdge(sl.getEdge('E', 'F'), false);

const renderer = SystemLandscaper.renderer(sl);
renderer.run(10);
