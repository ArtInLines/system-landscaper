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
sl.moveSystem('C', 'B');

// Expected Tree:
// 	 B				A
// 	 c	   			D
// E  F

// Exprected Edges:
// A  -> B
// E <-> F

console.log(sl.systemsByID);
console.log(sl.edges);
