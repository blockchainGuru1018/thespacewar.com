(function () {
    var _setTimeout = window.setTimeout;

    poll();

    function poll() {
        var isFakeAjax = window.__sinon && window.__sinon.fakeServer.xhr === window.XMLHttpRequest;
        if (isFakeAjax) {
            _setTimeout(poll, 1000);
            return;
        }

        var xhr = new window.XMLHttpRequest();
        xhr.onerror = function () {
            _setTimeout(poll, 1000);
        };
        xhr.onload = function () {
            if (xhr.status === 200) {
                var time = parseInt(xhr.responseText);
                if (lastChangeTime === time) {
                    _setTimeout(poll, 200);
                }
                else {
                    window.location.reload();
                }
            }
            else {
                _setTimeout(poll, 1000);
            }
        };
        xhr.open('GET', '/last-change');
        xhr.send();
    }
})();