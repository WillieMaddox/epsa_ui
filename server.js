var port = 8050;
var express = require('express');
var app = express();
var path = require('path');
app.use(express.static(__dirname));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

console.log('ASPE UI server listening on port ' + port);

app.listen(port);

