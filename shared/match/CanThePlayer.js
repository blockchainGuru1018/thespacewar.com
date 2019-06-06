const MatchMode = require('./MatchMode.js');
const Neutralization = require('../card/Neutralization.js');

const ALLOWED_STATION_CARDS_EACH_TURN = 1;

//TODO Idea for interface. Each method takes cardData, but if necessary or ideal they have a
// sibling method with the same name and a suffix "byId" that get the cardData and runs the other method.
// In an ideal world it would only take real "behaviourCards", that is NOT cardData but an instance of BaseCard.

//TODO What is the difference between the PlayerRuleService and CanThePlayer? Seems to be no difference semantically.
// Practically though, CanThePlayer deals more with "can the player put down THIS card?" while PlayerRuleService deals more
// with "is the player allowed to put down ANY card?". Should think about better names for these two, or if they should be merged into one thing.
class CanThePlayer {

    constructor({
        matchService,
        queryEvents,
        playerStateService,
        opponentStateService,
        turnControl,
        gameConfig
    } = {}) {
        this._matchService = matchService;
        this._queryEvents = queryEvents;
        this._playerStateService = playerStateService;
        this._opponentStateService = opponentStateService;
        this._turnControl = turnControl;
        this._gameConfig = gameConfig;
    }

    triggerCardsDormantEffect(card) {
        return this._turnControl.playerHasControl()
            && card.canTriggerDormantEffect()
            && this.useThisCard(card);
    }

    useThisCard(card) { //TODO Does this express enough that event cards should'nt be checked against this? They are not "used" only "putDown". Also this is "can not be used" as for example disabled by Neutralization.
        if (card.type === 'duration') {
            return this.useThisDurationCard(card.id);
        }
        else if (card.type === 'defense') {
            return this.attackWithThisCard(card);
        }
        else {
            return this.moveThisCard(card)
                || this.attackWithThisCard(card)
        }
    }

    //TODO This could do as "putDownThisEventCard" and check for properties on instantiated cards instead of checking against static properties.
    useThisDurationCard(cardId) {
        const cardData = this._findCardFromOpponentOrPlayer(cardId);
        if (cardData && cardData.commonId === Neutralization.CommonId) return true;

        const noPlayerHasNeutralizationInPlay = !this._playerStateService.hasDurationCardOfType(Neutralization.CommonId)
            && !this._opponentStateService.hasDurationCardOfType(Neutralization.CommonId);

        return noPlayerHasNeutralizationInPlay;
    }

    putDownThisCard(cardData) {
        if (this._turnControl.playerHasControlOfOpponentsTurn() && cardData.cost > 0) return false;

        if (cardData.type === 'event') {
            return this.putDownThisEventCard(cardData.id);
        }

        return true;
    }

    putDownThisEventCard(cardData) {
        return !this._somePlayerHasCardThatPreventsEventCards();
    }

    _somePlayerHasCardThatPreventsEventCards() {
        return this._playerStateService.hasMatchingCardInSomeZone(card => card.preventsAnyPlayerFromPlayingAnEventCard)
            || this._opponentStateService.hasMatchingCardInSomeZone(card => card.preventsAnyPlayerFromPlayingAnEventCard);
    }

    putDownMoreStationCardsThisTurn() {
        const currentTurn = this._matchService.getTurn();

        const extraFreeStationCards = this._queryEvents.countFreeExtraStationCardsGrantedOnTurn(currentTurn);
        const totalAllowedStationCards = extraFreeStationCards + ALLOWED_STATION_CARDS_EACH_TURN;

        const putDownStationCards = this._queryEvents.countRegularStationCardsPutDownOnTurn(currentTurn);
        return putDownStationCards < totalAllowedStationCards;
    }

    putDownMoreStartingStationCards() {
        const totalAllowedCount = this._playerStateService.allowedStartingStationCardCount();
        const stationCardsLeftToSelect = totalAllowedCount - this._playerStateService.getUnflippedStationCardsCount();
        return this._matchService.mode() === MatchMode.selectStationCards
            && stationCardsLeftToSelect > 0;
    }

    moveThisCard(card) {
        if (card.type === 'missile') {
            return !this._opponentStateService.hasMatchingCardInSomeZone(
                card => card.preventsOpponentMissilesFromMoving);
        }
        return true;
    }

    attackWithThisCard(card) {
        if (card.type === 'missile') {
            return !this._opponentStateService.hasMatchingCardInSomeZone(
                card => card.preventsOpponentMissilesFromAttacking);
        }
        return true;
    }

    attackStationCards() {
        return !this._opponentStateService.hasMatchingCardInHomeZone(c => c.stopsStationAttack())
    }

    attackCards() {
        return this._turnControl.playerHasControlOfOwnTurn();
    }

    moveCards() {
        return this._turnControl.playerHasControlOfOwnTurn();
    }

    sacrificeCards() {
        return this._turnControl.playerHasControlOfOwnTurn();
    }

    repairCards() {
        return this._turnControl.playerHasControlOfOwnTurn();
    }

    discardCards() {
        return this._turnControl.playerHasControlOfOwnTurn();
    }

    recycleCards() {
        return this._matchService.mode() !== MatchMode.game
            && this._queryEvents.countRecycles() < this._gameConfig.maxRecycles();
    }

    counterCard({ id: cardId }) {
        const isOpponentCard = this._opponentStateService.hasCard(cardId);
        if (!isOpponentCard) return false;

        const playerHasControlOfOwnTurn = this._turnControl.playerHasControlOfOwnTurn();
        if (playerHasControlOfOwnTurn) {
            const cardWasPutDownTooLongAgo = !this._queryEvents.putDownCardWithinTimeFrame(cardId, this._gameConfig.timeToCounter());
            if (cardWasPutDownTooLongAgo) return false;
        }
        else {
            const tookControlOfTurnToLate = !this._queryEvents.lastTookControlWithinTimeFrameSincePutDownCard(cardId, this._gameConfig.timeToCounter());
            if (tookControlOfTurnToLate) {
                return false;
            }
        }

        return this._queryEvents.wasOpponentCardAtLatestPutDownInHomeZone(cardId)
            || this._queryEvents.wasOpponentCardAtLatestPutDownAsExtraStationCard(cardId);
    }

    _findCardFromOpponentOrPlayer(cardId) {
        return this._playerStateService.findCardFromAnySource(cardId)
            || this._opponentStateService.findCardFromAnySource(cardId);
    }
}

module.exports = CanThePlayer;

function sum(arr, accessorKey) {
    return arr.reduce((acc, v) => acc + (v[accessorKey] || 0), 0);
}
