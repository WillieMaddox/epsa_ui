var express = require('express');
var app = express();
var port = +process.env.PORT || 8050;
var path = require('path');
app.use(express.static(__dirname));
app.use(express.errorHandler());

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, function () {
    console.log('OSM Fire listening on port ' + port);
});

