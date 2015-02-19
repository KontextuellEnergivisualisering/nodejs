var influx 	= require('./node_modules/influx');
var http 	= require('http');
var port 	= 8080;
var client 	= influx({
	host: 'localhost',
	port: 8086,
	username: 'root',
	password: 'root',
	database: 'Munktell'
})

var query = 'select * from "Testsites/MunktellSiencePark/mainmeter/meterevent" limit 10;'

var server = http.createServer(function(req, res){
	if(req.method != 'GET')
		return res.end('send me a GET\n');

	res.write('querying...\n');
	client.query(query, function(err,data){
		if(err!=null){
			res.write('there was an error\n');
			console.log(err);
			return res.end();
		}
		
		//GOT A RESPONSE
		var columns = data[0].columns;
		var points = data[0].points;

		res.write('Got a response, n.o. points: ');
		res.write(points.length.toString() + '\n');
		
		res.write(columns.toString() + '\n');

		for(var i = 0; i<points.length;i++){
			res.write(points[i].toString() + '\n');	
		}
		
		res.end();
		
	})
})
server.listen(port);


