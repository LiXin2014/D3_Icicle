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
      let focus = rootNode;

      // compute whole width and height for all nodes, so we can set proper scale acoording to viewport.
      let nodesWidth = rootNode.x1 - rootNode.x0;
      let nodesHeight = (rootNode.y1 - rootNode.y0) * (rootNode.height + 1);

      // Define the div for the tooltip
      var div = d3.select("body").append("div")	
      .attr("class", "tooltip")				
      .style("opacity", 0);

      const cells = svg
      .selectAll("g")
      .data(nodes)
      .join("g")
        .attr("transform", d => `translate(${getXScale(nodesWidth)(d.x0)},${getYScale(nodesHeight)(d.y0)})`);

        const clicked = (event, p) => {
          // p became the new root.
          focus = focus === p ? p = p.parent : p;

          if(!p) {
            return;
          }
  
          nodesWidth = p.x1 - p.x0;
          nodesHeight = (p.y1 - p.y0) * (p.height + 1);
    
          rootNode.each(d => {
            d.target = {
              x0: getXScale(nodesWidth)(d.x0 - p.x0),
              x1: getXScale(nodesWidth)(d.x1 - p.x0),
              y0: getYScale(nodesHeight)(d.y0 - p.y0),
              y1: getYScale(nodesHeight)(d.y1 - p.y0)
            }
          });
  
          const t = cells.transition().duration(750)
          .attr("transform", d => `translate(${d.target.x0},${d.target.y0})`);
  
          rects.transition(t).attr("height", d => d.target.y1 - d.target.y0).attr("width", d => d.target.x1 - d.target.x0);
      
        }

    
     const rects = cells.append('rect')
      .attr("width", d => getXScale(nodesWidth)(d.x1 - d.x0))
      .attr("height", d => getYScale(nodesHeight)(d.y1 - d.y0))
      .attr("fill-opacity", 0.6)
      .attr("tabindex", 0)
      .attr("aria-label", d => d.data.name)
      .attr("fill", d => {
        return colorScale((d.children ? d : d.parent).data.name);
      })
      .style("cursor", "pointer")
      .on("click", clicked)
      .on('mouseover', function(event, d) {		
        div.transition()		
            .duration(200)		
            .style("opacity", .9);		
        div.html(d.data.name)	
            .style("left", (event.clientX) + "px")		
            .style("top", (event.clientY - 28) + "px");	
        })					
        .on("mouseout", function(d) {		
        div.transition()		
            .duration(500)		
            .style("opacity", 0.9);	
      });

      const texts = cells.append('text')
        .attr('x', d => getXScale(nodesWidth)(d.x1 - d.x0) / 2)
        .attr('y', d => getYScale(nodesHeight)(d.y1 - d.y0) / 2)
        .attr('dy', '0.32em')
        .attr('text-anchor', d => 'middle')
        .attr('font-size', d => 3 - d.depth + 'em')
        .text(d => d.data.name);


      const onSearch = () => {
        let term = document.getElementById("term").value;
        rects.each(rect => {
          let index = rect.data.name.toLocaleLowerCase().indexOf(term.toLocaleLowerCase());
          if(index !== -1){
            rect.highlighted = true;
          } else {
            rect.highlighted = false;
          }
        });
        // color on highlited
        rects.transition().duration(750).attr("fill", d => {
          return d.highlighted ? "red" : colorScale((d.children ? d : d.parent).data.name);
        });
      };

      const searchButton = document.querySelector("#searchButton");
      searchButton.addEventListener('click', onSearch);
    });

    



    /* TODO
    scale
    put rect and text in a group so they move together when zooming
    zoom
    children doesn't have to have length of parent.
    */