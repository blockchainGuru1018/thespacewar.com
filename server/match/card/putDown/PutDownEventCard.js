function PutDownEventCard({
    playerServiceProvider,
}) {

    return {
        forPlayer
    };

    function forPlayer(playerId, cardData) {
        const playerStateService = playerServiceProvider.getStateServiceById(playerId);
        playerStateService.putDownEventCardInZone(cardData);
    }
}

module.exports = PutDownEventCard;
