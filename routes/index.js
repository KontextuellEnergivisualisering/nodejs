var express = require('express');		//Express libary, used as web framework
var influx 	= require('influx');		//Libary used for connection with the influx database
var strftime = require('strftime');

var router = express.Router();			
var pendingDBrequest = false; 
var io;
var priorityUpdates;

//Settings for client connection to database Munktell in InfluxDB
var client 	= influx({
	host: 'localhost',
	port: 8086,
	username: 'root',
	password: 'root',
	database: 'Munktell'
})
//Settings for client connection to database grupp5 in InfluxDB 
var eventClient = influx({
	host: 'localhost',
	port: 8086,
	username: 'root',
	password: 'root',
	database: 'grupp5'
})
//SQL query used for getting data from InluxDB
var query = {
	now: 'select * from "Testsites/MunktellSiencePark/mainmeter/meterevent" where time > now() - 30m',
	day: 'select mean(power) from "Testsites/MunktellSiencePark/mainmeter/meterevent" where time > now() - 1d group by time(1h)',
	week: 'select mean(power) from "Testsites/MunktellSiencePark/mainmeter/meterevent" where time > now() - 7d group by time(1d)'
}
//ageingFactor is used to calculate age-adjusted priorities
//A priority has a linear decline per minute in its priority.
//The ageing factor stands for the number of points per minute lost.
var ageingFactors = {
	now: 0.1, 			//one point lost per 10m
	day: 0.00138889, 	//one point lost per 12h
	week: 0.00023148 	//one point lost per 3d
}

module.exports = function(ioObj){
	io = ioObj;

	//Redirect to realtime view
	router.get('/', function(req, res) {
	  res.redirect('/views/now');
	});

	/* GET page for different chartTypes. */
	router.get('/views/:chartType?', function(req, res) {

		//check what resolution is shown for the graph
	  	var chartType 	= req.params.chartType || 'now';
	  	var dbPowerCol 	= chartType == 'now' ? 'power' : 'mean';

		if(chartType !== 'now')
			clearInterval(priorityUpdates)

	  	//Fetch power data from influxDB
	  	client.query(query[chartType], function(err, powerData){
			if(err!=null){
				res.send('there was an error\n');
				console.log(err);
			};

			//Fetch event data from influxDB
			//TODO: limit events fetched
			eventClient.query('select * from "events" limit 100', function(err, eventData){
				if(err!=null){
					res.send('there was an error\n');
					console.log(err);
				}

				if(chartType == 'now')
					priorityUpdates = setInterval(function(){updatePriorityCards(chartType)}, 10000);

				//Render visualization with data from database
				res.render('index', {
					data: timeAndPower(powerData[0], dbPowerCol),
					view: chartType,
					priorityData: prioritizedData(eventData[0], chartType)
				});
			});
		});
	});
		
	return {router: router, eventClient: eventClient};
}

//TODO: emit only the 4 highest prioritized
//Fetches priority events from influxDB and emits them age-weighted 
//priority to the socket as an 'event' message.
function updatePriorityCards(chartType){
	if(pendingDBrequest)
		return;

	pendingDBrequest = true;
	eventClient.query('select * from "events" limit 100', function(err, data){
		pendingDBrequest = false;

		if(err!=null){
			//TODO: Improve this error handling
			console.log('there was an error');
		}else{
			io.sockets.emit('event',{'topic':'testEvent','payload':prioritizedData(data[0], chartType)});	
		}		
	});
}

//Sort datapoints on the age-adjusted prioritization.
function prioritizedData(eventData, chartType){
	var ageFactor 	= ageingFactors[chartType];
	var events 		= timeTypeAndPriorityForEvents(eventData, ageFactor);
	
	//Sort events on ascending aged prio order
	events.sort(function(a,b){
		return a.ageAdjustedPrio - b.ageAdjustedPrio;
	});

	return events;
}

//FOR PRIORITY EVENTS
//influxDB data does is not sent with consistent column indices (except for sequence no and time).
//Check which column correspond to event type and priority, and use these indices when extracting data.	
function timeTypeAndPriorityForEvents(influxData, ageFactor){
	var timeIndex 	= [0];
	var sequenceIndex = [1];
	var typeIndex 	= influxData.columns.indexOf('id');
	var prioIndex 	= influxData.columns.indexOf('priority');
	var valueIndex	= influxData.columns.indexOf('value');
	var date 		= new Date()

	return influxData.points.map(function(point){
		var eventDate 	= new Date()
		eventDate.setTime(point[timeIndex]) 
		minuteDiff 		= Math.floor(((date - eventDate) / 1000) / 60); //date diff is in ms, convert to min.

		var roundedValue = Math.round(point[valueIndex]);

		var x = {
			date: strftime('%F', eventDate),
			time: strftime('%T', eventDate), 
			type: point[typeIndex], 
			value: roundedValue,
			sequenceNo: point[sequenceIndex] 
		};
		return x;
	});
}

//FOR POWER CONSUMPTION
//influxDB data does is not sent with consistent column indices (except for sequence no and time).
//First check which column correspond to power, and use this index when extracting data.	
function timeAndPower(influxData, colName){
	var timeIndex 	= [0];
	var powerIndex 	= influxData.columns.indexOf(colName);

	return JSON.stringify(influxData.points.map(function(point){
		var x = {time: point[timeIndex], power: point[powerIndex]};
		return x;
	}));
}