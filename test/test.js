console.log(Viva);

const graph = Viva.Graph.graph();

graph.addLink(1, 2);

const renderer = Viva.Graph.View.renderer(graph, {
	layout: Viva.Graph.Layout.interactive(graph, {}),
	graphics: Viva.Graph.View.svgGraphics(),
});
renderer.run();
