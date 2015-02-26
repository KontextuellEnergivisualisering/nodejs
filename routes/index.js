var express = require('express');
var influx 	= require('influx');		//Libary used for connection with the influx database
var router = express.Router();

var client 	= influx({
	host: 'localhost',
	port: 8086,
	username: 'root',
	password: 'root',
	database: 'Munktell'
})

var eventClient = influx({
	host: 'localhost',
	port: 8086,
	username: 'root',
	password: 'root',
	database: 'grupp5'
})

//SQL query used for getting data from InluxDB
var query_now = 'select * from "Testsites/MunktellSiencePark/mainmeter/meterevent" limit 10';
var query_day = 'select mean(power) from "Testsites/MunktellSiencePark/mainmeter/meterevent" where time > now() - 1d group by time(1h)';
var query_week = 'select mean(power) from "Testsites/MunktellSiencePark/mainmeter/meterevent" where time > now() - 7d group by time(1d)';

//time sequence no, value, id, priority 

/* GET home page. */
router.get('/', function(req, res) {
  client.query(query_now, function(err, data){
		if(err!=null){
			res.send('there was an error\n');
			console.log(err);
		}
		//Render visualization with data from database
		res.render('index', {
			data: JSON.stringify(data[0]),
			view: "now"
		});
	});
});
router.get('/day_view', function(req, res) {

  client.query(query_day, function(err, data){
		if(err!=null){
			res.send('there was an error\n');
			console.log(err);
		}
		//Render visualization with data from database
		res.render('index', {
			data: JSON.stringify(data[0]),
			view: "day"
		});
	});
});

router.get('/week_view', function(req, res) {

  client.query(query_week, function(err, data){
		if(err!=null){
			res.send('there was an error\n');
			console.log(err);
		}
		//Render visualization with data from database
		res.render('index', {
			data: JSON.stringify(data[0]),
			view: "week"
		});
	});
});

module.exports = {router: router, eventClient: eventClient};
