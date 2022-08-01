console.log(SystemLandscaper);

const graph = SystemLandscaper.graph();

graph.addLink(1, 2);

const renderer = SystemLandscaper.renderer(graph, {
	layout: SystemLandscaper.Layout.interactive(graph, {}),
	graphics: SystemLandscaper.svgGraphics(),
});
renderer.run();
