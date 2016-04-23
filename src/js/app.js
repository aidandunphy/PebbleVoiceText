var numbers = '447970911539';
var options = JSON.parse(localStorage.getItem('options')) || { stem: "", username: "", hash: "", sender: "" };
console.log('Starting with options: ' + JSON.stringify(options));

function jsonToQueryString(json) {
    return '?' + 
        Object.keys(json).map(function(key) {
            return encodeURIComponent(key) + '=' +
                encodeURIComponent(json[key]);
        }).join('&');
}

Pebble.addEventListener("showConfiguration", function() {
  console.log("showing configuration" + jsonToQueryString(options));
  Pebble.openURL('http://aidandunphy.github.io/voicetextconfig.html?'+ jsonToQueryString(options));
});

Pebble.addEventListener("webviewclosed", function(e) {
  console.log("configuration closed");
  //Using primitive JSON validity and non-empty check
  if (e.response.charAt(0) == "{" && e.response.slice(-1) == "}" && e.response.length > 5) {
    options = JSON.parse(decodeURIComponent(e.response));
    console.log("Options = " + JSON.stringify(options));
    localStorage.setItem('options', JSON.stringify(options));
    console.log('saved: ' + JSON.stringify(options));
  } else {
    console.log("Cancelled");
  }
});

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
  var encodedSender = encodeURIComponent(options.sender);
  var url = options.stem +
      '?username=' + options.username +
      '&hash=' + options.hash +
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

