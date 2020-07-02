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
        queryPlayerRequirements,
        playerRequirementService,
        playerPhase,
        turnControl,
        gameConfig,
        queryEvents,
        playerCommanders,
        countCardsLeftToDrawForDrawPhase,
        moreCardsCanBeDrawnForDrawPhase
    } = {}) {
        this._matchService = matchService;
        this._playerStateService = playerStateService;
        this._queryPlayerRequirements = queryPlayerRequirements;
        this._playerRequirementService = playerRequirementService;
        this._turnControl = turnControl;
        this._playerPhase = playerPhase;
        this._opponentStateService = opponentStateService;
        this._canThePlayer = canThePlayer;
        this._canTheOpponent = canTheOpponent;
        this._gameConfig = gameConfig;
        this._playerCommanders = playerCommanders;
        this._queryEvents = queryEvents;

        this.countCardsLeftToDrawForDrawPhase = countCardsLeftToDrawForDrawPhase;
        this.moreCardsCanBeDrawnForDrawPhase = moreCardsCanBeDrawnForDrawPhase;
    }

    canPutDownCardsInHomeZone() { // TODO Could be a confusing method name as event cards are put down in home zone but graphically they are put down in an "Activate" zone.
        if (!this._matchService.isGameOn()) return false;
        if (this._queryPlayerRequirements.hasAnyRequirements()) return false;
        if (this._queryPlayerRequirements.isWaitingOnOpponentFinishingRequirement()) return false;
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

        if (this._queryPlayerRequirements.hasAnyRequirements()) return false;
        if (this._queryPlayerRequirements.isWaitingOnOpponentFinishingRequirement()) return false;

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

    amountOfStartingStationCardsSelected() {
        return this._playerStateService.getUnflippedStationCardsCount();
    }

    canPutDownMoreStationCardsThisTurn() {
        const currentTurn = this._matchService.getTurn();

        const extraFreeStationCards = this._queryEvents.countFreeExtraStationCardsGrantedOnTurn(currentTurn);
        const totalAllowedStationCards = extraFreeStationCards + ALLOWED_STATION_CARDS_EACH_TURN;

        const putDownStationCards = this._queryEvents.countRegularStationCardsPutDownOnTurn(currentTurn);
        return putDownStationCards < totalAllowedStationCards;
    }

    canPutDownEventCards() {
        return !this._opponentHasCardPreventingEventCardsBeingPlayed();
    }

    _opponentHasCardPreventingEventCardsBeingPlayed() {
        const cards = this._opponentStateService.getMatchingBehaviourCards(card => card.preventsOpponentFromPlayingAnEventCard);
        return cards.length > 0;
    }

    getMaximumHandSize() {
        const playerStateService = this._playerStateService;
        const cardsThatGrantUnlimitedHandSize = playerStateService
            .getMatchingBehaviourCards(c => c.grantsUnlimitedHandSize)
            .filter(c => this._canThePlayer.useThisDurationCard(c.id));
        if (cardsThatGrantUnlimitedHandSize.length > 0) {
            return Infinity;
        }

        const stationCards = playerStateService.getStationCards();
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
        if (this._queryPlayerRequirements.isWaitingOnOpponentFinishingRequirement()) return false;
        if (!this._playerPhase.isDraw() && !this._queryPlayerRequirements.firstRequirementIsOfType('drawCard')) return false;
        if (this._playerStateService.deckIsEmpty()) return false;

        return true;
    }

    canDiscardCards() { //TODO Confusing that you "discard" when you want to "replace". Should ideally be 2 separate things (even if they are both performed on the discard pile).
        if (this._queryPlayerRequirements.isWaitingOnOpponentFinishingRequirement()) return false;

        return this.canReplaceCards()
            || this._queryPlayerRequirements.firstRequirementIsOfType('discardCard')
            || this._playerPhase.isDiscard();
    }

    canDiscardActivateDurationCards() {
        return this._turnControl.playerHasControlOfOwnTurn()
            && this._playerPhase.isPreparation();
    }

    canReplaceCards() {
        if(this._canReplaceCardAtStartOfGame()){
            return this._queryEvents.countReplaces() < this._gameConfig.maxReplaces()
        }  
        if(this._canTriggerDrSteinEffect()){
            const currentTurn = this._matchService.getTurn();
            const replacesThisTurn = this._queryEvents.countReplacesOnTurn(currentTurn);
            return replacesThisTurn < this._gameConfig.maxReplaces();
        }
        return false;
    }

    _canReplaceCardAtStartOfGame (){
        return !this._gameHasStarted() && this._gameConfig.recycleAtStartOfGame()
    }

    _gameHasStarted(){
        return this._matchService.mode() === MatchMode.game;
    }

    _canTriggerDrSteinEffect(){
        return this._playerCommanders.has(Commander.DrStein) && this._playerPhase.isAction()
    }

    _playerHasControlOfTheirOwnActionPhase() {
        return this._turnControl.playerHasControlOfOwnTurn() && this._playerPhase.isAction();
    }
}

module.exports = PlayerRuleService;
