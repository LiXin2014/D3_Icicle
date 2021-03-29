/* 
Take below as example
Eve   Cain      
      Seth	   Enos
		           Noam 
      Abel      
      Awan     Enoch
      Azure

d3.hierarchy turns each data into a node. 
height is distance to right, depth is distance to left. 
For Eve, height is 2, depth is 0.

https://bl.ocks.org/tophtucker/a35c0f4f32400755a6a9b976be834ab3
*/
  import * as d3 from 'https://unpkg.com/d3?module'
  

  const width = document.body.clientWidth;
  const height = document.body.clientHeight / 2;
  

  const svg = d3.select('svg').attr('width', width).attr('height',height);
  
  const partitionLayout = d3.partition().size([height, width]).padding(1);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  const getXScale = nodesWidth => d3.scaleLinear().domain([0, nodesWidth]).range([0, width]);
  const getYScale = nodesHeight => d3.scaleLinear().domain([0, nodesHeight]).range([0, height]);
  
  d3.json('data.json')
    .then(data => {
      const root = d3.hierarchy(data);
      const summed = root.sum(d => d.value);
      const sorted = summed.sort((a, b) => d3.descending(a.height, b.height) || d3.descending(a.value, b.value));

      const partitioned = partitionLayout(sorted);
      const nodes = partitioned.descendants();

      const rootNode = nodes[0];

      // compute whole width and height for all nodes, so we can set proper scale acoording to viewport.
      const nodesWidth = rootNode.x1 - rootNode.x0;
      const nodesHeight = (rootNode.y1 - rootNode.y0) * (rootNode.height + 1);

      //const xScale = d3.scaleLinear().domain([0, nodesWidth]).range([0, width]);
      //const yScale = d3.scaleLinear().domain([0, nodesHeight]).range([0, height]);

      const cells = svg
        .selectAll("g")
        .data(nodes)
        .join("g")
          .attr("transform", d => `translate(${getXScale(nodesWidth)(d.x0)},${getYScale(nodesHeight)(d.y0)})`);

      //svg.selectAll('rect').data(nodes)
        //.enter().append('rect')
      cells.append('rect')
        //.attr("x", d => getXScale(nodesWidth)(d.x0))
        //.attr("y", d => getYScale(nodesHeight)(d.y0))
        .attr("width", d => getXScale(nodesWidth)(d.x1 - d.x0))
        .attr("height", d => getYScale(nodesHeight)(d.y1 - d.y0))
        .attr("fill-opacity", 0.6)
        //.attr('fill', 'red');
        .attr("fill", d => {
          return colorScale((d.children ? d : d.parent).data.name);
          //return "red";
        });

      //svg.selectAll('text').data(nodes)
        //.enter().append('text')
      cells.append('text')
          .attr('x', d => getXScale(nodesWidth)(d.x1 - d.x0) / 2)
          .attr('y', d => getYScale(nodesHeight)(d.y1 - d.y0) / 2)
          .attr('dy', '0.32em')
          .attr('text-anchor', d => 'middle')
          .attr('font-size', d => 3 - d.depth + 'em')
          .text(d => d.data.name);
    });

    



    /* TODO
    scale
    put rect and text in a group so they move together when zooming
    zoom

    */