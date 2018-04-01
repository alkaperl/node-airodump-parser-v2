// server.js
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var nmap = require('node-nmap');
var scanner = require('node-wifi-scanner');
var fs = require('fs');
var watch = require('watch');
var request = require('request');
var parser = require('xml2json');
var spawn = require('child_process').spawn;
var isOnline = require('is-online');
var path = require('path');
var x2j = require( 'xml2js' );
var isEqual = require('lodash.isequal');


// var oguid = process.getuid();
// var oggid = process.getgid();
function actionFunction(data){
      console.log(data);
      console.log("Percentage complete" + scan.percentComplete());
  }

var config = {
    interface: 'wlan1',
    dumpName: 'dump',
};


function init() {
  console.log('Attempt to execute airodump-ng');
  parseData('./data/dump-08.kismet.netxml');

  // var cmd = spawn('airodump-ng', [
  //   '-w ' + config.dumpName,
  //   config.interface
  // ], {cwd: 'data'});
  //
  // //var cmd = spawn('top',['-l 0']);
  // //console.log(cmd.connected);
  //
  // cmd.stdout.on('data', function (data) {
  //   //console.log('stdout: ' + data);
  // });
  //
  // cmd.stderr.on('data', function (data) {
  //   //console.log('stderr: ' + data);
  // });
  //
  // cmd.on('close', function (code) {
  //     parseData('./data/dump-08.kismet.netxml');
  //   console.log('child process exited with code ' + code + '. Make sure your wifi device is set to monitor mode.');
  // });
  //
  // // TODO: Start this when cmd is connected instead of on a timeout
  // setTimeout(function() {startWatching();}, 10000);
}


function startWatching() {
  console.log('Watching for changes to airodump data');

  // Watch for file changes in data folder
  watch.createMonitor('./data', function (monitor) {
    monitor.on('changed', function (file, curr, prev) {
      // Filter out netxml files
      if (path.extname(file) === '.netxml') {
        parseData(file);
      }
    });
  });
}

function parseData(file) {
  console.log('Parsing data for: ' + file);

  try {
    var xml = fs.readFileSync(file);
    var p = new x2j.Parser({strict:false});

    p.parseString(xml, function( err, result ) {
        var cleanJson = result;
        postData(result);
    });

    isOnline(function(err, online) {
      if (err) throw err;

      if (online === true) {
        // Device is online
        console.log('Device is online');
        postData(data);
      } else {
      }
    });
  } catch(e) {
    console.log('There was an error parsing your xml');
    console.log(e);
  }
}

function dupeCheck(arr, prop) {
    var new_arr = [];
    var lookup = {};
    for (var i in arr) {
        lookup[arr[i][prop]] = arr[i];
    }
    for (i in lookup) {
        new_arr.push(lookup[i]);
    }
    // console.log(new_arr);
    return new_arr;
}

function postData(json) {
  try {
        io.emit('airodump', cleanData(json));
    // requestOptions.body = JSON.parse(json);
    // request(requestOptions, function(err, response, body) {
    //   if (err) throw err
    //   console.log('Response from API -------------------');
    //   console.log(body);
    // });
  } catch (e) {
    console.log('There was an error in the request to the API');
    console.log(e);
  }
}

function cleanData(data) {
    console.log("cleaning JSON");
    var cleanJson = {};
    var startTime = data["DETECTION-RUN"]["$"]["START-TIME"];
    var networkArray = data["DETECTION-RUN"]["WIRELESS-NETWORK"]

    cleanJson.name = "probe";
    cleanJson.start = startTime;
    cleanJson.children = [];
    cleanJson.probes =[];

    // iterate through scanned networks
    for (var i=0; i < networkArray.length; i++) {
        var curr = networkArray[i]; // current network
        var currCli = curr["WIRELESS-CLIENT"]; // current clients
        var rssi = curr["SNR-INFO"][0]["LAST_SIGNAL_RSSI"][0]; // current signal strength
        var packetCount = curr["PACKETS"][0]["TOTAL"][0]; // current packet count

        // HACK to fix d3 "undefined" error
        // Check if SSID and then ESSID (plain network name) exists
        if (curr["SSID"]) {
            if(curr["SSID"][0]){
                if(curr["SSID"][0]["ESSID"]) {
                    if(curr["SSID"][0]["ESSID"][0]) {
                         var essid = curr["SSID"][0]["ESSID"][0]["_"]; // current ESSID
                    }
                }
            }
        }

        var networksobj = {};
        var probeobj = {};

        if (essid) {
            networksobj.name = essid;
        }
        if (rssi) {
            networksobj.rssi = rssi;
        }

        networksobj.packetCount = packetCount;

        // If network has clients
        if (currCli) {
            networksobj.children = [];
            var cliMac = currCli[0]["CLIENT-MAC"][0]; // client MAC
            var cliMan = currCli[0]["CLIENT-MANUF"][0]; // client manufacturer
            var cliRssi = currCli[0]["SNR-INFO"][0]["LAST_SIGNAL_RSSI"][0]; // client signal strength
            var packetCount = currCli[0]["PACKETS"][0]["TOTAL"][0]; // client total packet count
            var clientobj = {}
            clientobj.name = cliMac;
            clientobj.mac = cliMac;
            clientobj.manufacturer = cliMan;
            clientobj.rssi = cliRssi;
            clientobj.packetCount = packetCount;

            networksobj.children.push(clientobj);
        }

        // If client is sending probes
        if (curr["$"]["TYPE"] === "probe") {
            // If client is broadcasting past networks
            if (curr["WIRELESS-CLIENT"]) {
                // If past networks have names
                if(curr["WIRELESS-CLIENT"][0]["SSID"][0]["SSID"]) {
                    probeobj.probes = [];
                    // Iterate through past networks
                    for (var x=0; x<curr["WIRELESS-CLIENT"][0]["SSID"].length; x++) {
                        probeobj.name = curr["BSSID"][0]; // Probe BSSID
                        probeobj.probes.push(curr["WIRELESS-CLIENT"][0]["SSID"][x]["SSID"][0]); // Probe's past networks
                    }
                    cleanJson.probes.push(probeobj);
                }

            }
        }

        cleanJson.children.push(networksobj);
        cleanJson.children = dupeCheck(cleanJson.children, 'name'); // de-dupe by network name
        cleanJson.probes = dupeCheck(cleanJson.probes, 'name'); // de-dupe by BSSID
        cleanJson.total = cleanJson.children.length;
        cleanJson.unassociated = cleanJson.probes.length;
    }
    return cleanJson;
    // postData(cleanJson);
}

app.use("/", express.static(__dirname + '/public/'));

// socket client connect
io.on('connection', function(client) {
    console.log('Client connected...');

    io.emit('clientCounter', io.engine.clientsCount,'utf-8');

    init();

    client.on('scan', function(data) {
	  scanCount++;

        var scan = new nmap.OsAndPortScan("192.168.1.100-200");
        console.log("start scan");

        scan.on('complete', function(data){
            // console.log(data);
            console.log("total scan time" + scan.scanTime);
            //send a message to ALL connected clients
             io.emit('scanUpdate', data, 'utf-8');
        });
        scan.on('error', function(error){
          console.log(error);
        });

        scan.startScan(); // run nmap scan
    });


    client.on('dump',function(client){
        init();
    });

    client.on('quickscan', function(client){
        var scan = new nmap.QuickScan("192.168.1.100-200");
        console.log("start scan");

        scan.on('complete', function(data){
            // console.log(data);
            console.log("total scan time" + scan.scanTime);
            //send a message to ALL connected clients
             io.emit('scanUpdate', data, 'utf-8');
        });
        scan.on('error', function(error){
          console.log(error);
        });

        scan.startScan(); // run nmap scan
    });
});


//start our web server and socket.io server listening
server.listen(3000, function(){
    console.log('listening on *:3000');
    init();
});
