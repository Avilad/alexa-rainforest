var request = require('request');
var creds = require('./creds');

module.exports = function (command, params, notification, callback) {

    if (arguments.length == 2) {
        callback = params;
        params = null;
    } else if (arguments.length == 3) {
        callback = notification;
        if (typeof params == 'string') {
            notification = params;
            params = null;
        } else {
            notification = null;
        }
    }

    var postData =
    '<Command>' +
    '<Name>' + command + '</Name>';

    for (key in params) {
        postData += '<' + key + '>' + params[key] + '</' + key + '>';
    }
    postData +=
    '<Format>JSON</Format>' +
    '</Command>';

    var options = {

        method: 'POST',
        url: 'https://rainforestcloud.com:9445/cgi-bin/post_manager',
        headers: {
            'User': creds.usr,
            'Password': creds.pwd,
            'Cloud-ID': creds.cid,
            'Content-Length': Buffer.byteLength(postData)
        },
        body: postData
    };

    request(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            if (body.charAt(0) != '{') { // Bad JSON String
                body = '{' + body + '}';
            }
            if (notification)
                callback(JSON.parse(body)[notification]);
            else
                callback(JSON.parse(body));
        } else {
            console.log("An error occurred:\n" + error);
        }
    });

};
