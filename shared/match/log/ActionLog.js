const ActionTypes = require("./ActionTypes.js");
const PerfectPlanIcon = "played.svg"; //TODO Find an icon specifically for Perfect Plan

const actionToIconUrl = {
    damagedInAttack: "fire.svg",
    moved: "move.svg",
    played: "played.svg",
    triggered: "played.svg",
    stationCardsDamaged: "target-hit.svg",
    destroyed: "target-hit.svg",
    discarded: "mill.svg",
    countered: "countered.svg",
    [ActionTypes.counteredAttackOnCard]: "countered.svg",
    expandedStation: "expand.svg",
    issuedOverwork: "recycle.svg",
    issuedPerfectPlan: PerfectPlanIcon,
    receivedCardFromCommander: PerfectPlanIcon,
    milled: "mill.svg",
    movedStationCard: "move.svg",
    paralyzed: "shock.svg",
    repairedCard: "recycle.svg",
    repairedStationCard: "recycle.svg",
    tookControlOfTurn: "switch.svg",
    releasedControlOfTurn: "switch.svg",
};

const locationToText = {
    "station-handSize": '"max cards"',
    "station-draw": '"draw cards"',
    "station-action": '"action points"',
};

module.exports = function ({
    matchService,
    playerStateService,
    cardInfoRepository,
    userRepository,
}) {
    return {
        queryLatest,
        damagedInAttack,
        paralyzed,
        cardDestroyed,
        cardsDiscarded,
        stationCardsWereDamaged,
        opponentPlayedCards,
        opponentMovedCard,
        opponentRepairedCard,
        opponentRepairedStationCard,
        opponentCounteredCard,
        opponentCounteredAttackOnCard,
        opponentCounteredAttackOnStation,
        opponentExpandedStation,
        opponentIssuedOverwork,
        opponentIssuedPerfectPlan,
        opponentTriggeredCard,
        opponentMilledCardsFromYourDeck,
        opponentMovedStationCard,
        opponentTookControlOfTurn,
        opponentReleasedControlOfTurn,
        opponentReceivedCardFromCommander,
        receivedCardFromCommander,
    };

    function queryLatest() {
        return getEntries().map((entry) => {
            return {
                ...entry,
                iconUrl: `/icon/${actionToIconUrl[entry.action]}`,
            };
        });
    }

    function damagedInAttack({
        defenderCardId,
        defenderCardCommonId,
        damageInflictedByDefender,
    }) {
        log({
            action: "damagedInAttack",
            cardCommonId: defenderCardCommonId,
            text: `${cardInfoText(
                defenderCardCommonId
            )} took ${damageInflictedByDefender} damage`,
            defenderCardId,
        });
    }

    function paralyzed({ defenderCardId, defenderCardCommonId }) {
        log({
            action: "paralyzed",
            cardCommonId: defenderCardCommonId,
            text: `${cardInfoText(defenderCardCommonId)} was paralyzed`,
            defenderCardId,
        });
    }

    function cardDestroyed({ cardCommonId }) {
        log({
            action: "destroyed",
            cardCommonId: cardCommonId,
            text: `${cardInfoText(cardCommonId)} was discarded`,
        });
    }

    function cardsDiscarded({ cardCommonIds }) {
        if (cardCommonIds.length === 0) return;

        const text = listInTextWithCorrectGrammar({
            cardCommonIds,
            suffixSingle: " was discarded",
            suffixMany: " were discarded",
        });

        log({ action: "discarded", text });
    }

    function opponentPlayedCards({ cardIds, cardCommonIds }) {
        if (cardCommonIds.length === 0) return;

        const text = `${opponentName()} played *${listInTextWithCorrectGrammar({
            cardCommonIds,
        })}#`;
        log({ action: "played", text, cardIds, cardCommonIds });
    }

    function opponentMovedCard({ cardCommonId }) {
        log({
            action: "moved",
            commonCardId: cardCommonId,
            text: `${opponentName()} moved ${cardInfoText(cardCommonId)}`,
        });
    }

    function opponentRepairedCard({ repairedCardId, repairedCardCommonId }) {
        log({
            action: "repairedCard",
            cardCommonId: repairedCardCommonId,
            text: `${opponentName()} moved ${cardInfoText(
                repairedCardCommonId
            )}`,
            repairedCardId,
        });
    }

    function opponentRepairedStationCard() {
        const action = "repairedStationCard";
        const latestSimilarEntries = removeLatestSimilarEntries(action);
        const count =
            latestSimilarEntries.reduce((acc, entry) => acc + entry.count, 0) +
            1;

        let text;
        if (count === 1) {
            text = `${opponentName()} repaired a *station card#`;
        } else {
            text = `${opponentName()} repaired ${count} station ${
                count === 1 ? "card" : "cards"
            }#`;
        }

        log({ action, text, count });
    }

    function opponentCounteredCard({ cardCommonId }) {
        log({
            action: "countered",
            cardCommonId: cardCommonId,
            text: `${opponentName()} countered ${cardInfoText(cardCommonId)}`,
        });
    }

    function opponentCounteredAttackOnCard({
        defenderCardId,
        defenderCardCommonId,
    }) {
        log({
            action: ActionTypes.counteredAttackOnCard,
            cardCommonId: defenderCardCommonId,
            text: `${opponentName()} stopped attack on ${cardInfoText(
                defenderCardCommonId
            )}`,
            defenderCardId,
        });
    }

    function opponentCounteredAttackOnStation({ targetStationCardIds }) {
        const count = targetStationCardIds.length;
        log({
            action: ActionTypes.counteredAttackOnCard,
            text: `${opponentName()} stopped attack on *${count} station ${
                count === 1 ? "card" : "cards"
            }#`,
            targetStationCardIds,
        });
    }

    function opponentExpandedStation() {
        const action = "expandedStation";
        const latestSimilarEntries = removeLatestSimilarEntries(action);
        const count =
            latestSimilarEntries.reduce((acc, entry) => acc + entry.count, 0) +
            1;
        log({
            action,
            text: `${opponentName()} expanded station by *${count} station ${
                count === 1 ? "card" : "cards"
            }#`,
            count,
        });
    }

    function stationCardsWereDamaged({ targetCount }) {
        log({
            action: "stationCardsDamaged",
            text: `*${targetCount} station ${
                targetCount === 1 ? "card" : "cards"
            }# ${targetCount === 1 ? "was" : "were"} damaged`,
        });
    }

    function opponentIssuedOverwork() {
        log({
            action: "issuedOverwork",
            text: `${opponentName()} issued overwork`,
        });
    }

    function opponentIssuedPerfectPlan() {
        log({
            action: "issuedPerfectPlan",
            text: `${opponentName()} issued Perfect Plan`,
        });
    }

    function opponentTriggeredCard(cardInfo) {
        log({
            action: "triggered",
            cardCommonId: cardInfo.commonId,
            text: `${opponentName()} triggered ${cardInfoText(
                cardInfo.commonId
            )}`,
            cardId: cardInfo.id,
        });
    }

    function opponentMovedStationCard({ fromLocation, toLocation }) {
        const fromLocationText = locationToText[fromLocation];
        const toLocationText = locationToText[toLocation];
        log({
            action: "movedStationCard",
            text: `${opponentName()} moved a station card from ${fromLocationText}-row to ${toLocationText}-row`,
        });
    }

    function opponentMilledCardsFromYourDeck({ milledCardCommonIds }) {
        const text = listInTextWithCorrectGrammar({
            cardCommonIds: milledCardCommonIds,
            suffixNone: " milled but no cards were discarded",
            suffixSingle: " was milled",
            suffixMany: " were milled",
        });
        log({ action: "milled", text });
    }

    function opponentTookControlOfTurn() {
        log({
            action: "tookControlOfTurn",
            text: `${opponentName()} took control of turn`,
        });
    }

    function opponentReleasedControlOfTurn() {
        log({
            action: "releasedControlOfTurn",
            text: `${opponentName()} released control of turn`,
        });
    }

    function opponentReceivedCardFromCommander(cardCommonId) {
        log({
            action: "receivedCardFromCommander",
            cardCommonId,
            text: `${opponentName()} received ${cardInfoText(
                cardCommonId
            )} from their commander`,
        });
    }

    function receivedCardFromCommander(cardCommonId) {
        log({
            action: "receivedCardFromCommander",
            cardCommonId,
            text: `You received ${cardInfoText(
                cardCommonId
            )} from your commander`,
        });
    }

    function listInTextWithCorrectGrammar({
        cardCommonIds,
        suffixNone = "",
        suffixSingle = "",
        suffixMany = "",
    }) {
        let text = "";
        if (cardCommonIds.length === 0) {
            text = `${opponentName()}${suffixNone}`;
        } else if (cardCommonIds.length === 1) {
            text = `${cardInfoText(cardCommonIds[0])}${suffixSingle}`;
        } else if (cardCommonIds.length === 2) {
            text = `${cardInfoText(cardCommonIds[0])} & ${cardInfoText(
                cardCommonIds[1]
            )}${suffixMany}`;
        } else {
            const cardInfoTextsListed = cardCommonIds
                .slice(0, -1)
                .map((id) => cardInfoText(id))
                .join(", ");
            const lastCardInfoText = cardInfoText(
                cardCommonIds[cardCommonIds.length - 1]
            );
            text = `${cardInfoTextsListed} & ${lastCardInfoText} were milled`;
        }
        return text;
    }

    function cardInfoText(cardCommonId) {
        const cardName = cardInfoRepository.getName(cardCommonId);
        return `*${cardName}#`;
    }

    function log({ action, ...entry }) {
        playerStateService.update((playerState) => {
            playerState.actionLogEntries.push({
                action,
                ...entry,
            });
        });
    }

    function removeLatestSimilarEntries(similarToAction) {
        const entries = getEntries().slice();
        const collapsedEntries = [];
        while (
            entries.length > 0 &&
            entries[entries.length - 1].action === similarToAction
        ) {
            collapsedEntries.push(entries.pop());
        }

        playerStateService.update((playerState) => {
            playerState.actionLogEntries = entries;
        });

        return collapsedEntries;
    }

    function getEntries() {
        return playerStateService.getPlayerState().actionLogEntries;
    }

    function opponentName() {
        const playerId = playerStateService.getPlayerId();
        const opponentId = matchService.getOpponentId(playerId);
        const opponentUser = userRepository.getById(opponentId);
        return opponentUser.name;
    }
};
