const graph = SystemLandscaper.graph();

// Not necessary to init systems before linking them
// graph.addSystem('A');
// graph.addSystem('B');
graph.linkSystems('A', 'B');

const renderer = SystemLandscaper.renderer(graph, {
	layout: SystemLandscaper.Layout.interactive(graph, {}),
	graphics: SystemLandscaper.svgGraphics(),
});
renderer.run(10);
