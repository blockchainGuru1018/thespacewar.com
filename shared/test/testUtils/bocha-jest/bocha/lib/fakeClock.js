var sinon = require("sinon");

module.exports = function (timestamp, configurationObjectOrString) {
    if (typeof timestamp === "undefined") {
        timestamp = 0;
    }
    let timeArgument =
        typeof timestamp === "number" ? timestamp : Date.parse(timestamp);
    if (configurationObjectOrString) {
        return sinon.useFakeTimers(timeArgument, configurationObjectOrString);
    }
    return sinon.useFakeTimers(timeArgument);
};
