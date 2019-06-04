const actionToIconUrl = {
    damagedInAttack: 'fire.svg',
    moved: 'move.svg',
    played: 'played.svg',
    stationCardsDamaged: 'target-hit.svg',
    destroyed: 'target-hit.svg',
    countered: 'countered.svg',
    counteredAttackOnCard: 'countered.svg',
    expandedStation: 'expand.svg'
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
        opponentMovedCard,
        opponentCounteredCard,
        opponentCounteredAttackOnCard,
        opponentCounteredAttackOnStation,
        opponentExpandedStation
    };

    function queryLatest() {
        return getEntries()
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

    function opponentCounteredCard({ cardCommonId }) {
        const cardName = cardInfoRepository.getName(cardCommonId);
        log({
            action: 'countered',
            text: `Opponent countered *${cardName}#`
        });
    }

    function opponentCounteredAttackOnCard({ defenderCardId, defenderCardCommonId }) {
        const cardName = cardInfoRepository.getName(defenderCardCommonId);
        log({
            action: 'counteredAttackOnCard',
            text: `Opponent countered attack on *${cardName}#`,
            defenderCardId
        });
    }

    function opponentCounteredAttackOnStation({ targetStationCardIds }) {
        log({
            action: 'counteredAttackOnCard',
            text: `Opponent countered attack on *${targetStationCardIds.length} station cards#`,
            targetStationCardIds
        });
    }

    function opponentExpandedStation() {
        const action = 'expandedStation';
        const latestSimilarEntries = removeLatestSimilarEntries('expandedStation');
        const count = latestSimilarEntries.reduce((acc, entry) => acc + entry.count, 0) + 1;
        log({
            action,
            text: `Opponent expanded station by *${count} station ${count === 1 ? 'card' : 'cards'}#`,
            count
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

    function removeLatestSimilarEntries(similarToAction) {
        const entries = getEntries().slice();
        const collapsedEntries = [];
        while (entries.length > 0 && entries[entries.length - 1].action === similarToAction) {
            collapsedEntries.push(entries.pop());
        }

        const updatedEntries = entries.reverse();
        playerStateService.update(playerState => {
            playerState.actionLogEntries = updatedEntries;
        });

        return collapsedEntries;

    }

    function getEntries() {
        return playerStateService
            .getPlayerState()
            .actionLogEntries;
    }
};
