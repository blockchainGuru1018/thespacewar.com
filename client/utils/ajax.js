module.exports = {
    async jsonPost(url, data) {
        let response = await fetch(url, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify(data)
        })
        return response.json();
    },
    async get(url) {
        let response = await fetch(url);
        return response.json();
    }
};