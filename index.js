var https = require('https');
var crypto = require('crypto');
var moment = require('moment');

// Event Hubs parameters
var namespace = 'iotcloudeventhub';
var hubname ='ioteventhub';
var devicename = 'edison';

// Payload to send
var payload = '{\"sensor_id\":\"sensor_536432\", \"Temperature\":\"83.0\"}';

// Shared access key (from Event Hub configuration)
var my_key_name = 'sendRule';
var my_key = 'e7xxZP7Qw1ZSeJftrZH8RYkmEGjggynRtF57cjdIKCA=';

// Full Event Hub publisher URI
var my_uri = 'https://' + namespace + '.servicebus.windows.net' + '/' + hubname + '/publishers/' + devicename + '/messages';

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

var my_sas = create_sas_token(my_uri, my_key_name, my_key)

console.log(my_sas);

// Send the request to the Event Hub

var options = {
  hostname: namespace + '.servicebus.windows.net',
  port: 443,
  path: '/' + hubname + '/publishers/' + devicename + '/messages',
  method: 'POST',
  headers: {
    'Authorization': my_sas,
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
