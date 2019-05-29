module.exports = function () {

    const library = {};
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    let context = null;

    window.addEventListener('click', async () => {
        if (!context) {
            context = new AudioContext();
            await storeSounds([
                '/sound/click.mp3'
            ]);
        }

        playSound('/sound/click.mp3');
    }, true);

    return {
        namespaced: true,
        name: 'audio',
        actions: {
            // background,
            select
        }
    };

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
                console.log('request.response,request.response', request.response);
                context.decodeAudioData(request.response, function (buffer) {
                    resolve(buffer);
                }, reject);
            };
            request.send();
        });
    }

    function playSound(url) {
        const source = context.createBufferSource();
        source.buffer = library[url];
        source.connect(context.destination);
        source.start(0);
    }
};
