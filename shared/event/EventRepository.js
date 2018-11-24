module.exports = function EventRepository(deps) {

    return {
        getAll() {
            return deps.events;
        }
    };
}