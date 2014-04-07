var http = require('http');
var path = require('path');
var express = require('express');
var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'jade');
app.enable('trust proxy');

// logging
if (app.get('env') === 'development') {
    app.use(express.logger('dev'));
}

// load routing modules
app.use(require('./routes'));

// serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// assume "not found" in the error msgs
// is a 404. this is somewhat silly, but
// valid, you can do whatever you like, set
// properties, use instanceof etc.
app.use(function (err, req, res, next) {
    // treat as 404
    if (~err.message.indexOf('not found')) return next();

    // log it
    console.error(err.stack);

    // error page
    return res.status(500).render('5xx');
});

// assume 404 since no middleware responded
app.use(function (req, res) {
    res.status(404).render('404', { url: req.originalUrl });
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
