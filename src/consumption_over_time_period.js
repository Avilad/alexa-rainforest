var moment = require('moment-timezone');
moment.tz.setDefault('America/New_York');
var send_command = require('./send_command');
var util = require('./util');

module.exports = function (mDate, timePeriod, callback) {
    // var startTime = '0x' + (mDate.unix() - 946684800).toString(16);
    var startTime = mDate.unix() - 946684800;
    var endTime = mDate.add(1, timePeriod).unix() - 946684800;
    if (endTime > moment().unix() - 946684800) {
        endTime = moment().unix() - 946684800;
    }
    var frequency = endTime - startTime;

    send_command(
        'get_history_data',
        {
            'StartTime':('0x' + startTime.toString(16)),
            'EndTime':('0x' + endTime.toString(16)),
            'Frequency':('0x' + frequency.toString(16))
        },
        'HistoryData',
        (historyData) => {
            var totalConsumptionBefore = util.parseAPINumericalValue(historyData[0].CurrentSummation, 'SummationDelivered');
            var totalConsumptionAfter = util.parseAPINumericalValue(historyData[1].CurrentSummation, 'SummationDelivered');
            callback(totalConsumptionAfter - totalConsumptionBefore);
        });
};
