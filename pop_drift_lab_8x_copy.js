<!-- TODO: Modularize -->

<!-- ---- Entities --------------------- -->

var Marble = function() {
    var color;
};

var Green = function() {
    Marble.call(this);
    this.color = 'green';
};
Green.prototype = Object.create(Marble.prototype);
Green.prototype.constructor = Green;

var Orange = function() {
    Marble.call(this);
    this.color = 'orange';
};
Orange.prototype = Object.create(Marble.prototype);
Orange.prototype.constructor = Orange;

<!-- ---- functions --------------------- -->

function ratio(marbles) {
    var greens = marbles.filter( function(m) {return m.color === 'green'} );
    var ratioGreen = greens.length / marbles.length;
    var ratioOrange = 1 - ratioGreen;
    var rat = [round(ratioGreen), round(ratioOrange)];
    return rat;
}

function popConvergence(ratio) {
    return ((ratio[0] === 1.0) || (ratio[1] === 1.0));
}

// I am not striving for computational efficency, but rather to model -->
// organic behavior. This will be important later when individualized 
// properties are introduced.

function spawnSingle(marble) {
    if(marble instanceof Green) return new Green();
    else return new Orange();
}

function spawnTwins(marbles) {
    var spawn = new Array(marbles.length * 2);
    for(var i = 0; i < marbles.length; i++) {
        spawn[i] = spawnSingle(marbles[i]);
        spawn[(spawn.length - 1) - i] = spawnSingle(marbles[i]);
    }
    return spawn;
}

// Assuming uniform replication pattern. However, half of the last remaining 
// quantity of replicants must be newly sampled from original.
function replicate(marbles, maxPopSize) {
    var newPop = marbles;
    while(newPop.length < (maxPopSize / 2)) {
        newPop = spawnTwins(newPop);
    }
    var remainderSampleSize = (maxPopSize - newPop.length) / 2;
    var remainderSample = _.sample(newPop, remainderSampleSize);
    var remainder = spawnTwins(remainderSample);
    var result = newPop.concat(remainder);
    if(maxPopSize - result.length === 1) { // Accounts for odd numbered arrays
        result.push(spawnSingle(_.sample(newPop,1)));
    }
    //console.log("replicate, result: " + JSON.stringify(result));
    return result;
}

function cycleReplication(marbles, sampleSize, maxPopSize, maxCycles) {
    var cycles = [];
    var cycleCount = 0;
    var newPop = marbles;
    var orig = ratio(newPop);
    orig.unshift(0);
    cycles.push(orig);
    while(!popConvergence(ratio(newPop)) && cycleCount < maxCycles) {
        cycleCount += 1;
        newPop = replicate(_.sample(newPop, sampleSize), maxPopSize);
        var rat = ratio(newPop);
        rat.unshift(cycleCount);
        cycles.push(rat);
    }
    return cycles;
}

// Util
function round(value) {
    return Number(Math.round(value+'e'+2)+'e-'+2);
}

<!-- ---- Initialization --------------- -->

var maxPopSize = 1000;
var sampleSize = 100;
var maxCycles = 1000;

var greenPop = new Array(Math.floor(maxPopSize / 2));
var orangePop = new Array(maxPopSize - greenPop.length);

greenPop.fill(new Green());
orangePop.fill(new Orange());

var initialCombinedPop = _.shuffle(greenPop.concat(orangePop));

<!-- ---- Cycle until convergence --------------- -->

function run() {
    return cycleReplication(initialCombinedPop, sampleSize, maxPopSize, maxCycles);
}





