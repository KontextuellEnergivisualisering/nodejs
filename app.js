var socket 	= require('socket.io');		//Socket.io used for real-time engine
var mqtt 	= require('mqtt');			//Used for subscribing to MQTT-broakers

var express = require('express');		//Express.js web-framwork 
var app 	= express();
var port 	= 8000;						//Port used for connection to web server

//Makes server listen to defined port
var server = app.listen(port, function(){
	console.log('listening on port ' + port);
});

//Require routes. Note that routes need io object
var io 			= socket.listen(server);
var routeData 	= require('./routes/index')(io);		//Require routes from

//Settings used for express web framwork
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');	
app.locals.pageTitle = "Energy context awareness";
app.use(express.static(__dirname + '/public'));
//app.use(app.routes);

//Routing
app.use('/', routeData.router);

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

//Socket.io handler
io.on('connection', function(socket){
	console.log('user connected');

	//SOCKET.IO MQTT DATA
	socket.mqtt = mqtt.connect('mqtt://op-en.se:1883');
	socket.mqtt.subscribe('#');
	
	//Redirect mqtt messages via socket.io (mqtt topic)
	socket.mqtt.on('message', function(topic, message){
		io.sockets.emit('mqtt',{'topic':String(topic),'payload':String(message)});
	});

	socket.on('disconnect', function(){
		console.log('user disconnected');
		socket.mqtt.end()
	});
});