# nodejs

To use Node.js with the MQTT server for Munktell (see http://op-en.se/munktellsciencepark-mainmeter/):

1. Install node (if you have homebrew run ”homebrew install node” in terminal)
2. Connect with Putty or Meerkat via SSH to op-en.se. Login details not provided here.
3. Change directory so you are in the folder which contains ”app.js”
4. Call ”node app.js”. If it cannot find module ’socket.io’ do the following before trying again:
	3.1 Call ”npm install” (installs socket.io among others)
5. The Node.js server should now be listening on port 8000 for connections. In turn it fetches data from the MQTT server and serves it to the user via socket.io. To see the data, open a browser and go to localhost:8000.

