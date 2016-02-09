var data = {
    "id": "charContainer",
    "value": 100,
    "children": []
};

var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

var diameter = 600;

var svg = d3.select("#alphaPack").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g");

var alphaBubble = d3.layout.pack()
    .size([diameter - 50, diameter - 50])
    .padding(5);

function update(data) {

    var nodes = alphaBubble.nodes(data);

    // Data join by key to <g> nodes
    var node = svg.selectAll(".node")
        .data(nodes, function(d) {
            return d.id; 
        });

    // Data join by key to circles
    var circles = svg.selectAll("circle")
        .data(nodes, function(d) {
            return d.id; 
        });

    // UPDATE
    node.selectAll("circle")
        .attr("class", function(d, i) {
        var result = d.id === "charContainer" ? "container" : "update";
            return result;
    });

    // ENTER
    var enterNode = node.enter().append("g")
        .attr("class", "node");
        
    enterNode.append("circle")
        .attr("class", function(d, i) {
            var result = d.id === "charContainer" ? "container" : "enter";
            return result;
        })
        .style("fill-opacity", 1e-6);
     
    enterNode.append("text")
        .attr("class", "text_16_2_5")
        .attr("dx", -14)
        .attr("dy", ".25em")
        .text(function(d) { return d.id; });   

    // All
    node.transition().duration(750)
        .attr("transform", function(d) {
            return "translate(" + d.x + ", " + d.y + ")";
        });
        
    node.selectAll("circle")
      .transition()
        .duration(750)
        .attr("r", function(d) {
            return d.r; 
        })
        .style("fill-opacity", 1);

    // EXIT
    node.exit().selectAll("circle")
        .attr("class", "exit");
      
    node.exit()
      .transition()
        .duration(750)
        .attr("transform", function(d) {
            return "translate(" + (+500) + ", " + (+500) + ")";
        })
        .remove();

    node.exit().selectAll("circle")
      .transition()
        .duration(750)
        .style("fill-opacity", 1e-6);    
}

function objectify(alphArr) {
    var objArr = [];
    for(var i = 0; i < alphArr.length; i++) {
        objArr.push({"id": alphArr[i], "value": 25});
    }
    return objArr;
}

data.children = objectify(alphabet);

update(data);

setInterval(function() {
    //console.log("===>>> data.children: " + data.children);
    var newChildren = d3.shuffle(alphabet)
        .slice(0, Math.floor(Math.random() * 26))
        .sort();
    data.children = objectify(newChildren);
    update(data);
}, 1500);
