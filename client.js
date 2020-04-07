// Required Modules
var express    = require("express");
var morgan     = require("morgan");
var compression = require('compression');
var cors = require("cors");

var app        = express();
var httpsRedirect = require('express-https-redirect');

var port = 8080;

app.use(morgan("dev"));
app.use(compression());
//app.use('*', httpsRedirect(true));
app.use(require('prerender-node').set('prerenderToken', 'clqtxyaqx94XCz8ZWLam'));
app.use(express.static(__dirname + "/node_modules"));
app.use(express.static(__dirname + "/app"));
app.use(express.static(__dirname + "/app", {
  maxage: '2h'
}))

app.use(__dirname + "/node_modules", express.static('node_modules'));

app.get('*', function(req, res){
    res.setHeader("Cache-Control", "public, max-age=2592000");
    res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
    res.sendFile(__dirname + '/app/index.html');
});

app.get("/", function(req, res) {
    res.sendFile("./app/index.html");
});

// Start Server
app.listen(port, function () {
    console.log( "Express server listening on port " + port);
});
