var stem = 'http://api.txtlocal.com/send/';
var hash = 'e74738aafdd80b23434be0df5fc2f30967cca16f';
var username = 'aidan.j.dunphy@gmail.com';
var numbers = '447970911539';
var sender = 'Aidan Dunphy';

var xhrRequest = function (url, type) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function (e) {
    if (xhr.readyState == 4) {
      // 200 - HTTP OK
      if(xhr.status == 200) {
        
        console.log(xhr.responseText);
        var response = JSON.parse(xhr.responseText);

        // Construct meessage
        var dictionary = {
          'KEY_STATUS': xhr.status.toString(),
          'KEY_ERROR' : response.errors.message
        };
        
        if (response.errors) {
          Pebble.sendAppMessage(dictionary,
            function(e) {
              console.log('Message delivery status sent to Pebble successfully!');
            },
            function(e) {
              console.log('Error sending message delivery status status to Pebble!');
            });
          console.log('SMS gateway returned error ' + response.errors.message);
        }
        else {
          Pebble.sendAppMessage(dictionary,
            function(e) {
              console.log('Message delivery status sent to Pebble successfully!');
            },
            function(e) {
              console.log('Error sending message delivery status status to Pebble!');
            });
          console.log('HTTP request returned error code ' + xhr.status.toString());
        }  
      }
    }
  };
  xhr.open(type, url);
  xhr.send();
};

function sendText(message) {
  // Construct URL
  var encodedMessageText = encodeURIComponent(message);
  var encodedSender = encodeURIComponent(sender);
  var url = stem +
      '?username=' + username +
      '&hash=' + hash +
      '&numbers=' + numbers +
      '&message=' + encodedMessageText +
      '&sender=' + encodedSender;
  console.log ('URL is ' + url);
  xhrRequest(url, 'GET');
}

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
  function(e) {
    var messageText = e.payload["0"];
    console.log("Message is " & messageText);
    sendText(messageText);
  }                     
);

