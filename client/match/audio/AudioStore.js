const AudioPlayer = require('./AudioPlayer.js');

const dragAndDropSoundTime = 600;

const nameToInfo = {
    'background': {
        gain: .1,
        url: '/sound/background1.mp3',
        exclusive: true,
        loop: true
    },
    'main': {
        gain: .3,
        url: '/sound/background2.mp3',
        exclusive: true,
        loop: true
    },
    'click': {
        gain: .5,
        url: '/sound/click2.mp3'
    }
};

module.exports = function () {

    const audioPlayer = AudioPlayer({ nameToInfo });

    let playUpClick = false;
    let upClickTimeoutId = null;
    window.addEventListener('mousedown', async () => {
        audioPlayer.playEffect('click');

        clearTimeout(upClickTimeoutId);
        upClickTimeoutId = setTimeout(() => {
            playUpClick = true;
        }, dragAndDropSoundTime);
    }, true);
    window.addEventListener('mouseup', async () => {
        clearTimeout(upClickTimeoutId);
        if (playUpClick) {
            playUpClick = false;
            audioPlayer.playEffect('click');
        }
    }, true);

    return {
        namespaced: true,
        name: 'audio',
        actions: {
            main,
            background
        }
    };

    async function main() {
        audioPlayer.playSong('main');
    }

    async function background() {
        audioPlayer.playSong('background');
    }
};
