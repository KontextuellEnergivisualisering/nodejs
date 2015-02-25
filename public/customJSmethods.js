var dataPoints1 = [];

window.onload = function() {

	//METHODS FOR CHART
	// dataPoints
	
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
				title: "Power consumption"
			},
			axisY:{
				includeZero: false
			}, 
			data: [{ 
				// dataSeries1
				type: "line",
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

		for (var i = 0; i < historicalData.points.length; i++) {
			
			var point = historicalData.points[historicalData.points.length - 1 - i];

			var time = new Date()
			time.setTime(point[0]);
			
			// pushing the new values
			dataPoints1.push({
				x: time,
				y: Math.round(point[2])
			});

		};

		// updating legend text with  updated with y Value 
		chart.options.data[0].legendText = "Sensor A: " + historicalData.points[historicalData.points.length-1][2];
		chart.render();

		//SOCKET.IO METHODS
		var socket = io.connect('http://localhost:8000');
		socket.on('mqtt', function (data) {
			if(data.topic == 'Testsites/MunktellSiencePark/mainmeter/meterevent'){

				var parsedData = JSON.parse(data.payload);
				//console.log(JSON.stringify(parsedData));

				time = new Date()
				time.setTime(parsedData.time * 1000);
				var yVal =  Math.round(Number(parsedData.power));

				console.log('rec');

				dataPoints1.push({
					x: time.getTime(),
					y: yVal
				});


				chart.options.data[0].legendText = "Sensor A: " + yVal;

				chart.render();
			}
		});
}