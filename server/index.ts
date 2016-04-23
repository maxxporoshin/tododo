///<reference path="../typings/express/express.d.ts" />

import express = require('express');
import path = require('path');
var app = express();

app.use(express.static('bower_components'));
app.use(express.static('public'));


app.get('/', function(req, res) {
    res.sendFile('/index.html');
});

app.listen(3000, function() {
    console.log('we are listening on 3000');
});
