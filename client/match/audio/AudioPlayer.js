const AudioLoader = require('./AudioLoader.js');

module.exports = function ({ nameToInfo }) {

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const destinationNode = audioContext.createGain();
    destinationNode.gain.value = 1;
    destinationNode.connect(audioContext.destination);

    const audioQueue = [];

    let sounds = [];
    AudioLoader({ nameToInfo, destinationNode, audioContext })
        .loadSounds()
        .then(loadedSounds => {
            sounds = loadedSounds;
            for (const audio of audioQueue) {
                audio.callback();
            }
        });

    window.mute = () => {
        destinationNode.gain.value = 0;
    };
    window.unmute = () => {
        destinationNode.gain.value = 1;
    };

    return {
        playSong,
        playEffect,
    };

    function playSong(name) {
        const sound = sounds.find(s => s.name === name);
        if (!sound) {
            const hasAlreadyQueueMusic = audioQueue.some(a => a.name === name);
            if (!hasAlreadyQueueMusic) {
                audioQueue.push({ name: name, callback: () => playSong(name) });
            }
        }
        else if (!sound.playing()) {
            if (sound.exclusive) {
                const competingSound = sounds.find(s => s.exclusive && s.name !== name);
                competingSound.fadeOut(2000);
                sound.fadeIn(2000);
            }
            else {
                sound.fadeIn();
            }
        }
    }

    function playEffect(name) {
        const sound = sounds.find(s => s.name === name);
        if (sound) {
            sound.playImmediately();
        }
    }
};
