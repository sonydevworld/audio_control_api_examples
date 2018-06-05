#!/usr/bin/env node
var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();
function switchNotifications(id,disable,enable){
  return {
    "method": "switchNotifications",
    "id": id,
    "params": [{
      "disabled": disable,
      "enabled": enable
    }],
    "version": "1.0"
  }
}
client.on('connectFailed', function(error) {
  console.log('Connect Error: ' + error.toString());
});
client.on('connect', function(connection) {
  console.log('WebSocket Client Connected');
  connection.on('error', function(error) {
    console.log("Connection Error: " + error.toString());
  });
  connection.on('close', function() {
    console.log('WebSocket Connection Closed');
  });
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      var msg = JSON.parse(message.utf8Data);
      // Check whether the message ID equals '1', to avoid creating a loop.
      if (msg.id == 1){
        let all_notifications = msg.result[0].disabled.concat(msg.result[0].enabled);
        var enable = [];
        var disable = [];
        // Enable only the 'notifyPlayingContentInfo' notifications.
        all_notifications.forEach(
          item => item.name == "notifyPlayingContentInfo"
          ? enable.push(item) : disable.push(item) );
        // Use a different ID than '1', to avoid creating a loop.
        connection.sendUTF(JSON.stringify(switchNotifications(2,disable,enable)));
      } else {
        console.log("Received: '" + message.utf8Data + "'");
      }
    }
  });
  function subscribe() {
    if (connection.connected) {
      // To get current notification settings, send an empty 'switchNotifications'
      // message with an ID of '1'.
      connection.sendUTF(JSON.stringify(switchNotifications(1,[],[])));
    };
  }
  subscribe();
});
client.connect('ws://192.168.1.119:10000/sony/avContent');
