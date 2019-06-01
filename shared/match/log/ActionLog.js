const iconNameToAssetName = {
    damagedInAttack: 'missile.svg',
    moved: 'move.svg',
    played: 'played.svg',
    stationCardsDamaged: 'target-hit.svg',
    destroyed: 'fire.svg'
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
        return playerStateService.getPlayerState().actionLogEntries.slice(-7);
    }

    function damagedInAttack({ defenderCardCommonId, damageInflictedByDefender }) {
        const cardName = cardInfoRepository.getName(defenderCardCommonId);
        log({
            iconName: 'damagedInAttack',
            text: `*${cardName}# took ${damageInflictedByDefender} damage`
        });
    }

    function cardDestroyed({ cardCommonId }) {
        const cardName = cardInfoRepository.getName(cardCommonId);
        log({
            iconName: 'destroyed',
            text: `*${cardName}# was discarded`
        });
    }

    function opponentPlayedCard({ cardCommonId }) {
        const cardName = cardInfoRepository.getName(cardCommonId);
        log({
            iconName: 'played',
            text: `Opponent played *${cardName}#`
        });
    }

    function opponentMovedCard({ cardCommonId }) {
        const cardName = cardInfoRepository.getName(cardCommonId);
        log({
            iconName: 'moved',
            text: `Opponent moved *${cardName}#`
        });
    }

    function stationCardsWereDamaged({ targetCount }) {
        log({
            iconName: 'stationCardsDamaged',
            text: `*${targetCount} station ${targetCount === 1 ? 'card' : 'cards'}# ${targetCount === 1 ? 'was' : 'were'} damaged`
        });
    }

    function log({ iconName, text }) {
        playerStateService.update(playerState => {
            playerState.actionLogEntries.push({
                iconUrl: `/icon/${iconNameToAssetName[iconName]}`,
                text
            });
        });
    }
};
