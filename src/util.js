exports.roundForSpeech = function(number) {
    return (Math.round(number * 10) / 10).toFixed(1);
}
exports.parseAPINumericalValue = function(object, significandPropertyName) {
    return parseInt(object[significandPropertyName]) * parseInt(object.Multiplier) / parseInt(object.Divisor);
}
