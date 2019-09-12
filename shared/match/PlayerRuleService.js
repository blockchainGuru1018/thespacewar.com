const Commander = require('./commander/Commander.js');
const MatchMode = require("./MatchMode.js");
const ALLOWED_STATION_CARDS_EACH_TURN = 1;

class PlayerRuleService {

    constructor({
        matchService,
        playerStateService,
        opponentStateService,
        canThePlayer,
        canTheOpponent,
        playerRequirementService,
        playerPhase,
        turnControl,
        gameConfig,
        queryEvents,
        playerCommanders
    } = {}) {
        this._matchService = matchService;
        this._playerStateService = playerStateService;
        this._playerRequirementService = playerRequirementService;
        this._turnControl = turnControl;
        this._playerPhase = playerPhase;
        this._opponentStateService = opponentStateService;
        this._canThePlayer = canThePlayer;
        this._canTheOpponent = canTheOpponent;
        this._gameConfig = gameConfig;
        this._playerCommanders = playerCommanders;
        this._queryEvents = queryEvents;
    }

    canPutDownCardsInHomeZone() { // TODO Since event cards are graphically put down in the home zone, this name could be confusing as it still covers event cards.
        if (!this._matchService.isGameOn()) return false;
        let playerRequirements = this._playerRequirementService;
        if (playerRequirements.hasAnyRequirement()) return false;
        if (playerRequirements.isWaitingOnOpponentFinishingRequirement()) return false;
        if (this._playerHasCardThatPreventsThemFromPlayingAnyCards()) return false;
        if (this._opponentHasCardThatPreventsPlayerFromPlayingMoreCards()) return false;

        return this._playerHasControlOfTheirOwnActionPhase()
            || this._turnControl.playerHasControlOfOpponentsTurn();
    }

    _playerHasCardThatPreventsThemFromPlayingAnyCards() {
        return this._playerStateService.hasMatchingCardInSomeZone(card => {
            return card.preventsPlayerFromPlayingAnyCards
                && this._canThePlayer.useThisCard(card);
        });
    }

    _opponentHasCardThatPreventsPlayerFromPlayingMoreCards() {
        return this._opponentStateService.hasMatchingCardInSomeZone(card => {
            if (!card.limitsOpponentToPlayingMaxCardCount) return false;
            if (!this._canTheOpponent.useThisCard(card)) return false;

            const currentTurn = this._matchService.getTurn();
            const playedCardsCountForPlayer = this._queryEvents.putDownCardInHomeZoneCountOnTurn(currentTurn);
            return playedCardsCountForPlayer >= card.limitsOpponentToPlayingMaxCardCount;
        });
    }

    canPutDownStationCards() {
        if (this.canPutDownMoreStartingStationCards()) return true;

        if (this.hasReachedMaximumStationCardCapacity()) return false;

        let playerRequirements = this._playerRequirementService;
        if (playerRequirements.hasAnyRequirement()) return false;
        if (playerRequirements.isWaitingOnOpponentFinishingRequirement()) return false;

        return this._playerHasControlOfTheirOwnActionPhase();
    }

    canPutDownMoreStartingStationCards() {
        return this._matchService.mode() === MatchMode.selectStationCards
            && this.startingStationCardsLeftToSelect() > 0;
    }

    startingStationCardsLeftToSelect() {
        const totalAllowedCount = this._playerStateService.allowedStartingStationCardCount();
        return totalAllowedCount - this._playerStateService.getUnflippedStationCardsCount();
    }

    canPutDownMoreStationCardsThisTurn() {
        const currentTurn = this._matchService.getTurn();

        const extraFreeStationCards = this._queryEvents.countFreeExtraStationCardsGrantedOnTurn(currentTurn);
        const totalAllowedStationCards = extraFreeStationCards + ALLOWED_STATION_CARDS_EACH_TURN;

        const putDownStationCards = this._queryEvents.countRegularStationCardsPutDownOnTurn(currentTurn);
        return putDownStationCards < totalAllowedStationCards;
    }

    getMaximumHandSize() {
        const playerStateService = this._playerStateService;
        const cardsThatGrantUnlimitedHandSize = playerStateService
            .getMatchingBehaviourCards(c => c.grantsUnlimitedHandSize)
            .filter(c => this._canThePlayer.useThisDurationCard(c.id));
        if (cardsThatGrantUnlimitedHandSize.length > 0) {
            return Infinity;
        }

        let stationCards = playerStateService.getStationCards();
        return stationCards
            .filter(card => card.place === 'handSize')
            .length * 3;
    }

    hasReachedMaximumStationCardCapacity() {
        const stationCardCount = this._playerStateService.getStationCardCount();
        return stationCardCount >= this.maxStationCardCount();
    }

    maxStationCardCount() {
        if (this._playerCommanders.has(Commander.FrankJohnson)) {
            const frankJohnson = this._playerCommanders.get(Commander.FrankJohnson);
            return frankJohnson.maxStationCards();
        }
        else {
            return this._gameConfig.maxStationCards();
        }
    }

    canDrawCards() {
        const playerRequirements = this._playerRequirementService;
        if (playerRequirements.isWaitingOnOpponentFinishingRequirement()) return false;
        if (!this._playerPhase.isDraw() && !playerRequirements.firstRequirementIsOfType('drawCard')) return false;

        if (this._playerStateService.deckIsEmpty()) {
            return this._opponentStateService.deckIsEmpty();
        }
        else {
            return true;
        }
    }

    canMill() {
        const playerRequirements = this._playerRequirementService;
        if (playerRequirements.isWaitingOnOpponentFinishingRequirement()) return false;
        if (this._opponentStateService.deckIsEmpty()) return false;

        const hasTheMiller = this._playerCommanders.has(Commander.TheMiller);
        if (!hasTheMiller) return false;

        return this._playerPhase.isDraw()
            || playerRequirements.firstRequirementIsOfType('drawCard');
    }

    canDiscardCards() { //TODO Confusing that you "discard" when you want to "replace". Should ideally be 2 separate things (even if they are both performed on the discard pile).
        const playerRequirements = this._playerRequirementService;
        if (playerRequirements.isWaitingOnOpponentFinishingRequirement()) return false;

        return this.canReplaceCards()
            || playerRequirements.firstRequirementIsOfType('discardCard')
            || this._playerPhase.isDiscard();
    }

    canDiscardActivateDurationCards() {
        return this._turnControl.playerHasControlOfOwnTurn()
            && this._playerPhase.isPreparation();
    }

    canReplaceCards() {
        if (this._matchService.mode() !== MatchMode.game) {
            return this._queryEvents.countReplaces() < this._gameConfig.maxReplaces();
        }
        else if (this._playerCommanders.has(Commander.DrStein)) {
            const currentTurn = this._matchService.getTurn();
            const replacesThisTurn = this._queryEvents.countReplacesOnTurn(currentTurn);

            return this._playerPhase.isAction()
                && replacesThisTurn < this._gameConfig.maxReplaces();
        }

        return false;
    }

    moreCardsCanBeDrawnForDrawPhase() {
        return this.countCardsLeftToDrawForDrawPhase() > 0;
    }

    countCardsLeftToDrawForDrawPhase() {
        let currentTurn = this._matchService.getTurn();
        let cardDrawEvents = this._queryEvents.getCardDrawsOnTurn(currentTurn);
        let cardsToDrawOnTurnCount = this._playerStateService.getStationDrawCardsCount();
        return cardsToDrawOnTurnCount - cardDrawEvents.length;
    }

    _playerHasControlOfTheirOwnActionPhase() {
        return this._turnControl.playerHasControlOfOwnTurn() && this._playerPhase.isAction();
    }
}

module.exports = PlayerRuleService;
