
// CHOROPLETH MAP

var width = 960,
height = 500;

const data = d3.map();

const tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);




var projection = d3.geoConicConformalSpain();
var mapPath = d3.geoPath()
.projection(projection);

var svg = d3.select("#mapLV")
.append("svg")
.attr("viewBox", `0 0 ${width} ${height}`)
.attr("id", "mapLVsvg");

// Load external data 

d3.queue()
	.defer(d3.json, "https://cdn.jsdelivr.net/gh/bmgoitia/D3_map_graph@main/ESP_ccaa.json")
	.defer(d3.csv, "https://cdn.jsdelivr.net/gh/bmgoitia/D3_map_graph@main/crimes.csv", function(d) {
		data.set(d.code, +d.crimes);
	})
	.await(ready);


function ready(error, topo){
  console.log(topo)
  console.log(data)

  var colorScale = d3.scaleQuantize() // try d3.scaleThreshold()
  .domain([10, 100])  // set your own domain: [10, 25, 40...]
  .range(d3.schemeBlues[7]);  // same as:

  /* .range(["#eff3ff","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#084594"]) 
  
  Si lo haces de esta manera, luego puedes hacer una leyenda a mano pasando mucho de D3
  */




  var spainData = topojson.feature(topo, topo.objects.autonomous_regions);

svg.selectAll("#mapLVsvg path") 
  .data(spainData.features)
  .enter()
  .append("path")
  .attr("class", "caItem")
  .attr("d", mapPath)
  .attr("fill", function (d) {
    d.total = data.get(d.properties.CODNUT2) || 0;
   // console.log(d)  // geoJSON data
    //console.log(data)    // crimes data
    return colorScale(d.total);
  })
  .attr("data-id", d =>d.properties.CODNUT2 )
  .style("stroke", "#000")
  .style("stroke-width", "0.5px")
  .style("opacity", 1)
	.on("mouseover", mouseOver)
	.on("mouseleave", mouseLeave);;

svg
.append("path")
  .style("fill","none")
  .style("stroke","#000")
  .attr("d", projection.getCompositionBorders());




  function mouseOver(d) {

		console.log(d)
		//console.log(this)

		d3.selectAll(".caItem")
			.transition()
			.duration(200)
			.style("opacity", .5)
			.style("stroke", "transparent");
		d3.select(this)
			.transition()
			.duration(200)
			.style("opacity", 1)
			.style("stroke", "black");

		tooltip.style("left", (d3.event.pageX + 15) + "px")
			.style("top", (d3.event.pageY - 28) + "px")
			.transition().duration(400)
			.style("opacity", 1)
			.text(d.properties.NAMEUNIT + ': ' + d.total);
	}


 function mouseLeave() {
		d3.selectAll(".caItem")
			.transition()
			.duration(200)
			.style("opacity", 1)
			.style("stroke", "transparent");
		tooltip.transition().duration(300)
			.style("opacity", 0);
	}







}






// LINE GRAPH

// CREATE GRAPH




d3.json("/delinc.json", function(error, data){
  console.log(data);


  let dataValue;

// Variables 'globales' de medidas

  const svgWidth = 600;
  const svgHeight = 300;

  const gMargins = { top: 20, bottom: 20, left: 30, right: 20 };


  const gWidth = 600 - gMargins.left - gMargins.right;
  const gHeight = 300 - gMargins.top - gMargins.bottom;
  


// Create SVG and padding for the chart

 

  const svgLV = d3.select("#chartLV")
      .append("svg")
      .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
      .attr("id", "svgLV"); 



  
  // Crear la parte común: el svg, los <g>, el path... vacíos

  const mainG = svgLV.append("g")
      .attr("transform", `translate(${gMargins.left},${gMargins.top})`)
      .attr("class", "gContainer");


  const gPath = mainG.append("g")
      //.attr("transform", `translate(-${gMargins.left},-${gMargins.top})`)
      .attr("class", "gPath");

  
  const chartPath = gPath.append("path")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("class", "finalPath")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 2.5);



  const gXaxis = mainG.append("g")
      .attr("class", "xAxis");

  const gYaxis = mainG.append("g")
      .attr("class", "yAxis");




function createGraph(data){

  // crear escalas

  const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, gWidth]); 

  const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.crimes) + 20])
      .range([gHeight, 0]); 


  // definir path

  const lvLine = d3.line()
  .x(d => xScale(d.year))
  .y(d => yScale(d.crimes));





  // print axis

  gXaxis.attr("transform", `translate(0,${gHeight})`)
        .call(d3.axisBottom(xScale).ticks(data.length).tickFormat(d3.format("d")));

  gYaxis.attr("transform", `translate(0, 0)`)
        .call(d3.axisLeft(yScale));

  


  // print line

  const printLine = d3.select(".finalPath")
      .datum(data)
      .attr("d", lvLine);



  // transition del path

  const pathLength = printLine.node().getTotalLength();
  //console.log(pathLength);
  
  const transitionPath = d3
    .transition()
    .ease(d3.easeSin)
    .duration(2500);

  printLine
    .attr("stroke-dashoffset", pathLength)
    .attr("stroke-dasharray", pathLength)
    .transition(transitionPath)
    .attr("stroke-dashoffset", 0);

}


// INTERACTIVE

addEventListener("click", (e) => {
  console.log(e)

  if(e.target.classList.contains('caItem')){  
  
      butTextValue = e.target.dataset.id  
      console.log(butTextValue);

      let spanEl = document.getElementById("caName");

      for(el of data){
          if(butTextValue == el.code){  
              dataValue = el.num;
              spanEl.textContent= el.label;
              spanEl.classList.add("spanActive");


          }
      }

      createGraph(dataValue);

  }    

      
  
  
})


createGraph(data[0].num);



})