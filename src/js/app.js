var numbers = '447970911539';
var options = JSON.parse(localStorage.getItem('options')) || { stem: "", username: "", hash: "", sender: "" };

function jsonToQueryString(json) {
    return '?' + 
        Object.keys(json).map(function(key) {
            return encodeURIComponent(key) + '=' +
                encodeURIComponent(json[key]);
        }).join('&');
}

Pebble.addEventListener("showConfiguration", function() {
  Pebble.openURL('http://aidandunphy.github.io/voicetextconfig.html?'+ jsonToQueryString(options));
});

Pebble.addEventListener("webviewclosed", function(e) {
  //Using primitive JSON validity and non-empty check
  if (e.response.charAt(0) == "{" && e.response.slice(-1) == "}" && e.response.length > 5) {
    options = JSON.parse(decodeURIComponent(e.response));
    localStorage.setItem('options', JSON.stringify(options));
  } else {
    console.log("Configuration page cancelled");
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
          'KEY_STATUS': response.status,
          'KEY_ERROR' : ""
        };
        
        if (response.errors) {
          var error_message = JSON.parse(response.errors).message;
          dictionary.KEY_ERROR = error_message;
          Pebble.sendAppMessage(dictionary,
            function(e) {
              console.log('Message delivery status sent to Pebble successfully!');
            },
            function(e) {
              console.log('Error sending message delivery status status to Pebble!');
            });
        }
        else {
          Pebble.sendAppMessage(dictionary,
            function(e) {
              console.log('Message delivery status sent to Pebble successfully!');
            },
            function(e) {
              console.log('Error sending message delivery status status to Pebble!');
            });
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
  xhrRequest(url, 'GET');
}

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
  function(e) {
    var messageText = e.payload["0"];
    sendText(messageText);
  }                     
);

