const LONG_PRESS_TIME = 400;

let longpressTimeoutId;
let longPressed = false;

document.addEventListener("mouseup", (event) => {
  handleMouseUp(event);
});
document.addEventListener("touchend", (event) => {
  handleMouseUp(event);
});

function handleMouseUp(event) {
  clearTimeout(longpressTimeoutId);

  if (longPressed) {
    event.preventDefault();
    event.stopPropagation();
    longPressed = false;
  }
}

module.exports = {
  bind(element, { value }) {
    function handleMouseDown() {
      clearTimeout(longpressTimeoutId);

      longpressTimeoutId = setTimeout(() => {
        longPressed = true;
        value();
      }, LONG_PRESS_TIME);
    }

    element.addEventListener("mousedown", () => {
      handleMouseDown();
    });
    element.addEventListener("touchstart", () => {
      handleMouseDown();
    });
  },
};
