module.exports = function EventRepository({ playerStateService }) {
    return {
        getAll() {
            return playerStateService.getEvents();
        },
    };
};
