var dataPoints1 = [];
var serieNames = ["Mainmeter"];
var max = {
	val: Number.MIN_VALUE,
	arraypos: null
}
var min = {
	val: Number.MAX_VALUE,
	arraypos: null
}

function removeMarker(pos)
{
	// First found min/max it tries removing markers on objects that do not exist. Lets not.
	if (pos == null) return;

	// object is set to itself but without the marker keys
	dataPoints1[pos] = {
		x: dataPoints1[pos].x,
		y: dataPoints1[pos].y
	}
}

function pushMarkerData(timestamp, power, type, color)
{
	dataPoints1.push({
		x: timestamp,
		y: power,
		indexLabel: power+"",
		markerType: type,
		markerColor: color,
		markerSize: 12
	});
}

function updateMax(timestamp, power)
{
	// Remove marker on previous max
	removeMarker(max.arraypos);

	// Push the new data, with marker
	pushMarkerData(timestamp, power, "triangle", "red");

	// Store new max
	max.val = power;
	max.arraypos = dataPoints1.length-1;	// point to (last) pushed element (0 indexed)
}

function updateMin(timestamp, power)
{
	// Remove marker on previous min
	removeMarker(min.arraypos);

	// Push the new data, with marker
	pushMarkerData(timestamp, power, "circle", "green");

	// Store new min
	min.val = power;
	min.arraypos = dataPoints1.length-1;	// point to (last) pushed element (0 indexed)
}

function pushData(timestamp, power)
{
	dataPoints1.push({
		x: timestamp,
		y: power,
	});
}

function add0(i)
{
	// Add extra zero to clock (7:1 -> 07:01)
    if (i < 10) return ("0" + i);
    return i;
}

window.onload = function() {

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
		axisY:{
			includeZero: false
		}, 
		data: [{ 
			// dataSeries1
			type: "area",
			xValueType: "dateTime",
			showInLegend: true,
			name: "Sensor A",
			dataPoints: dataPoints1
		}],
		legend:{
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
		var power = Math.round(point[2]);

		if (power > max.val) 		updateMax(time, power);
		else if (power < min.val)	updateMin(time, power);
		else 						pushData(time, power);
	};

	// updating legend text with updated with y Value 
	chart.options.data[0].legendText = serieNames[0] + ": " + historicalData.points[historicalData.points.length-1][2];
	chart.render();


	/* SOCKET.IO METHODS
		The following code uses socket.io (websockets) to get data.
		It connects to port 8000 (where app.js is listening) and waits for messages
		labeled 'mqtt'. For each received message, it executes the given function.
	*/
	var socket = io.connect('http://localhost:8000');
	socket.on('mqtt', function (data) {
		if (data.topic == 'Testsites/MunktellSiencePark/mainmeter/meterevent')
		{
			var parsedData = JSON.parse(data.payload);
			//console.log(JSON.stringify(parsedData));

			time = new Date();
			time.setTime(parsedData.time * 1000);
			var power =  Math.round(Number(parsedData.power));

			if (power > max.val) 		updateMax(time, power);
			else if (power < min.val)	updateMin(time, power);
			else 						pushData(time, power);


			chart.options.data[0].legendText = serieNames[0] + ": " + power;
			chart.options.axisX.title = add0(time.getHours()) + ':' + add0(time.getMinutes()) + ':' + add0(time.getSeconds());
			chart.render();
		}
	});
}