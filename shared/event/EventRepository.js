module.exports = function EventRepository({
    playerId,
    playerServiceProvider
}) {

    return {
        getAll() {
            const service = playerServiceProvider.getStateServiceById(playerId);
            return service.getEvents();
        }
    };
}