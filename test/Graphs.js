const SystemLandscape = require('../src/Graphs/SystemLandscape');

const sl = new SystemLandscape();

sl.addSystem('A');
sl.addSystem('B');
sl.addSystem('C', null, 'A');

sl.linkSystems('A', 'B');

sl.moveEdge(sl.getEdge('A', 'B'), 'C');

console.log(sl.systemsByID);
console.log(sl.edges);
