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
var expressJWT = require('express-jwt');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
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
    priorities: Object,
    date: Date,
    done: Boolean,
    owner: String
}));
app.get('/user', expressJWT({ secret: app.get('superSecret') }), function (req, res) {
    if (req.user) {
        res.json(req.user);
    }
});
app.post('/login', function (req, res) {
    if (!req.body.username) {
        res.json({ success: false, message: 'Enter username' });
    }
    else if (!req.body.password) {
        res.json({ success: false, message: 'Enter password' });
    }
    else {
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
                        return { expiresIn: 144000 };
                    });
                    res.json({ success: true, token: token });
                }
            }
        });
    }
});
app.post('/register', function (req, res) {
    if (!req.body.username) {
        res.json({ success: false, message: 'Enter username' });
    }
    else if (!req.body.password) {
        res.json({ success: false, message: 'Enter password' });
    }
    else {
        User.findOne({
            username: req.body.username
        }, function (err, user) {
            if (err)
                throw err;
            if (user) {
                res.json({ success: false, message: 'Username already registered' });
            }
            else if (req.body.password == req.body.password_repeat) {
                var user = new User({
                    username: req.body.username,
                    password: req.body.password
                });
                user.save(function (err) {
                    if (err)
                        console.log(err);
                });
                var token = jwt.sign(user, app.get('superSecret'), function () {
                    return { expiresIn: 144000 };
                });
                res.json({ success: true, token: token });
            }
            else {
                res.json({ success: false, message: 'Passwords must macth' });
            }
        });
    }
});
app.post('/addtodo', expressJWT({ secret: app.get('superSecret') }), function (req, res) {
    User.findOne({ username: req.user._doc.username }, function (err, user) {
        if (err)
            throw err;
        var todo = new Todo({
            text: req.body.todo.text,
            priorities: req.body.todo.priorities,
            date: req.body.todo.date,
            done: req.body.todo.done,
            owner: user.username
        });
        todo.save(function (err) {
            if (err)
                console.log(err);
        });
        res.send({});
    });
});
app.post('/updatetodo', expressJWT({ secret: app.get('superSecret') }), function (req, res) {
    Todo.findById(req.body.todo._id, function (err, todo) {
        if (err)
            throw err;
        todo.text = req.body.todo.text;
        todo.priorities = req.body.todo.priorities;
        todo.date = req.body.todo.date;
        todo.done = req.body.todo.done;
        todo.save(function (err) {
            if (err)
                console.log(err);
        });
        res.send({});
    });
});
app.post('/deletetodo', expressJWT({ secret: app.get('superSecret') }), function (req, res) {
    Todo.findById(req.body.todo._id, function (err, todo) {
        if (err)
            throw err;
        todo.remove();
        res.send({});
    });
});
app.get('/loadtodos', expressJWT({ secret: app.get('superSecret') }), function (req, res) {
    Todo.find({ owner: req.user._doc.username }, function (err, todos) {
        if (err)
            throw err;
        res.json({ todos: todos });
    });
});
app.use(express.static(__dirname + '/../public'));
app.use(express.static(__dirname + '/../bower_components'));
app.listen(3000, function () {
    console.log('we are listening on 3000');
});
