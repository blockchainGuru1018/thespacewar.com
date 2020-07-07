const Sfx = require("./Sfx.js");

module.exports = function ({ nameToInfo, destinationNode, audioContext }) {
    const bufferByUrl = {};

    return {
        loadSounds,
    };

    async function loadSounds() {
        const urls = Object.values(nameToInfo).map((info) => info.url);
        await cacheSoundBuffersByUrl(urls);
        return createSounds();
    }

    function createSounds() {
        const soundNames = Object.keys(nameToInfo);
        return soundNames.map(createSound);
    }

    function createSound(name) {
        const info = nameToInfo[name];
        const buffer = bufferByUrl[info.url];
        return Sfx({ name, info, buffer, audioContext, destinationNode });
    }

    function cacheSoundBuffersByUrl(urls) {
        return Promise.all(
            urls
                .map((url) => [url, loadSound(url)])
                .map(async ([url, soundBufferPromise]) => {
                    bufferByUrl[url] = await soundBufferPromise;
                })
        );
    }

    function loadSound(url) {
        return new Promise((resolve, reject) => {
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "arraybuffer";

            // Decode asynchronously
            request.onload = function () {
                audioContext.decodeAudioData(
                    request.response,
                    function (buffer) {
                        resolve(buffer);
                    },
                    reject
                );
            };
            request.send();
        });
    }
};
