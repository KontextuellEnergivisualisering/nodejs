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

//SQL query used for getting data from InluxDB
var query = 'select * from "Testsites/MunktellSiencePark/mainmeter/meterevent" limit 100';

/* GET home page. */
router.get('/', function(req, res, next) {
  client.query(query, function(err, data){
		if(err!=null){
			res.send('there was an error\n');
			console.log(err);
		}

		//GOT A RESPONSE, these will later on be removed
		var columns = data[0].columns;
		var points = data[0].points;

		//Render visualization with data from database
		res.render('index', {
			title: 'Visualization graph',
			columns: columns,
			points: points,
			data: data[0]
		});
	});
});

module.exports = router;