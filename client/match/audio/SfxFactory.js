const Sfx = require('./Sfx.js');

module.exports = function ({ library, nameToInfo }) {

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();

    return {
        fromName
    };

    function fromName(name) {
        const { gain, url } = nameToInfo[name];
        const buffer = library[url];
        Sfx({ name, buffer, gain, context });
    }
};