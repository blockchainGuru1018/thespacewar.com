const actionToIconUrl = {
    damagedInAttack: 'fire.svg',
    moved: 'move.svg',
    played: 'played.svg',
    stationCardsDamaged: 'target-hit.svg',
    destroyed: 'target-hit.svg'
};

module.exports = function ({
    playerStateService,
    cardInfoRepository
}) {

    return {
        queryLatest,
        damagedInAttack,
        cardDestroyed,
        stationCardsWereDamaged,
        opponentPlayedCard,
        opponentMovedCard
    };

    function queryLatest() {
        return playerStateService
            .getPlayerState()
            .actionLogEntries
            .slice(-7)
            .map(entry => {
                return {
                    ...entry,
                    iconUrl: `/icon/${actionToIconUrl[entry.action]}`
                };
            });
    }

    function damagedInAttack({ defenderCardId, defenderCardCommonId, damageInflictedByDefender }) {
        const cardName = cardInfoRepository.getName(defenderCardCommonId);
        log({
            action: 'damagedInAttack',
            text: `*${cardName}# took ${damageInflictedByDefender} damage`,
            defenderCardId
        });
    }

    function cardDestroyed({ cardCommonId }) {
        const cardName = cardInfoRepository.getName(cardCommonId);
        log({
            action: 'destroyed',
            text: `*${cardName}# was discarded`
        });
    }

    function opponentPlayedCard({ cardCommonId }) {
        const cardName = cardInfoRepository.getName(cardCommonId);
        log({
            action: 'played',
            text: `Opponent played *${cardName}#`
        });
    }

    function opponentMovedCard({ cardCommonId }) {
        const cardName = cardInfoRepository.getName(cardCommonId);
        log({
            action: 'moved',
            text: `Opponent moved *${cardName}#`
        });
    }

    function stationCardsWereDamaged({ targetCount }) {
        log({
            action: 'stationCardsDamaged',
            text: `*${targetCount} station ${targetCount === 1 ? 'card' : 'cards'}# ${targetCount === 1 ? 'was' : 'were'} damaged`
        });
    }

    function log({
        action,
        ...entry
    }) {
        playerStateService.update(playerState => {
            playerState.actionLogEntries.push({
                action,
                ...entry
            });
        });
    }
};
