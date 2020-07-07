module.exports = function ({
  name,
  info,
  buffer,
  audioContext,
  destinationNode,
}) {
  const gain = info.gain;
  const loop = info.loop;

  const gainNode = audioContext.createGain();
  gainNode.gain.value = gain;
  gainNode.connect(destinationNode);

  let startedPlaying = null;
  let loopTimeoutId = null;
  let fadeOutIntervalId = null;
  let fadeInIntervalId = null;

  let source = createSource();

  return {
    name,
    playing,
    playImmediately,
    fadeIn,
    fadeOut,
    kill,
    ...info,
  };

  function playImmediately() {
    start();
  }

  function fadeIn(fadeTime = 2000, intervalTime = 30) {
    const targetGain = gain;
    gainNode.gain.value = 0;

    start();

    const step = targetGain / (fadeTime / intervalTime);

    clearInterval(fadeInIntervalId);
    fadeInIntervalId = setInterval(() => {
      gainNode.gain.value = Math.min(targetGain, gainNode.gain.value + step);
      if (targetGain - gainNode.gain.value < step) {
        clearInterval(fadeInIntervalId);
      }
    }, intervalTime);
  }

  function fadeOut(fadeTime = 2000, intervalTime = 30) {
    if (!playing()) return;

    return new Promise((resolve) => {
      if (Date.now() - startedPlaying < fadeTime) {
        kill();
        resolve();
      } else {
        const step = gain / (fadeTime / intervalTime);

        clearInterval(fadeOutIntervalId);
        fadeOutIntervalId = setInterval(() => {
          const newValue = Math.max(0, gainNode.gain.value - step);
          gainNode.gain.value = newValue > 0 ? newValue : 0;
          if (gainNode.gain.value <= 0.002) {
            clearInterval(fadeOutIntervalId);

            stop();
            resolve();
          }
        }, intervalTime);
      }
    });
  }

  function playing() {
    return startedPlaying !== null;
  }

  function kill() {
    gainNode.gain.value = 0;
    if (playing()) {
      stop();
    }
  }

  function start() {
    if (playing()) {
      stop();
    }

    if (window.isMute) return;

    startedPlaying = Date.now();
    source.start(0);

    if (loop) {
      clearTimeout(loopTimeoutId);
      loopTimeoutId = setTimeout(async () => {
        await fadeOut(4000);
        fadeIn(4000);
      }, duration() - 4000);
    }
  }

  function stop() {
    clearTimeout(loopTimeoutId);
    clearInterval(fadeOutIntervalId);
    clearInterval(fadeInIntervalId);
    startedPlaying = null;

    source.stop(0);
    source = createSource();
  }

  function createSource() {
    const newSource = audioContext.createBufferSource();
    newSource.connect(gainNode);
    newSource.buffer = buffer;

    return newSource;
  }

  function duration() {
    return buffer.duration * 1000;
  }
};
