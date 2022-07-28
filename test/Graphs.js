const Node = require('../src/Graphs/Node');
const System = require('../src/Graphs/System');
const SystemLandscape = require('../src/Graphs/SystemLandscape');

const v1 = new Node(null);
const s1 = v1.system;
const s2 = new System(v1);

console.assert(s1 !== s2 && s1.id !== s2.id, "Systems should't be equal");

const v2 = new System().root;
const v3 = v1.createChild();

console.assert(v1.id !== v2.id, 'Node IDs should be unique');
console.assert(v1.system !== null && v2.system !== null, "Node systems shouldn't be null");
console.assert(v1.parent === null && v2.parent === null, 'v1 and v2 should have no parents');

console.assert(v1.root === v1, 'v1 is the root of v1');
console.assert(v2.root === v2, 'v2 is the root of v2');
console.assert(v3.root === v1, 'v1 is the root of v3');

v1.system.addNode(v2);
console.assert(v1.system === v2.system, 'v1 and v2 should be in the same system');
console.assert(v1.system === v3.system, 'v1 and v3 should be in the same system');
console.assert(v1.childrenAmount === 2, 'v1 should have 2 children');

////
////
// System Landscapes
////
////

const sl = new SystemLandscape();
let portal2 = sl.addNode(null, { name: 'Portal2' });
let uk = sl.addNode(null, { name: 'UK' });

sl.addLink(portal2, uk);
console.assert(sl.nodes.length === 2, 'System landscape should have 2 nodes');
console.assert(sl.edges.length === 1, 'System landscape should have 1 edge');
console.assert(sl.systems.length === 2, 'System landscape should have 2 system');

sl.moveNode(portal2.id, uk.system, true);
console.assert(sl.nodes.length === 2, 'System landscape should have 2 nodes');
console.assert(sl.edges.length === 1, 'System landscape should have 1 edge');
console.assert(sl.systems.length === 1, 'System landscape should have 1 system');

console.log(sl);
