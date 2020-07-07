var assert = require("assert");

module.exports = {
    isObject: isObject,
    isArrayOrObject: isArrayOrObject,
    match: match,
    deepEqual: deepEqual,
};

function isArrayOrObject(value) {
    return Array.isArray(value) || isObject(value);
}

function isObject(value) {
    return typeof value === "object" && value !== null;
}

function match(object, matcher) {
    var matcherType = typeof matcher;
    if (matcherType === "function") {
        return matcher(object) === true;
    }

    if (matcherType === "string") {
        matcher = matcher.toLowerCase();
        var notNull = typeof object === "string" || !!object;
        return notNull && String(object).toLowerCase().indexOf(matcher) >= 0;
    }

    if (matcherType === "number") {
        return matcher === object;
    }

    if (matcherType === "boolean") {
        return matcher === object;
    }

    if (matcherType === "undefined") {
        return typeof object === "undefined";
    }

    if (matcher === null) {
        return object === null;
    }

    if (Array.isArray(object) && Array.isArray(matcher)) {
        return arrayContains(object, matcher, match);
    }

    if (isObject(matcher)) {
        if (matcher === object) {
            return true;
        }
        for (var prop in matcher) {
            if (matcher.hasOwnProperty(prop)) {
                var value = object[prop];
                if (
                    matcher[prop] === null ||
                    typeof matcher[prop] === "undefined"
                ) {
                    if (value !== matcher[prop]) {
                        return false;
                    }
                } else if (
                    typeof value === "undefined" ||
                    !match(value, matcher[prop])
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    throw new Error("Expected " + matcher + " is not an actual");
}

function arrayContains(array, subset, compare) {
    if (subset.length === 0) return true;
    for (var i = 0, l = array.length; i < l; ++i) {
        if (compare(array[i], subset[0])) {
            for (var j = 0, k = subset.length; j < k; ++j) {
                if (i + j >= l) return false;
                if (!compare(array[i + j], subset[j])) return false;
            }
            return true;
        }
    }
    return false;
}

function deepEqual(actual, expected) {
    try {
        assert.deepEqual(actual, expected);
        return true;
    } catch (error) {
        return false;
    }
}
