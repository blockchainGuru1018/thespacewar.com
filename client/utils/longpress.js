const LONG_PRESS_TIME = 800;

module.exports = {
    bind(element, { value }) {
        let longpressTimeoutId;
        let longPressed = false;

        element.addEventListener('mousedown', () => {
            longpressTimeoutId = setTimeout(() => {
                longPressed = true;
                value();
            }, LONG_PRESS_TIME);
        });
        element.addEventListener('mouseup', event => {
            clearTimeout(longpressTimeoutId);

            if (longPressed) {
                event.preventDefault();
                event.stopPropagation();
                longPressed = false;
            }
        });
    }
};
