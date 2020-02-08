var Sizzle = require('sizzle');

module.exports = {
    getUniqueElement: getUniqueElement,
    getElementCount: getElementCount,
    getElementClasses: getElementClasses,
    getElementText: getElementText,
    getElementExactText: getElementExactText,
    getElementHtml: getElementHtml
};

function getUniqueElement(selectorOrElement) {
    if (typeof selectorOrElement === 'string') {
        var elements = Sizzle(selectorOrElement);
        var count = elements.length;
        if (count !== 1) {
            var errorMessage = 'Exactly one element must match selector "' + selectorOrElement + '" but found ' + count;
            throw new Error(errorMessage);
        }
        return elements[0];
    }
    if (selectorOrElement instanceof HTMLElement) {
        return selectorOrElement;
    }
    throw new Error('Illegal argument: Must be selector or HTMLElement');
}

function getElementCount(selector) {
    return Sizzle(selector).length;
}

function getElementClasses(selector) {
    var element = getUniqueElement(selector);
    return Array.from(element.classList);
}

function getElementText(selector) {
    var element = getUniqueElement(selector);
    return element.textContent.replace(/\s+/g,' ');
}

function getElementExactText(selector) {
    var element = getUniqueElement(selector);
    return element.textContent;
}

function getElementHtml(selector) {
    var element = getUniqueElement(selector);
    return element.innerHTML;
}