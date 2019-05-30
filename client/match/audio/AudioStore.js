const SfxFactory = require('./SfxFactory.js');

const Background1Gain = .01;
const Background2Gain = .03;
const ClickGain = .05;

const nameToInfo = {
    'background': {
        gain: .01,
        url: '/sound/background1.mp3'
    },
    'main': {
        gain: .03,
        url: '/sound/background2.mp3'
    },
    'click': {
        gain: .05,
        url: '/sound/click2.mp3'
    }
};

module.exports = function () {

    const library = {};
    const sfxFactory = SfxFactory({ library, nameToInfo });

    let mute = false;

    const audioPlaying = [];
    const audioQueue = [];
    let sounds = [];

    const urls = Object.values(nameToInfo).map(info => info.url);
    let storeSoundsPromise = storeSounds(urls);
    storeSoundsPromise.then(() => {
        storeSoundsPromise = null;
        for (const audio of audioQueue) {
            audio.callback();
        }

        sounds = Object.keys(nameToInfo).map(name => sfxFactory.fromName(name));
    });

    window.addEventListener('click', async () => {
        if (mute) return;
        playSound('/sound/click2.mp3');
    }, true);

    window.mute = () => {
        mute = true;
        killAudio();
    };

    return {
        namespaced: true,
        name: 'audio',
        actions: {
            killAudio,
            main,
            background,
            select
        }
    };

    function killAudio() {
        audioQueue.length = 0;

        for (const audio of audioPlaying) {
            if (audio.gainNode) {
                audio.gainNode.gain.value = 0;
                audio.killed = true;
            }
        }
    }

    async function main() {
        const hasAlreadyQueueMusic = !audioQueue.some(a => a.name === 'main');
        if (storeSoundsPromise && hasAlreadyQueueMusic) {
            audioQueue.push({ name: 'main', callback: () => main() });
        }
        else {
            console.log('playing main');
            loopSound('/sound/background2.mp3', Background2Gain);
        }
    }

    async function background() {
        const hasAlreadyQueueMusic = !audioQueue.some(a => a.name === 'background');
        if (storeSoundsPromise && hasAlreadyQueueMusic) {
            audioQueue.push({ name: 'background', callback: () => background() });
        }
        else {
            console.log('playing background');
            loopSound('/sound/background1.mp3', Background1Gain);
        }
    }

    function select() {
        // playSound(selectSound);
    }

    function storeSounds(urls) {
        return Promise.all(
            urls
                .map(url => [url, loadSound(url)])
                .map(async ([url, soundBufferPromise]) => {
                    library[url] = await soundBufferPromise;
                })
        );
    }

    function loadSound(url) {
        return new Promise((resolve, reject) => {
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';

            // Decode asynchronously
            request.onload = function () {
                context.decodeAudioData(request.response, function (buffer) {
                    resolve(buffer);
                }, reject);
            };
            request.send();
        });
    }

    function playSound(url) {
        if (mute) return;

        const gainNode = context.createGain();
        gainNode.gain.value = ClickGain;
        const source = context.createBufferSource();
        source.buffer = library[url];

        source.connect(gainNode);
        gainNode.connect(context.destination);
        source.start(0);
    }

    function loopSound(url, targetGain) {
        if (mute) return;

        const gainNode = context2.createGain();
        // gainNode.gain.value = 0;
        gainNode.gain.value = targetGain;

        const source = context2.createBufferSource();
        source.connect(gainNode);
        source.buffer = library[url];
        gainNode.connect(context2.destination);

        source.start(0);
        source.loop = true;
        source.loopStart = 0.5;
        source.loopEnd = source.buffer.duration - .5;
        return

        const fadeInTime = 2000;
        const intervalTime = 30;

        const step = targetGain / (fadeInTime / intervalTime);
        const intervalId = setInterval(() => {
            gainNode.gain.value = Math.min(targetGain, gainNode.gain.value + step);
            if (targetGain - gainNode.gain.value < step) {
                clearInterval(intervalId);
            }
        }, intervalTime);

        source.start(0);
        const audioReference = { gainNode };
        audioPlaying.push(audioReference);

        setTimeout(() => {
            const intervalId = setInterval(() => {
                const newValue = Math.max(0, gainNode.gain.value - step);
                gainNode.gain.value = newValue > 0 ? newValue : 0;
                if (gainNode.gain.value <= 0.002) {
                    clearInterval(intervalId);
                    const index = audioPlaying.indexOf(audioReference);
                    audioPlaying.splice(index, 1);
                }
            }, intervalTime);

            setTimeout(() => {
                if (!audioReference.killed) {
                    loopSound(url, targetGain);
                }
            }, fadeInTime / 4);
        }, (source.buffer.duration) * 1000 - fadeInTime);
    }
};
