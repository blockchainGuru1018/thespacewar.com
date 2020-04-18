const keyForLocalSecret = 'thespacewar-secret';
let secret = localStorage.getItem(keyForLocalSecret);
if (!secret) {
    secret = (Math.round(Math.random() * 1000).toString()) + ':' + (Math.round(Math.random() * 1000).toString()) + ':' + (Math.round(Math.random() * 1000).toString());
    localStorage.setItem(keyForLocalSecret, secret);
}

module.exports = {
    jsonPostEmptyWithSecret,
    jsonPost,
    get,
    secret: () => secret
};

function jsonPostEmptyWithSecret(url){
    return jsonPost(url, {});
}

async function jsonPost(url, data) {
    if (typeof data === 'object') {
        data.secret = secret;
    }

    const response = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(data)
    });

    const contentType = response.headers.get("content-type");
    const responseContentIsJSON = contentType && contentType.indexOf("application/json") !== -1;
    return responseContentIsJSON ? response.json() : response.text();
}

async function get(url) {
    const response = await fetch(url);
    return response.json();
}