var http = require('http');
var express = require('express');

module.exports = function (options) {

    options = options || {};

    var app = express();
    var verbose = options.verbose;

    verbose && console.log('Starting Express server...');

    // settings

    // map .renderFile to ".html" files
    app.engine('html', require('ejs').renderFile);

    app.set('port', process.env.PORT || 3000);
    app.enable('trust proxy');

    // make ".html" the default
    app.set('view engine', 'html');

    // set views for error and 404 pages
    app.set('views', __dirname + '/views');

    app.use(express.favicon(__dirname + '/public/favicon.png'));

    // log
    if (app.get('env') === 'development') {
        app.use(express.logger('dev'));
    }

    // enable http compression
    app.use(express.compress());

    // serve static files
    app.use(express.static(__dirname + '/public'));

    // session support
    app.use(express.cookieParser(options.sessionSecret || 'secret'));
    app.use(express.session());

    // support _method field in forms
    app.use(express.methodOverride());

    // load routes
    require('./routes')(app, { verbose: verbose });

    // assume "not found" in the error msgs
    // is a 404. this is somewhat silly, but
    // valid, you can do whatever you like, set
    // properties, use instanceof etc.
    app.use(function(err, req, res, next) {
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

    return app;
};
