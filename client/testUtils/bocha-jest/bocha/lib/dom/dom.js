var getUniqueElement = require("./domUtils.js").getUniqueElement;
var timeout = require("../timeoutPromise.js");

module.exports = {
  click: click,
  clickAndTick: clickAndTick,
  setValue: setValue,
  setValueAndTick: setValueAndTick,
  focusAndTick: focusAndTick,
  blurAndTick: blurAndTick,
  keydownAndTick: keydownAndTick,
  keydownWithAndTickModifiers: keydownAndTickWithModifiers,
  mouseupAndTick: mouseupAndTick,
  pasteIntoInputAndTick: pasteIntoInputAndTick,
};

function click(selectorOrElement) {
  var element = getUniqueElement(selectorOrElement);
  element.click();
}

function setValue(selectorOrElement, value) {
  var element = getUniqueElement(selectorOrElement);
  element.value = value;
  var tagName = element.tagName;
  var isInputOrTextarea = tagName === "INPUT" || tagName === "TEXTAREA";
  var eventType = isInputOrTextarea ? "input" : "change";
  var event = document.createEvent("HTMLEvents");
  event.initEvent(eventType, false, true);
  element.dispatchEvent(event);
}

function clickAndTick(selectorOrElement, clock, time) {
  click(selectorOrElement);
  return timeout(clock, time);
}

function setValueAndTick(selectorOrElement, value, clock, time) {
  setValue(selectorOrElement, value);
  return timeout(clock, time);
}

// Focus will only work if the testDom is "visible" (not display none)
function focusAndTick(selectorOrElement, clock) {
  var element = getUniqueElement(selectorOrElement);
  element.focus();
  let event = document.createEvent("HTMLEvents");
  event.initEvent("focus", false, true);
  element.dispatchEvent(event);
  return timeout(clock);
}

// Blur will only work if the testDom is "visible" (not display none)
function blurAndTick(selectorOrElement, clock) {
  var element = getUniqueElement(selectorOrElement);
  element.blur();
  let event = document.createEvent("HTMLEvents");
  event.initEvent("blur", false, true);
  element.dispatchEvent(event);
  return timeout(clock);
}

function keydownAndTick(elementOrSelector, keyCodeOrLetter, clock) {
  return triggerKeyboardEventAndTick(
    elementOrSelector,
    "keydown",
    keyCodeOrLetter,
    {},
    clock
  );
}

function keydownAndTickWithModifiers(
  elementOrSelector,
  keyCodeOrLetter,
  eventKeyModifiers,
  clock
) {
  return triggerKeyboardEventAndTick(
    elementOrSelector,
    "keydown",
    keyCodeOrLetter,
    eventKeyModifiers,
    clock
  );
}

function mouseupAndTick(selectorOrElement, clock) {
  var element = getUniqueElement(selectorOrElement);
  var event = document.createEvent("MouseEvents");
  event.initEvent("mouseup", true, true);
  element.dispatchEvent(event);
  return timeout(clock);
}

function pasteIntoInputAndTick(text, selectorOrElement, clock) {
  var element = getUniqueElement(selectorOrElement);
  var event = new ClipboardEvent("paste");

  //Must make clipboardData a writable property
  Object.defineProperty(event, "clipboardData", {
    writable: true,
    value: new DataTransfer(),
  });
  event.clipboardData.items.add(text, "text/plain");

  element.dispatchEvent(event);

  //Append text to element, as a programatically created ClipboardEvent won't do this.
  return Promise.resolve()
    .then(() => {
      if (!event.defaultPrevented) {
        var newValue = (element.value += text);

        setValue(element, newValue);
      }
    })
    .then(timeout(clock));
}

function triggerKeyboardEventAndTick(
  selectorOrElement,
  eventType,
  keyCodeOrLetter,
  eventKeyModifiers,
  clock
) {
  eventKeyModifiers = eventKeyModifiers || {};

  var isString = typeof keyCodeOrLetter === "string";
  var keyCode = isString
    ? keyCodeOrLetter.toUpperCase().charCodeAt(0)
    : keyCodeOrLetter;
  var element = getUniqueElement(selectorOrElement);
  var event = document.createEvent("HTMLEvents");
  Object.assign(event, eventKeyModifiers);
  event.initEvent(eventType, true, true);
  event.keyCode = keyCode;
  event.key = isString ? keyCodeOrLetter : "";
  element.dispatchEvent(event);
  return timeout(clock).then(() => event);
}
