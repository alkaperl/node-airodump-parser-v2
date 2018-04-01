// var data = [
//   [10,5],
//   [13,2],
//   [12,3],
//   [9,6,],
//   [11,4],
//   [9,6,]
// ];
//
// var m = 1,
//     r = 50,
//     z = d3.scale.category20c().range(["#303030", "#f4f6f8"]);
//     // z = ["#FFFFFF", "#000000"];
//
// // var tooltip = d3.select("body")
// //     .append("div")
// //     .style("position", "absolute")
// //     .style("z-index", "10")
// //     .style("visibility", "hidden")
// //     .style("width", "100")
// //     .style("height", "50")
// //     .style("background-color", "#e0e0e0")
// //     .style("border","5px solid #e0e0e0")
// //     .text("mad skills");
//
// // Insert an svg element (with margin) for each row in our dataset. A child g
// // element translates the origin to the pie center.
// var svg = d3.select("#chart").selectAll("svg")
//     .data(data)
//   .enter().append("svg")
//     .attr("class", "donut_svg")
//     // .attr("width", "90%")
//     // .attr("height", "90%")
//   .append("g")
//     .attr("transform", "translate(" + (r + m) + "," + (r + m) + ")")
//
//   // .on("mouseover", function(){return tooltip.style("visibility", "visible");})
//   // .on("mousemove", function(){return tooltip.style("top",
//   //   (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
//   // .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
//
// // The data for each svg element is a row of numbers (an array). We pass that to
// // d3.layout.pie to compute the angles for each arc. These start and end angles
// // are passed to d3.svg.arc to draw arcs! Note that the arc radius is specified
// // on the arc, not the layout.
// svg.selectAll("path")
//     .data(d3.layout.pie())
//   .enter().append("path")
//     .attr("d", d3.svg.arc()
//         .innerRadius(r / 2)
//         .outerRadius(r))
//     .style("fill", function(d, i) { return z(i); });





d3.select("input[value=\"total\"]").property("checked", true);

// var svg = d3.select("#chart")
// 	.append("svg")
// 	.append("g")



var width = 960,
    height = 450,
	radius = Math.min(width, height) / 2;

var svg = d3.select('#chart').append('svg')
    .attr('id', 'chart-render')
    .attr("width", '100%')
    .attr("height", '100%')
    .attr('viewBox', (-width / 2) + ' ' + (-height / 2) + ' ' + width + ' ' + height)
    .attr('preserveAspectRatio', 'xMinYMin')

svg.append("g")
	.attr("class", "slices");
svg.append("g")
	.attr("class", "labelName");
svg.append("g")
	.attr("class", "labelValue");
svg.append("g")
	.attr("class", "lines");

var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) {
		return d.value;
	});

// var arc = d3.svg.arc()
// 	.outerRadius(radius * 0.8)
// 	.innerRadius(radius * 0.4);

var arc = d3.svg.arc()
  .innerRadius(radius - 100)
   .outerRadius(radius - 20);

var outerArc = d3.svg.arc()
	.innerRadius(radius * 0.9)
	.outerRadius(radius * 0.9);

var legendRectSize = (radius * 0.05);
var legendSpacing = radius * 0.02;


var div = d3.select("#chart").append("div").attr("class", "toolTip");

// svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var colorRange = d3.scale.category20c();
var color = d3.scale.ordinal()
	.range(colorRange.range());



datasetTotal = [
		{label:"CSS/SASS", value:19},
        {label:"Node, Backbone, Express", value:5},
        {label:"jQuery, vanilla js, custom interaction", value:17},
        {label:"Python + Django", value:13},
        {label:"NGINX, Vagrant, Ansible, sysadmin", value:19},
        {label:"postgresql, MongoDB", value:7},
        {label:"HTML, Handlebars, Jinja", value:27},
        ];

datasetOption1 = [
		{label:"User Interface", value:22},
        {label:"User Experience Research + Testing", value:33},
        {label:"Wireframes", value:4},
        {label:"User Personas + Flows", value:15},
        ];

datasetOption2 = [
		{label:"Design Research", value:10, link:"/projects/#research"},
        {label:"Strategy + Planning", value:20},
        {label:"User Research & Testing", value:30},
        {label:"Information Architecture", value:5},
        ];

change(datasetTotal);


d3.selectAll("input")
	.on("change", selectDataset);

function selectDataset()
{
	var value = this.value;
	if (value == "total")
	{
		change(datasetTotal);
	}
	else if (value == "option1")
	{
		change(datasetOption1);
	}
	else if (value == "option2")
	{
		change(datasetOption2);
	}
}

function change(data) {


	/* ------- PIE SLICES -------*/
	var slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(data), function(d){ return d.data.label });

    slice.enter()
        .insert("path")


        // .style("fill", function(d) { return color(d.data.label); })
        // .style("fill", function(d) { return color(d.data.label); })
        .style("stroke", "#ffffff")
        .attr("class", "slice");

    slice
        .transition().duration(1000)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
        })
    slice
        // .on("mousemove", function(d){
        //     // div.style("left", d3.event.pageX+10+"px");
        //     // div.style("top", d3.event.pageY-25+"px");
        //     div.style("left", d3.event.clientX-50+"px");
        //     div.style("top", d3.event.clientY-10+"px");
        //
        //     div.style("display", "inline-block");
        //     div.html((d.data.label)+"<br>"+(d.data.value)+"%");
        // });
        .on("click",function(d){
            console.log(d.data);
        });
    slice
        .on("mouseout", function(d){
            div.style("display", "none");
        });

    slice.exit()
        .remove();

    // var legend = svg.selectAll('.legend')
    //     .data(color.domain())
    //     .enter()
    //     .append('g')
    //     .attr('class', 'legend')
    //     .attr('transform', function(d, i) {
    //         var height = legendRectSize + legendSpacing;
    //         var offset =  height * color.domain().length / 2;
    //         var horz = -3 * legendRectSize;
    //         var vert = i * height - offset;
    //         return 'translate(' + horz + ',' + vert + ')';
    //     });
    //
    // legend.append('rect')
    //     .attr('width', legendRectSize)
    //     .attr('height', legendRectSize)
    //     .style('fill', color)
    //     .style('stroke', color);
    //
    // legend.append('text')
    //     .attr('x', legendRectSize + legendSpacing)
    //     .attr('y', legendRectSize - legendSpacing)
    //     .text(function(d) { return d; });

    /* ------- TEXT LABELS -------*/

    var text = svg.select(".labelName").selectAll("text")
        .data(pie(data), function(d){ return d.data.label });

    text.enter()
        .append("text")
        .attr("dy", ".35em")
        .text(function(d) {
            return (d.data.label+": "+d.value+"%");
        });

    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text
        .transition().duration(1000)
        .attrTween("transform", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return "translate("+ pos +")";
            };
        })
        .styleTween("text-anchor", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start":"end";
            };
        })
        .text(function(d) {
            return (d.data.label+": "+d.value+"%");
        });


    text.exit()
        .remove();

    /* ------- SLICE TO TEXT POLYLINES -------*/

    var polyline = svg.select(".lines").selectAll("polyline")
        .data(pie(data), function(d){ return d.data.label });

    polyline.enter()
        .append("polyline");

    polyline.transition().duration(1000)
        .attrTween("points", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };
        });

    polyline.exit()
        .remove();
};


// var dataset = {
//     design: [
//         {label:"Category 1", value:19},
//         {label:"Category 2", value:5},
//         {label:"Category 3", value:13},
//         {label:"Category 4", value:17},
//         {label:"Category 5", value:19},
//         {label:"Category 6", value:27}
//     ],
//     development: [
//         {label:"Category 1", value:6},
//         {label:"Category 2", value:10},
//         {label:"Category 3", value:63},
//         {label:"Category 4", value:7},
//         {label:"Category 5", value:29},
//         {label:"Category 6", value:17}
//     ]
// };
//
// // var dataset = {
// //         apples: [53245, 28479, 19697, 24037, 40245],
// //         oranges: [200, 200, 200, 200]
// //     };
//
//     var width = 960,
//       height = 500,
//       radius = Math.min(width, height) / 2;
//
//     var enterClockwise = {
//         startAngle: 0,
//         endAngle: 0
//     };
//
//     var enterAntiClockwise = {
//         startAngle: Math.PI * 2,
//         endAngle: Math.PI * 2
//     };
//
//     var color = d3.scale.category20();
//
//     var pie = d3.layout.pie()
//       .sort(null);
//
//     var arc = d3.svg.arc()
//       .innerRadius(radius - 100)
//       .outerRadius(radius - 20);
//
//     var svg = d3.select('#chart').append('svg')
//          .attr('id', 'chart-render')
//          .attr("width", '100%')
//          .attr("height", '100%')
//          .attr('viewBox', (-width / 2) + ' ' + (-height / 2) + ' ' + width + ' ' + height)
//          .attr('preserveAspectRatio', 'xMinYMin')
//
//     var path = svg.selectAll("path")
//       .data(pie(dataset.design.value))
//       .enter().append("path")
//         .attr("fill", function (d, i) { return color(i); })
//         .attr("d", arc(enterClockwise))
//         .each(function (d) {
//             this._current = {
//                 data: d.data,
//                 value: d.value,
//                 startAngle: enterClockwise.startAngle,
//                 endAngle: enterClockwise.endAngle
//             }
//         });
//
//     path.transition()
//         .duration(750)
//         .attrTween("d", arcTween);
//
//     d3.selectAll("input").on("change", change);
//
//     var timeout = setTimeout(function () {
//         d3.select("input[value=\"development\"]").property("checked", true).each(change);
//     }, 2000);
//
//     function change() {
//         clearTimeout(timeout);
//         path = path.data(pie(dataset[this.value]));
//         path.enter().append("path")
//             .attr("fill", function (d, i) {
//                 return color(i);
//             })
//             .attr("d", arc(enterAntiClockwise))
//             .each(function (d) {
//                 this._current = {
//                     data: d.data,
//                     value: d.value,
//                     startAngle: enterAntiClockwise.startAngle,
//                     endAngle: enterAntiClockwise.endAngle
//                 };
//             }); // store the initial values
//
//         path.exit()
//             .transition()
//             .duration(750)
//             .attrTween('d', arcTweenOut)
//             .remove() // now remove the exiting arcs
//
//         path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
//     }
//
//     function arcTween(a) {
//         var i = d3.interpolate(this._current, a);
//         this._current = i(0);
//         return function (t) {
//             return arc(i(t));
//         };
//     }
//     function arcTweenOut(a) {
//         var i = d3.interpolate(this._current, { startAngle: Math.PI * 2, endAngle: Math.PI * 2, value: 0 });
//         this._current = i(0);
//         return function (t) {
//             return arc(i(t));
//         };
//     }
//
//
//     function type(d) {
//         d.value = +d.value;
//         return d;
//     }
