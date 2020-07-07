module.exports = function ({ matchController }) {
    return {
        namespaced: true,
        name: "debug",
        actions: {
            saveMatch,
            restoreSavedMatch,
        },
    };

    function saveMatch() {
        const saveName = prompt("Save name:");
        matchController.emit("saveMatch", saveName);
    }

    function restoreSavedMatch({ rootState }) {
        const saveName = prompt("Restore match with name:");

        const opponentId = rootState.match.opponentUser.id;
        matchController.emit("restoreSavedMatch", { saveName, opponentId });

        document.body.innerHTML = "<marquee><h1>Loading...</h1></marquee>";
        setTimeout(() => window.location.reload(), 3000);
    }
};
