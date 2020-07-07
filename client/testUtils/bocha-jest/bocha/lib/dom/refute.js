var _assert = require("assert");
var refute = require("../refute.js");
var domUtils = require("./domUtils.js");

module.exports = refute;

refute.elementCount = function (selector, expected, message) {
    var elementCount = domUtils.getElementCount(selector);
    if (elementCount === expected) {
        var details =
            'REFUTE elementCount "' + selector + '" count=' + elementCount;
        _assert.fail(
            elementCount,
            expected,
            message || details,
            "elementCount"
        );
    }
};

refute.elementHasClass = function (selector, expected, message) {
    var elementClasses = domUtils.getElementClasses(selector);
    var hasClass = elementClasses.includes(expected);
    if (hasClass) {
        var details =
            'REFUTE elementHasClass "' +
            selector +
            '" actual=' +
            elementClasses.join(",") +
            " unexpected=" +
            expected;
        _assert.fail(selector, expected, message || details, "hasClass");
    }
};

refute.elementIsChecked = function (selector, message) {
    var element = domUtils.getUniqueElement(selector);
    var actualValue = element.checked;
    if (actualValue) {
        var details = 'REFUTE elementIsChecked "' + selector + '" was checked';
        _assert.fail(
            actualValue,
            false,
            message || details,
            "elementIsChecked"
        );
    }
};
