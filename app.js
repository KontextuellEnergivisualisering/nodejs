var influx 	= require('influx');
var express = require('express');
var socket 	= require('socket.io');
var mqtt 	= require('mqtt');
var app 	= express();
var port 	= 8000;
var client 	= influx({
	host: 'localhost',
	port: 8086,
	username: 'root',
	password: 'root',
	database: 'Munktell'
})

//build a query for influxdb that gets meterevents later than lastTime, unless it's the first query
function query(lastTime){
	if(typeof(lastTime) === 'undefined'){
		return 'select * from "Testsites/MunktellSiencePark/mainmeter/meterevent" limit 100;';
	}else{
		return 'select * from "Testsites/MunktellSiencePark/mainmeter/meterevent" ' + 'where time > \'' + lastTime + '\' limit 100;';
	}
}

app.set('view engine', 'ejs');
app.locals.pageTitle = "Energy context awareness";
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	client.query(query(), function(err, data){
		if(err!=null){
			res.send('there was an error\n');
			console.log(err);
		}

		//SOCKET.IO MQTT DATA
		socket.mqtt = mqtt.connect('mqtt://op-en.se:1883');
		socket.mqtt.subscribe('#');
		socket.mqtt.on('message', function(topic, message){
			io.sockets.emit('mqtt',{'topic':String(topic),'payload':String(message)});
		});


		//GOT A RESPONSE
		var columns = data[0].columns;
		var points = data[0].points;

		res.render('default', {
			title: 'Visualization graph',
			columns: columns,
			points: points
		});
	});
});

app.get('*', function(req, res){
	res.send('Bad route');
});

var server = app.listen(port, function(){
	console.log('listening on port ' + port);
});
var io = socket.listen(server);