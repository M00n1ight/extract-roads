var JSONStream = require('JSONStream');
var es = require('event-stream');
var fs = require('fs');

var nodes = new Map();
var graph = require('ngraph.graph')();

fs.createReadStream('map.json', {encoding: 'utf8'})
    .pipe(JSONStream.parse('elements.*'))
    .pipe(es.mapSync(callback))
    .on('end', done);

function callback(el) {
    if (el.type === 'node') processOSMNode(el);
    else if (el.type === 'way') processOSMWay(el);
}

function done() {
    saveResults();
}

function processOSMError() {
    console.log('error');
}

function processOSMNode(node) {
    nodes.set(node.id, {
        lat: node.lat,
        lon: node.lon
    });
}

function processOSMWay(way) {
    var currentNodes = way.nodes;
    if (!currentNodes) {
        console.log('no nodes', way);
        return;
    }
    for (var i = 1; i < currentNodes.length; ++i) {
        let from = currentNodes[i];
        let to = currentNodes[i - 1];
        graph.addLink(from, to);
    }
}

function saveResults() {
    console.log('Graph loaded');
}