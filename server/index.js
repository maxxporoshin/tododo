///<reference path="../typings/express/express.d.ts" />
"use strict";
var express = require('express');
var app = express();
app.use(express.static('bower_components'));
app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile('/index.html');
});
app.listen(3000, function () {
    console.log('we are listening on 3000');
});
