var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');

require('dotenv').config();

var app = express();

app.use(express.static('static'));
var routes = require('./routes/index');

// required in order to POST to express (must be above app.use for routes)
app.use(bodyParser.json({
    limit: '50mb'
}));

app.use('/api/v1/', routes);

const server = require('http').createServer(app);
server.listen(process.env.API_PORT);

console.log("Node environment: " + process.env.NODE_ENV);
console.log("Test UI: http://localhost:" + process.env.API_PORT);

module.exports = server;