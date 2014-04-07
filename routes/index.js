var express = require('express');
var app = express();

app.set('view engine', 'jade');

app.get('/', function (req, res, next) {
    res.send('<h1>Hello world!</h1>');
});

module.exports = app;
