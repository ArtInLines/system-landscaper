const SystemLandscape = require('../src/Graphs/SystemLandscape');

const sl = new SystemLandscape();

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

sl.removeEdge(sl.getEdge('E', 'F'), false);

// Expected Tree:
// 	 B				A
// 	 C2	   			D2
// E   F

// Exprected Edges:
// A  -> B
// E <-  F

// console.log(sl.systemsByID);
console.log(sl.edges);
