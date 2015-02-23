window.onload = function() {
 
    var socket = io.connect('http://localhost:8000');

    socket.on('mqtt', function (data) {
        if(data.topic == 'Testsites/MunktellSiencePark/mainmeter/meterevent'){
        	var parsedData = JSON.parse(data.payload);
        	console.log(parsedData.power);
        }
    });
}