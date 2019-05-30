module.exports = function ({ name, buffer, context, gain }) {

    const gainNode = context.createGain();
    gainNode.gain.value = gain;
    const source = context.createBufferSource();
    source.connect(gainNode);
    source.buffer = buffer;
    gainNode.connect(context.destination);

    return {
        name,
        loop,
        playImmediately,
        fadeIn,
        fadeOut,
        kill
    };

    function loop() {
        source.loop = true;
        source.loopStart = 0.5;
        source.loopEnd = source.buffer.duration - .5;
    }

    function playImmediately() {
        source.start(0);
    }

    function fadeIn(fadeTime = 2000, intervalTime = 30) {
        const targetGain = gain;

        const step = targetGain / (fadeTime / intervalTime);
        const intervalId = setInterval(() => {
            gainNode.gain.value = Math.min(targetGain, gainNode.gain.value + step);
            if (targetGain - gainNode.gain.value < step) {
                clearInterval(intervalId);
            }
        }, intervalTime);

        source.start(0);
    }

    function fadeOut(fadeTime = 2000, intervalTime = 30) {
        const step = gain / (fadeTime / intervalTime);
        const intervalId = setInterval(() => {
            const newValue = Math.max(0, gainNode.gain.value - step);
            gainNode.gain.value = newValue > 0 ? newValue : 0;
            if (gainNode.gain.value <= 0.002) {
                clearInterval(intervalId);
            }
        }, intervalTime);
    }

    function kill() {
        gainNode.gain.value = 0;
        source.stop(0);
    }
};