/** D3 layout ***********/

var diameter = 600;

var svg = d3.select("#alphaPack").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g");

var alphaBubble = d3.layout.pack()
    .size([diameter - 50, diameter - 50])
    .padding(8);

/** Model ****************/

var data = {
    "id": 0,
    "value": 100,
    "children": []
};

var sampleSize = 200;
var maxPopulation = 1000;
var halfPop = d3.round(maxPopulation / 2, 0);

var type1 = "type1";
var type2 = "type2";

function reproduce(sampleRatio, bias, sampleSize, popSize) {
    var type1Bias = bias[0];
    var type2Bias = bias[1];

    var percentType1 = sampleRatio[0] * sampleSize;
    var sampleType1 = percentType1 * sampleSize;

    var percentType2 = sampleRatio[1] * sampleSize;
    var sampleType2 = percentType2 * sampleSize;

    var applied = (type1Bias * sampleType1) + (type2Bias * sampleType2);
    var replicationFactor = popSize / applied;

    var numType1 = Math.round(replicationFactor * type1Bias * sampleType1);
    var numType2 = Math.round(replicationFactor * type2Bias * sampleType2);

    var newType1 = marbles(type1, numType1);
    var newType2 = marbles(type2, numType2);

    return(newType1.concat(newType2));
}

function marbles(type, qty) {
    var objArr = [];
    for(var i = 0; i < qty; i++) {
         objArr.push({"id": getId(), "type": type, "value": 25});
    }
    return objArr;
}

function ratio(marbles) {
    var greens = marbles.filter( function(m) {return m.type === 'type1'} );
    var ratioGreen = greens.length / marbles.length;
    var ratioOrange = 1 - ratioGreen;
    var rat = [round(ratioGreen), round(ratioOrange)];
    return rat;
}

function popConvergence(ratio) {
    return ((ratio[0] === 0) || (ratio[1] === 0));
}

function updateType(t) {
    return t == "type1" ? "type1_update" : "type2_update"
}

/** Util ****************/

function round(value) {
    return Number(Math.round(value+'e'+2)+'e-'+2);
}

var id = 0; // Starts at 1
function getId() {
    id = id + 1;
    if(id % 10000 == 0) { console.log("getId: " + id); }
    return id;
}

// Inclusive
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomIntArray(size, lowerBound, upperBound) {
    var result = new Array(size);
    var resultIndex = 0;

    while(resultIndex < size) {
        var randInd = randomInt(lowerBound, upperBound);
        if(!_.contains(result, randInd)) {
            result[resultIndex] = randInd;
            resultIndex += 1;
        }
    }

    return result;
}

/** Cycle ***************/

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

    node.transition().delay(1000).duration(1000)
        .attr("transform", function(d) {
            return "translate(" + d.x + ", " + d.y + ")";
        });
        
    node.selectAll("circle")
      .transition()
        .duration(1000)
        .delay(500)
        .attr("r", function(d) {
            return d.r; 
        })
        .style("fill-opacity", 1);

    // EXIT
    node.exit().selectAll("circle")
      .transition()
        .duration(1000)
        .style("fill-opacity", 1e-6)
        .attr("class", function(d) {
            return d.type == "type1" ? "type1_update" : "type2_update"
        })
        .remove();
} // end update

/** RUN ********/

var reproSize = maxPopulation - sampleSize;
var bias = [.34, .66]; // TODO: source UI parameter

data.children = _.shuffle(reproduce([.5, .5], [.5, .5], sampleSize, maxPopulation));
console.log("===>> data.children.length: " + data.children.length);
update(data);

var timer = setInterval(function() {
    var sampleIndex = randomIntArray(sampleSize, 1, maxPopulation);

    var sample = data.children.filter(function(d, i) { 
        return _.contains(sampleIndex, i); 
    }) // TODO: use [fromIndex]

    var convergence = false;
    var sampleRatio = ratio(sample);
    if(popConvergence(sampleRatio)) {
        if(popConvergence(ratio(data.children))) {
            clearInterval(timer);
            convergence = true;
        }
    }

    if(!convergence) {
        var newChildren = reproduce(sampleRatio, bias, sampleSize, reproSize);
        var sampleOldWithNew = sample.concat(newChildren);
        data.children = _.shuffle(sampleOldWithNew);

        update(data);
    }
}, 2500);
