var socket 	= require('socket.io');		//Socket.io used for real-time engine
var mqtt 	= require('mqtt');			//Used for subscribing to MQTT-broakers

var express = require('express')		//Express.js web-framwork
	, routes = require('./routes');		//Require routes from 


var app 	= express();
var port 	= 8000;

app.configure(function(){
	app.set('views', __dirname + '/views');
  	app.set('view engine', 'ejs');	
	app.locals.pageTitle = "Energy context awareness";
	app.use(express.static(__dirname + '/public'));
	app.use(app.router);
});

//Routing
app.use('/', routes.index);

/******************/
// error handlers //
/******************/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(port, function(){
	console.log('listening on port ' + port);
});
var io = socket.listen(server);