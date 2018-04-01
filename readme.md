# Node Airodump Parser

This is a refactor of a project originally built by Derek Rushforth to post information about sniffed wifi networks from airodump to an API. Much of the original functionality is the same, but with more attention paid to which data being pulled out of an extremely nested XML schema and moving from a remote API to a local websockets.

## Setup

Requires `node.js` and `npm`, as well as external client libraries for `d3js` and `socket.io`

```bash
npm i
```

which will install:
```js
"dependencies": {
  "express": "^4.16.3",
  "fs": "0.0.1-security",
  "http": "0.0.0",
  "is-online": "^7.0.0",
  "node-nmap": "^4.0.0",
  "path": "^0.12.7",
  "request": "^2.85.0",
  "socket.io": "^2.0.4",
  "watch": "^1.0.2",
  "xml2js": "^0.4.19",
},
```

## Usage

Deploy this repo to a device that has `aircrack` installed and a wireless interface that has the ability to be put into monitor mode. I am using the classic awus063h with a raspberry pi. Aircrack requires `sudo` priveleges because it needs to manipulate wireless interfaces. Because of this, the server is currently configured to only serve older data.

```sh
node server.js
```

To work in real time, uncomment these lines in `server.js`:
```js
function init() {
  console.log('Attempt to execute airodump-ng');
  parseData('./data/dump-08.kismet.netxml');

  // var cmd = spawn('airodump-ng', [
  //   '-w ' + config.dumpName,
  //   config.interface
  // ], {cwd: 'data'});
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
```

For a full write up of what is happening, [check out an incredibly long blog post here](impracticalapplications.com/blog/nmapsocket.html).
