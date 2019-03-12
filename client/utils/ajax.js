module.exports = {
    async jsonPost(url, data) {
        let response = await fetch(url, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(data)
        });

        const contentType = response.headers.get("content-type");
        let responseContentIsJSON = contentType && contentType.indexOf("application/json") !== -1;
        return responseContentIsJSON ? response.json() : response.text();
    },
    async get(url) {
        let response = await fetch(url);
        return response.json();
    }
};