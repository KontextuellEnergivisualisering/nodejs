window.onload = function() {

	var socket = io.connect('http://localhost:8000');
	socket.on('mqtt', function (data) {
		if(data.topic == 'Testsites/MunktellSiencePark/mainmeter/meterevent'){
			var parsedData = JSON.parse(data.payload);
			console.log(parsedData.power);
		}
	});

	console.log(historicalData);
	console.log(historicalData.points[0]);

	// dataPoints
	var dataPoints1 = [];

	var chart = new CanvasJS.Chart("chartContainer",{
		zoomEnabled: true,
		title: {
			text: "Munktell Science Park Energy Usage"		
		},
		toolTip: {
			shared: true	
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
				title: "Update frequency: 3s"
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

		var updateInterval = 3000;
		
		for (var i = 0; i < historicalData.points.length; i++) {
			
			var point = historicalData.points[i];

			var time = new Date()
			time.setUTCMilliseconds(point[0]);

			// pushing the new values
			dataPoints1.push({
				x: time.getTime(),
				y: point[2]
			});

		};


		// updating legend text with  updated with y Value 
		chart.options.data[0].legendText = "Sensor A: " + historicalData.points[historicalData.points.length-1][2];
		
		chart.render();

		
		// generates first set of dataPoints 
		//updateChart(3000);	

		// update chart after specified interval
		//setInterval(function(){updateChart()}, updateInterval);
}