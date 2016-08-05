exports.roundToString = function(number, decimals) {
    return (Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals)).toFixed(decimals < 0 ? 0 : decimals);
}
exports.parseAPINumericalValue = function(object, significandPropertyName) {
    return parseInt(object[significandPropertyName]) * parseInt(object.Multiplier) / parseInt(object.Divisor);
}
