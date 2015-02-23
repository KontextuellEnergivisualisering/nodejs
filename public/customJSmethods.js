window.onload = function() {

	var socket = io.connect('http://localhost:8000');
	socket.on('mqtt', function (data) {
		if(data.topic == 'Testsites/MunktellSiencePark/mainmeter/meterevent'){
			var parsedData = JSON.parse(data.payload);
			console.log(parsedData.power);
		}
	});

	console.log(historicalData);

	// dataPoints
	var dataPoints1 = [];
	var dataPoints2 = [];

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
			},
			{				
				// dataSeries2
				type: "line",
				xValueType: "dateTime",
				showInLegend: true,
				name: "Sensor B" ,
				dataPoints: dataPoints2
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
		// initial value
		var yValue1 = 640; 
		var yValue2 = 604;

		var time = new Date;
		time.setHours(9);
		time.setMinutes(30);
		time.setSeconds(00);
		time.setMilliseconds(00);
		// starting at 9.30 am

		var updateChart = function (count) {
			count = count || 1;

			// count is number of times loop runs to generate random dataPoints. 

			for (var i = 0; i < count; i++) {
				
				// add interval duration to time				
				time.setTime(time.getTime()+ updateInterval);


				// generating random values
				var deltaY1 = .5 + Math.random() *(-.5-.5);
				var deltaY2 = .5 + Math.random() *(-.5-.5);

				// adding random value and rounding it to two digits. 
				yValue1 = Math.round((yValue1 + deltaY1)*100)/100;
				yValue2 = Math.round((yValue2 + deltaY2)*100)/100;
				
				// pushing the new values
				dataPoints1.push({
					x: time.getTime(),
					y: yValue1
				});
				dataPoints2.push({
					x: time.getTime(),
					y: yValue2
				});


			};

			// updating legend text with  updated with y Value 
			chart.options.data[0].legendText = "Sensor A: " + yValue1;
			chart.options.data[1].legendText = "Sensor B: " + yValue2; 

			chart.render();

		};

		// generates first set of dataPoints 
		updateChart(3000);	

		// update chart after specified interval
		setInterval(function(){updateChart()}, updateInterval);
}