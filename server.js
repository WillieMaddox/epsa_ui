const express = require('express');
const path = require('path');
const errorHandler = require('express-error-handler');

let app = express();
let port = +process.env.PORT || 8050;
app.use(express.static(__dirname));
app.use(errorHandler());

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, function () {
    console.log('OSM Fire listening on port ' + port);
});

