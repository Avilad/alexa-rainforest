'use strict';

// var Config = require('./config/lambda-config');

var alexa = require('alexa-app');
var moment = require('moment');

var util = require('./util.js');
var send_command = require('./send_command.js');

var app = new alexa.app();
app.launch(function (request, response) {
    response.say("Hi");
});

app.intent('ConsumptionIntent',
{
    "utterances":[
        "my{ current|}{ power| energy|} {consumption|usage|use}{ right now| at the moment| currently|}",
        "what{'s| is} my{ current|}{ power| energy|} {consumption|usage|use}{ right now| at the moment| currently|}",
        "what my{ current|}{ power| energy|} {consumption|usage|use} is{ right now| at the moment| currently|}",
        "how much {power|energy} {am i|i am| i'm}{ currently|} {using|consuming}{ right now| at the moment| currently|}"
    ]
},
(request, response) => {
    send_command('get_instantaneous_demand', 'InstantaneousDemand', reply => {
        var numericalDemand = util.parseAPINumericalValue(reply, 'Demand');
        response.say("You are currently using " + util.roundForSpeech(numericalDemand) + " kilowatts.").send();
    });

    return false;
});

// Connect to lambda

module.exports = app;
exports.handler = app.lambda();
