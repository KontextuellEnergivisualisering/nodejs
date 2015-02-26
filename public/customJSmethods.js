var dataPoints1 = [];
var serieNames = ["Mainmeter", "Average"];
var powerIndex = -1;

var max = {
	val: Number.MIN_VALUE,
	arraypos: null
}
var min = {
	val: Number.MAX_VALUE,
	arraypos: null
}
var total = 0;
var averagePoints = [{
		x: null,
		y: null
	},
	{
		x: null,
		y: null
	}];

function removeMarker(pos)
{
	// First found min/max it tries removing markers on "prev" objects that do not exist. Lets not.
	if (pos == null)
	{
		/* As this only happens once (at the beginning), we set this row here to
			skip doing another if (that runs everytime). What the row does is set the
			left datapoint for "average-line" to left (beginning) of the chart.
			There is data in dataPoints1 because we push before calling removeMarker.
		*/
		averagePoints[0].x = dataPoints1[0].x;

		return;
	}
	// object is set to itself but without the marker keys
	//console.log("Remove marker from: " + pos);
	dataPoints1[pos] = {
		x: dataPoints1[pos].x,
		y: dataPoints1[pos].y
	}
}

function pushData(timestamp, power)
{
	dataPoints1.push({
		x: timestamp,
		y: power
	});

	updateAverage();
}

function pushMarkerData(timestamp, power, type, color)
{
	dataPoints1.push({
		x: timestamp,
		y: power,
		indexLabel: power+" W",
		markerType: type,
		markerColor: color,
		markerSize: 12
	});

	updateAverage();
}

function updateMax(timestamp, power)
{
		// Push the new data, with marker
		pushMarkerData(timestamp, power, "triangle", "red");

		// Remove marker on previous max
		removeMarker(max.arraypos);

		// Store new max
		max.val = power;
		max.arraypos = dataPoints1.length-1;	// point to (last) pushed element (0 indexed)	
}
function updateMin(timestamp, power)
{
		// Push the new data, with marker
		pushMarkerData(timestamp, power, "circle", "green");

		removeMarker(min.arraypos);

		// Store new min
		min.val = power;
		min.arraypos = dataPoints1.length-1;
}
function resetMax(){

		console.log("before_max");
		console.log(dataPoints1[max.arraypos]);
	var powerArray = dataPoints1.map(function(val){return val.y;});
	max.val = Math.max.apply(Math, powerArray);
	max.arraypos = powerArray.indexOf(max.val);
	var time = dataPoints1[max.arraypos].x;
	var power = dataPoints1[max.arraypos].y;
	
	dataPoints1[max.arraypos] = {
			x: time,
			y: power, 
			indexLabel: power+' W',
			markerType: "triangle",
			markerColor: "red",
			markerSize: 12
		};

		console.log("after_max");
		console.log(dataPoints1[max.arraypos]);
		// Push the new data, with marker
		//pushMarkerData(dataPoints1[max.arraypos].x, max.val, "triangle", "red");
}
function resetMin(){
		var powerArray = dataPoints1.map(function(val){return val.y;});
		min.val = Math.min.apply(Math, powerArray);
		min.arraypos = powerArray.indexOf(min.val);
		var time = dataPoints1[min.arraypos].x;
		var power = dataPoints1[min.arraypos].y;
		console.log("before");
		console.log(dataPoints1[min.arraypos]);
		dataPoints1[min.arraypos] = {
			x: time, 
			y: power, 
			indexLabel: power+' W',
			markerType: "circle",
			markerColor: "green",
			markerSize: 12
		};
		console.log("after");
		console.log(dataPoints1[min.arraypos]);
		//console.log("max.val: " + min.val + ", max.arraypos: " + min.arraypos);
		// Push the new data, with marker
		//pushMarkerData(dataPoints1[min.arraypos].x, min.val, "triangle", "red");
}
function updateAverage()
{
	// Add the newly pushed value to total
	total += dataPoints1[dataPoints1.length-1].y;
	//console.log('Pre: ' + total)

	// Variables in JS are floats. They start loosing accuracy if they become too big.
	if (total > 999999999999999) console.log("Loosing accuracy for 'average'");

	var average = Math.round(total/dataPoints1.length);

	// set left and right datapoint to same "height"
	averagePoints[0].y = average;
	averagePoints[1].y = average;

	// set right datapoint to as far right as possible
	averagePoints[1].x = dataPoints1[dataPoints1.length-1].x;
}

//
function adjustAverage(){
	var totalNew 	= averagePoints[0].y * dataPoints1.length;
	//console.log('A: ' + String(totalNew) + ', oldavg: ' + averagePoints[0].y);
	totalNew 	-= dataPoints1[0].y;
	total = totalNew;

	//console.log('B: ' + total + ', newavg: ' + Math.round(total / (dataPoints1.length - 1)));
	//console.log(typeof(dataPoints1[0].y));
	var average = Math.round(total / (dataPoints1.length - 1));
	averagePoints[0].y = average;
	averagePoints[1].y = average;
	averagePoints[0].x = dataPoints1[1].x;
}

function add0(i)
{
	// Add extra zero to clock (7:1 -> 07:01)
    if (i < 10) return ("0" + i);
    return i;
}

window.onload = function() {

	//Setting powerIndex, 1 for mean and 2 for real value
	if(view == "now"){
		powerIndex = 2;		
	}
	else{
		powerIndex = 1;
	}
	/* CHART
		When the site is loaded it creates the chart object using CanvasJS.
	*/	
	var chart = new CanvasJS.Chart("chartContainer",{
		zoomEnabled: true,
		title: {
			text: "Munktell Science Park Power Consumption"		
		},
		legend: {
			verticalAlign: "top",
			horizontalAlign: "center",
			fontSize: 14,
			fontWeight: "bold",
			fontFamily: "calibri",
			fontColor: "dimGrey"
		},
		axisX: {
			title: "Power consumption",
			valueFormatString: "HH:mm:ss"
		},
		axisY: {
			includeZero: false
		}, 
		data: [{ 
			// dataSeries1
			type: "area",
			xValueType: "dateTime",
			showInLegend: true,
			name: serieNames[0],
			dataPoints: dataPoints1
		},
		{ 
			// Average
			type: "line",
			xValueType: "dateTime",
			showInLegend: true,
			name: serieNames[1],
			dataPoints: averagePoints
		}],
		legend: {
			cursor:"pointer",
			itemclick : function(e) {
				if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
					e.dataSeries.visible = false;
				}
				else {
					e.dataSeries.visible = true;
				}
				chart.render();
			}
		}
	});

	/* FILLING CHART
		Because the chart is empty after it is created, we fill it with data before start
		fetching the real-time data.
	*/
	for (var i = 0; i < historicalData.points.length; i++)
	{	
		var point = historicalData.points[historicalData.points.length - 1 - i];
		var time = new Date();
		time.setTime(point[0]);
		var power = Math.round(point[powerIndex]);

		if (power > max.val) 		updateMax(time, power);
		else if (power < min.val)	updateMin(time, power);
		else 						pushData(time, power);
	};

	// updating legend text with updated with y Value 
	chart.options.data[0].legendText = serieNames[0] + ": " + power + " W";
	chart.options.data[1].legendText = serieNames[1] + ": " + averagePoints[1].y + " W";
	chart.render();


	/* SOCKET.IO METHODS
		The following code uses socket.io (websockets) to get data.
		It connects to port 8000 (where app.js is listening) and waits for messages
		labeled 'mqtt'. For each received message, it executes the given function.
	*/
	var socket = io.connect('http://localhost:8000');
	socket.on('mqtt', function (data) {
		if (data.topic == 'Testsites/MunktellSiencePark/mainmeter/meterevent' && view == "now")
		{
			//console.log("Data via socket.io and mqtt");
			var parsedData = JSON.parse(data.payload);
			time = new Date();
			time.setTime(parsedData.time * 1000);
			var power =  Math.round(Number(parsedData.power));

			if (power > max.val) 		updateMax(time, power);
			else if (power < min.val)	updateMin(time, power);
			
			else{
				pushData(time, power);
				max.arraypos -= 1;
				min.arraypos -= 1;
			}
			adjustAverage();
			dataPoints1.shift();
			
			if (min.arraypos == 0) resetMin();
			else if (max.arraypos == 0) resetMax();
			

			chart.options.data[0].legendText = serieNames[0] + ": " + power + " W";
			chart.options.data[1].legendText = serieNames[1] + ": " + averagePoints[1].y + " W";

			// Sets the clock under the X-axis
			chart.options.axisX.title = add0(time.getHours()) + ':' + add0(time.getMinutes()) + ':' + add0(time.getSeconds());
			chart.render();
		}
		else if(view != "now"){
			console.log("disconnect");
			socket.disconnect();
		}
	});
	socket.on('event', function(data){
		for(var i = 0; i < 4; i++){
			document.getElementById("card" + i).innerHTML = data.payload[i][1]
		}
	})

}