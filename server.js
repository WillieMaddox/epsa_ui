var express = require('express');
var app = express();
var port = +process.env.PORT || 8050;
var path = require('path');
var errorHandler = require('express-error-handler');
app.use(express.static(__dirname));
app.use(errorHandler());

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, function () {
    console.log('OSM Fire listening on port ' + port);
});

