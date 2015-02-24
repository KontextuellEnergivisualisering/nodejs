var socket 	= require('socket.io');		//Socket.io used for real-time engine
var mqtt 	= require('mqtt');			//Used for subscribing to MQTT-broakers

var express = require('express')		//Express.js web-framwork
	, routes = require('./routes');		//Require routes from 


var app 	= express();
var port 	= 8000;
<<<<<<< HEAD

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
=======
var client 	= influx({
	host: 'localhost',
	port: 8086,
	username: 'root',
	password: 'root',
	database: 'Munktell'
})
var query = 'select * from "Testsites/MunktellSiencePark/mainmeter/meterevent" limit 100;';

app.set('view engine', 'ejs');
app.locals.pageTitle = "Energy context awareness";
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	client.query(query, function(err, data){
		if(err!=null){
			res.send('there was an error\n');
			console.log(err);
		}
		
		//GOT A RESPONSE
		var columns = data[0].columns;
		var points = data[0].points;

		res.render('default', {
			title: 'Visualization graph',
			columns: columns,
			points: points,
			data: JSON.stringify(data[0])
		});
	});
});



app.get('*', function(req, res){
	res.send('Bad route');
>>>>>>> bugix: socket disconnect, graph push
});

var server = app.listen(port, function(){
	console.log('listening on port ' + port);
});
var io = socket.listen(server);

io.on('connection', function(socket){
	console.log('user connected');

	//SOCKET.IO MQTT DATA
	socket.mqtt = mqtt.connect('mqtt://op-en.se:1883');
	socket.mqtt.subscribe('#');
	
	socket.mqtt.on('message', function(topic, message){
		io.sockets.emit('mqtt',{'topic':String(topic),'payload':String(message)});
	});

	socket.on('disconnect', function(){
		console.log('user disconnected');
		socket.mqtt.end()
	});

});
