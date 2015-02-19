var influx = require('./node_modules/influx');

var client = influx({
	host: 'localhost',
	port: 8086,
	username: 'root',
	password: 'root',
	database: 'Munktell'
})

client.getDatabaseNames(function(err,db_names_ary){
	if(err!=null)
		console.log('something went wrong');

	db_names_ary.forEach(function(dbName){
		console.log(dbName);
	})

})