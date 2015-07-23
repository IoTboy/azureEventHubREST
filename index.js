var https = require('https');
var crypto = require('crypto');
var moment = require('moment');

// Event Hubs parameters
var namespace = 'iotcloudeventhub';
var hubname ='ioteventhub';
var devicename = 'edison';

// Payload to send
var payload = '{\"SensorID\":\"sensor_34545\", \"Temperature\":\"37.0\"}';

// Shared access key (from Event Hub configuration)
var key_name = 'sendRule';
var key = 'e7xxZP7Qw1ZSeJftrZH8RYkmEGjggynRtF57cjdIKCA=';


// Full Event Hub publisher URI
var uri = 'https://' + namespace + '.servicebus.windows.net' + '/' + hubname + '/publishers/' + devicename + '/messages';

// Create a SAS token
// See http://msdn.microsoft.com/library/azure/dn170477.aspx

function create_sas_token(uri, key_name, key)
{
    // Token expires in one hour
    var expiry = moment().add(1, 'hours').unix();

    var string_to_sign = encodeURIComponent(uri) + '\n' + expiry;
    var hmac = crypto.createHmac('sha256', key);
    hmac.update(string_to_sign);
    var signature = hmac.digest('base64');
    var token = 'SharedAccessSignature sr=' + encodeURIComponent(uri) + '&sig=' + encodeURIComponent(signature) + '&se=' + expiry + '&skn=' + key_name;

    return token;
}

var sas = create_sas_token(uri, key_name, key)

console.log(sas);

// Send the request to the Event Hub

var options = {
  hostname: namespace + '.servicebus.windows.net',
  port: 443,
  path: '/' + hubname + '/publishers/' + devicename + '/messages',
  method: 'POST',
  headers: {
    'Authorization': sas,
    'Content-Length': payload.length,
    'Content-Type': 'application/atom+xml;type=entry;charset=utf-8'
  }
};

var req = https.request(options, function(res) {
  console.log("statusCode: ", res.statusCode);
  console.log("headers: ", res.headers);

  res.on('data', function(d) {
    process.stdout.write(d);
  });
});

req.on('error', function(e) {
  console.error(e);
});

req.on('success', function(e) {
  console.log(e);
});

req.write(payload);
req.end();
