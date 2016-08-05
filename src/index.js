'use strict';

// var Config = require('./config/lambda-config');

var alexa = require('alexa-app');
var moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');

var util = require('./util');
var send_command = require('./send_command');
var consumption_over_time_period = require('./consumption_over_time_period');

var app = new alexa.app();
app.launch(function (request, response) {
    response.say("Hi");
});

app.intent('InstantaneousDemandIntent',
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
        response.say("You are currently using " + util.roundToString(numericalDemand, 1) + " kilowatts.").send();
    });

    return false;
});

app.intent('ConsumptionIntent',
{
    "slots":{
        "Date":"DATE"
        // "Duration":"DURATION"
    },
    "utterances":[
        "my{ power| energy|} {consumption|usage|use}{ in| on|} {-|Date}",
        "what{'s| is} my{ power| energy|} {consumption|usage|use}{ in| on|} {-|Date}",
        "what my{ power| energy|} {consumption|usage|use} {is|was}{ in| on|} {-|Date}",
        "how much {power|energy} {i've|have i} used{ in| on|} {-|Date}"
    ]
},
(request, response) => {
    // var date, duration;
    var date;

    if ((date = request.slot('Date'))) {

        var dateParts = date.split('-').length;
        var wCount = date.split('W').length - 1;
        var mDate = moment(date);

        var dateString = "";
        var timePeriod = "";

        if (wCount == 1) { // Week
            var weeksAgo = moment.duration(moment().diff(mDate)).asWeeks();
            if (weeksAgo < 1) {
                dateString = "this week";
            } else if (weeksAgo < 2) {
                dateString = "last week";
            } else {
                dateString = mDate.subtract(1, 'day').format("[in the week of] MMMM Do YYYY");
            }
            timePeriod = 'w';
        } else if (wCount == 2) { // Weekend
            response.say("Weekends are not supported yet.");
            return true;
        } else if (dateParts == 1) { // Year
            var yearsAgo = moment.duration(moment().diff(mDate)).asYears();
            if (yearsAgo < 1) {
                dateString = "this year";
            } else if (yearsAgo < 2) {
                dateString = "last year";
            } else {
                dateString = mDate.format("[in] YYYY");
            }
            timePeriod = 'y';
        } else if (dateParts == 2) { // Month
            var monthsAgo = moment.duration(moment().diff(mDate)).asMonths();
            if (monthsAgo < 1) {
                dateString = "this month";
            } else if (monthsAgo < 2) {
                dateString = "last month";
            } else {
                dateString = mDate.format("[in] MMMM YYYY");
            }
            timePeriod = 'M';
        } else if (dateParts == 3) { // Day
            var daysAgo = moment.duration(moment().diff(mDate)).asDays();
            if (daysAgo < 1) {
                dateString = "today";
            } else if (daysAgo < 2) {
                dateString = "yesterday";
            } else {
                dateString = mDate.format("[on] MMMM Do YYYY");
            }
            timePeriod = 'd';
        }

        consumption_over_time_period(mDate, timePeriod, (consumption) => {
            response.say("You've used " + util.roundToString(consumption, 0) + " kilowatt-hours " + dateString + ".").send();
        });
        return false;

    // } else if ((duration = request.slot('Duration'))) {
    //     response.say("We have a duration! The duration is " + duration);
    //     return true;
    }

    response.say("You must specify a date or time period.");
    return true;
});

// Connect to lambda

module.exports = app;
exports.handler = app.lambda();
