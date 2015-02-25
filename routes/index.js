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
var query = 'select * from "Testsites/MunktellSiencePark/mainmeter/meterevent" limit 100';

//time sequence no, value, id, priority 

/* GET home page. */
router.get('/', function(req, res) {
  client.query(query, function(err, data){
		if(err!=null){
			res.send('there was an error\n');
			console.log(err);
		}
		//Render visualization with data from database
		res.render('index', {
			data: JSON.stringify(data[0])
		});
	});
});

module.exports = {router: router, eventClient: eventClient};