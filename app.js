var influx 	= require('influx');
var express = require('express');
var app 	= express();
var port 	= 8000;
var client 	= influx({
	host: 'localhost',
	port: 8086,
	username: 'root',
	password: 'root',
	database: 'Munktell'
})
var query = 'select * from "Testsites/MunktellSiencePark/mainmeter/meterevent" limit 10;'

app.set('view engine', 'ejs');
app.locals.pageTitle = "Energy context awareness"; 

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