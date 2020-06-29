module.exports = function ({
    actionPointsCalculator,
    playerPhase,
    eventRepository,
    playerStateService,
    matchService
}) {
    return {
        calculate
    };

    function calculate() {
        return actionPointsCalculator.calculate({
            phase: playerPhase.get(),
            events: eventRepository.getAll(),
            turn: matchService.getTurn(),
            actionStationCardsCount: playerStateService.getActionStationCards().length
        });
    }
};
