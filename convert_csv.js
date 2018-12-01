const createCsvWriter = require('csv-writer').createObjectCsvWriter();

var fileName;
var nodes = [{}];
function convertNodesToCsv(gr, mpNodes, _fileName) {
    gr.forEachNode(function (node) {
        var temp = mpNodes.get(node.id);
        nodes.push({'id'  : node.id,
                    'lat' : temp.lat,
                    'lon' : temp.lon});
    });
    fileName = _fileName;
}

const csvWriter = createCsvWriter({
    path: fileName,
    header: [
        {id: 'id', title: 'ID'},
        {lan: 'lan', title: 'LAN'},
        {lon: 'lon', title: 'LON'}
    ]
});

csvWriter.writeRecords(nodes).then(() => {
    console.log('...Done');
});

module.exports = convertNodesToCsv;