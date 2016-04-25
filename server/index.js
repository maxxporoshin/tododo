///<reference path="../typings/express/express.d.ts" />
///<reference path="../typings/mongoose/mongoose.d.ts" />
///<reference path="../typings/express-jwt/express-jwt.d.ts" />
///<reference path="../typings/body-parser/body-parser.d.ts" />
///<reference path="../typings/morgan/morgan.d.ts" />
///<reference path="../typings/jsonwebtoken/jsonwebtoken.d.ts" />
"use strict";
var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
app.use(express.static(__dirname + '/../bower_components'));
app.use(express.static(__dirname + '/../public'));
mongoose.connect('mongodb://localhost/test');
app.set('superSecret', 'veryverysecretvariable');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
var User = mongoose.model('User', new mongoose.Schema({
    username: String,
    password: String
}));
var Todo = mongoose.model('Todo', new mongoose.Schema({
    text: String,
    priority: Number,
    done: Boolean,
    date: Date,
    owner: String
}));
app.post('/login', function (req, res) {
    User.findOne({
        username: req.body.username
    }, function (err, user) {
        if (err)
            throw err;
        if (!user) {
            res.json({ success: false, message: 'User not found' });
        }
        else {
            if (user.password != req.body.password) {
                res.json({ success: false, message: 'Wrong password' });
            }
            else {
                var token = jwt.sign(user, app.get('superSecret'), function () {
                    return { expiresIn: 1440 };
                });
                res.json({
                    success: true,
                    message: 'your token, honej',
                    token: token
                });
            }
        }
    });
});
app.post('/register', function (req, res) {
    User.findOne({
        username: req.body.username
    }, function (err, user) {
        if (err)
            throw err;
        if (user) {
            res.json({ success: false, message: 'Username already registered' });
        }
        else {
            var user = new User({
                username: req.body.username,
                password: req.body.password
            });
            user.save(function (err) {
                if (err)
                    console.log(err);
                console.log('registered successfully');
            });
            var token = jwt.sign(user, app.get('superSecret'), function () {
                return { expiresIn: 1440 };
            });
            res.json({
                success: true,
                message: 'your token, kitty',
                token: token
            });
        }
    });
});
app.use(function (req, res, next) {
    console.log(req);
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            console.log(decoded);
            if (err) {
                return res.json({ success: false, message: 'failed to auth token' });
            }
            else {
                req.decoded = decoded;
                next();
            }
        });
    }
    else {
        return res.status(403).send({
            success: false,
            message: 'no token provided'
        });
    }
});
app.listen(3000, function () {
    console.log('we are listening on 3000');
});
