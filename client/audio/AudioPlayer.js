const AudioLoader = require('./AudioLoader.js');
const AudioSettings = require('./AudioSettings.js');

module.exports = function ({ nameToInfo }) {

    const settings = AudioSettings();

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const destinationNode = audioContext.createGain();
    destinationNode.gain.value = settings.masterGain();
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
        window.audioMuted = true;
        destinationNode.gain.value = 0;
    };
    window.unmute = () => {
        window.audioMuted = false;
        destinationNode.gain.value = settings.masterGain();
    };

    return {
        playSong,
        playEffect,
        masterGain,
        setMasterGain,
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

    function masterGain() {
        return destinationNode.gain.value;
    }

    function setMasterGain(newGain) {
        destinationNode.gain.value = newGain;
        settings.setMasterGain(newGain);
    }
};
