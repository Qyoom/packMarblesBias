var data = {
    "id": 0,
    "value": 100,
    "children": []
};

var sampleSize = 200;
var maxPopulation = 1000;
var halfPop = d3.round(maxPopulation / 2, 0);

var diameter = 600;

var svg = d3.select("#alphaPack").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g");

var alphaBubble = d3.layout.pack()
    .size([diameter - 50, diameter - 50])
    .padding(8);

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
        .attr("class", function(d) {
            var result = d.id === 0 ? "container" : updateType(d.type);
            return result;
        });

    // ENTER
    var enterNode = node.enter().append("g")
        .attr("class", "node");
        
    enterNode.append("circle")
        .attr("class", function(d) {
            var result = d.id === 0 ? "container" : d.type;
            return result;
        })
        .style("fill-opacity", 1e-6);  

    enterNode.attr("transform", function(d) {
        return "translate(" + d.x + ", " + d.y + ")";
    });

    node.transition().delay(1000).duration(750)
        .attr("transform", function(d) {
            return "translate(" + d.x + ", " + d.y + ")";
        });
        
    node.selectAll("circle")
      .transition()
        .duration(750)
        .delay(500)
        .attr("r", function(d) {
            return d.r; 
        })
        .style("fill-opacity", 1);

    // EXIT
    node.exit().selectAll("circle")
      .transition()
        .duration(750)
        .style("fill-opacity", 1e-6)
        .attr("class", function(d) {
            return d.type == "type1" ? "type1_update" : "type2_update"
        })
        .remove();
} // end update

function updateType(t) {
    return t == "type1" ? "type1_update" : "type2_update"
}

var id = 0; // Starts at 1
function getId() {
    id = id + 1;
    if(id % 10000 == 0) { console.log("getId: " + id); }
    return id;
}
 
function reproduce(ratio) {
    var objArr = [];
    for(var i = 0; i < ratio[0]; i++) {
        objArr.push({"id": getId(), "type": "type1", "value": 25});
    }
    for(var i = 0; i < ratio[1]; i++) {
        objArr.push({"id": getId(), "type": "type2", "value": 25});
    }
    return objArr;
    return _.shuffle(objArr);
}

function ratio(marbles) {
    var greens = marbles.filter( function(m) {return m.type === 'type1'} );
    var ratioGreen = greens.length / marbles.length;
    var ratioOrange = 1 - ratioGreen;
    var rat = [round(ratioGreen), round(ratioOrange)];
    console.log("ratioGreen: " + rat[0] + " ratioOrange: " + rat[1]);
    return rat;
}

function popConvergence(ratio) {
    return ((ratio[0] === 1.0) || (ratio[1] === 1.0));
}

// Util
function round(value) {
    return Number(Math.round(value+'e'+2)+'e-'+2);
}

/** RUN ********/

data.children = _.shuffle(reproduce([halfPop, halfPop]));
//data.children = reproduce(halfPop, halfPop);

update(data);

setInterval(function() {
    //console.log("setInterval TOP, data.children: " + data.children);
    var sample = _.sample(data.children, 200);
    var rat = ratio(sample);
    //console.log("setInterval, sample: " + sample);
    var newChildren = reproduce([rat[0]*maxPopulation, rat[1]*maxPopulation]);
    console.log("--> setInterval, newChildren.length: " + newChildren.length);
    var sampleOldWithNew = sample.concat(newChildren);
    data.children = _.shuffle(sampleOldWithNew);
    //data.children = sampleOldWithNew;
    update(data);
}, 2000);
