let JSONStream = require('JSONStream');
let es = require('event-stream');
let fs = require('fs');

let nodes = new Map();
let graph = require('ngraph.graph')();

fs.createReadStream('map.json', {encoding: 'utf8'})
    .pipe(JSONStream.parse('elements.*'))
    .pipe(es.mapSync(callback))
    .on('end', done);

function callback(el) {
    if (el.type === 'node') processOSMNode(el);
    else if (el.type === 'way') processOSMWay(el);
}

function done() {
    addCoordinatesOfNodes();
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
    let currentNodes = way.nodes;
    if (!currentNodes) {
        console.log('no nodes', way);
        return;
    }
    for (let i = 1; i < currentNodes.length; ++i) {
        let fromId = currentNodes[i];
        let toId = currentNodes[i - 1];
        let roadLength = Math.round((
            Math.abs(nodes.get(fromId).lat - nodes.get(toId).lat) +
            Math.abs(nodes.get(fromId).lon - nodes.get(toId).lon)
        ) * 10000000);
        graph.addLink(fromId, toId, roadLength);
    }
}

function addCoordinatesOfNodes() {
    graph.forEachNode(node => {
        node.data = nodes.get(node.id);
    })
}

function saveResults() {
    console.log('Graph loaded');
    // graph.forEachNode(function (node) {
    //     console.log(node);
    // });
    saveRoadsAsCsv();
    //saveAllForOutput();
    saveNodesAsCsv();
}

function saveAllForOutput() {
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: 'diagram.csv',
        header: [
            {id: 'fromId', title: 'fromId'},
            {id: 'toId', title: 'toId'},
            {id: 'lat', title: 'lat'},
            {id: 'lon', title: 'lon'},
            {id: 'weight', title: 'weight'}
        ]
    });
    let tempRoads = [{}];
    graph.forEachNode(function (node) {
        let temp
        tempRoads.push({
            'fromId': road.fromId,
            'toId': road.toId,
            'lat' : 0,
            'lon' : 0,
            'weight': road.data
        });
    });
    csvWriter.writeRecords(tempRoads).then(() => {
        console.log('...roads are recorded');
    });
}

function saveRoadsAsCsv() {
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: 'roads.csv',
        header: [
            {id: 'fromId', title: 'fromId'},
            {id: 'toId', title: 'toId'},
            {id: 'weight', title: 'weight'}
        ]
    });
    let tempRoads = [{}];
    graph.forEachLink(function (road) {
        tempRoads.push({
            'fromId': road.fromId,
            'toId': road.toId,
            'weight': road.data
        });
    });
    csvWriter.writeRecords(tempRoads).then(() => {
        console.log('...roads are recorded');
    });
}

function saveNodesAsCsv() {
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: 'nodes.csv',
        header: [
            {id: 'id', title: 'id'},
            {id: 'lat', title: 'lat'},
            {id: 'lon', title: 'lon'}
        ]
    });
    let tempNodes = [{}];
    graph.forEachNode(function (node) {
        let temp = nodes.get(node.id);
        tempNodes.push({
            'id'  : node.id,
            'lat' : temp.lat,
            'lon' : temp.lon
        });
    });
    csvWriter.writeRecords(tempNodes).then(() => {
        console.log('...nodes are recorded');
    });
}