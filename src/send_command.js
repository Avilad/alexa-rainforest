var request = require('request');
var creds = require('./creds');

module.exports = function (command, notification, callback) {

    if (callback == null) {
        callback = notification;
        notification = null;
    }

    var postData =
    '<Command>' +
    '<Name>' + command + '</Name>' +
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
            if (notification)
                callback(JSON.parse(body)[notification]);
            else
                callback(JSON.parse(body));
        } else {
            console.log("An error occurred:\n" + error);
        }
    });

};
