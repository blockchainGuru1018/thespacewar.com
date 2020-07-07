const LONG_PRESS_TIME = 400;

let longpressTimeoutId;
let longPressed = false;

document.addEventListener("mouseup", (event) => {
    clearTimeout(longpressTimeoutId);

    if (longPressed) {
        event.preventDefault();
        event.stopPropagation();
        longPressed = false;
    }
});

module.exports = {
    bind(element, { value }) {
        element.addEventListener("mousedown", () => {
            clearTimeout(longpressTimeoutId);

            longpressTimeoutId = setTimeout(() => {
                longPressed = true;
                value();
            }, LONG_PRESS_TIME);
        });
    },
};
