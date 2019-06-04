const actionToIconUrl = {
    damagedInAttack: 'fire.svg',
    moved: 'move.svg',
    played: 'played.svg',
    stationCardsDamaged: 'target-hit.svg',
    destroyed: 'target-hit.svg',
    countered: 'countered.svg',
    counteredAttackOnCard: 'countered.svg',
    expandedStation: 'expand.svg',
    issuedOverwork: 'recycle.svg',
    milled: 'mill.svg',
    movedStationCard: 'move.svg'
};

const locationToText = {
    'station-handSize': '"max cards"',
    'station-draw': '"draw cards"',
    'station-action': '"action points"',
};

module.exports = function ({
    matchService,
    playerStateService,
    cardInfoRepository,
    userRepository
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
        opponentExpandedStation,
        opponentIssuedOverwork,
        opponentMilledCardsFromYourDeck,
        opponentMovedStationCard
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
            text: `${opponentName()} played *${cardName}#`
        });
    }

    function opponentMovedCard({ cardCommonId }) {
        const cardName = cardInfoRepository.getName(cardCommonId);
        log({
            action: 'moved',
            text: `${opponentName()} moved *${cardName}#`
        });
    }

    function opponentCounteredCard({ cardCommonId }) {
        const cardName = cardInfoRepository.getName(cardCommonId);
        log({
            action: 'countered',
            text: `${opponentName()} countered *${cardName}#`
        });
    }

    function opponentCounteredAttackOnCard({ defenderCardId, defenderCardCommonId }) {
        const cardName = cardInfoRepository.getName(defenderCardCommonId);
        log({
            action: 'counteredAttackOnCard',
            text: `${opponentName()} countered attack on *${cardName}#`,
            defenderCardId
        });
    }

    function opponentCounteredAttackOnStation({ targetStationCardIds }) {
        log({
            action: 'counteredAttackOnCard',
            text: `${opponentName()} countered attack on *${targetStationCardIds.length} station cards#`,
            targetStationCardIds
        });
    }

    function opponentExpandedStation() {
        const action = 'expandedStation';
        const latestSimilarEntries = removeLatestSimilarEntries('expandedStation');
        const count = latestSimilarEntries.reduce((acc, entry) => acc + entry.count, 0) + 1;
        log({
            action,
            text: `${opponentName()} expanded station by *${count} station ${count === 1 ? 'card' : 'cards'}#`,
            count
        });
    }

    function stationCardsWereDamaged({ targetCount }) {
        log({
            action: 'stationCardsDamaged',
            text: `*${targetCount} station ${targetCount === 1 ? 'card' : 'cards'}# ${targetCount === 1 ? 'was' : 'were'} damaged`
        });
    }

    function opponentIssuedOverwork() {
        log({
            action: 'issuedOverwork',
            text: `${opponentName()} issued overwork`
        });
    }

    function opponentMovedStationCard({ fromLocation, toLocation }) {
        const fromLocationText = locationToText[fromLocation];
        const toLocationText = locationToText[toLocation];
        log({
            action: 'movedStationCard',
            text: `${opponentName()} moved a station card from ${fromLocationText}-row to ${toLocationText}-row`
        });
    }

    function opponentMilledCardsFromYourDeck({ milledCardCommonIds }) {
        const cardNames = milledCardCommonIds.map(cardCommonId => cardInfoRepository.getName(cardCommonId));

        let text = '';
        if (cardNames.length === 0) {
            text = `${opponentName()} milled but no cards were discarded`;
        }
        else if (cardNames.length === 1) {
            text = `*${cardNames[0]}# was milled`;
        }
        else if (cardNames.length === 2) {
            text = `*${cardNames[0]}# & *${cardNames[1]}# were milled`;
        }
        else {
            text = `${cardNames.slice(0, 1).map(name => `*${name}#`).join(', ')} & *${cardNames[cardNames.length - 1]}# were milled`;
        }

        log({ action: 'milled', text });
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

    function opponentName() {
        const playerId = playerStateService.getPlayerId();
        const opponentId = matchService.getOpponentId(playerId);
        const opponentUser = userRepository.getById(opponentId);
        return opponentUser.name;
    }
};
