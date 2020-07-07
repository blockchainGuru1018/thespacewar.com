const CheatError = require("../../server/match/CheatError.js");
const EnergyShield = require("../card/EnergyShield.js");
const Commander = require("./commander/Commander");

function StartGameController({
    gameConfig,
    matchService,
    playerStateService,
    playerRequirementService,
    playerPhase,
    playerRuleService,
    playerCommanders,
    playerActionLog,
    opponentActionLog,
    opponentStateService,
    opponentRequirementService,
    opponentPhase,
}) {
    return {
        selectPlayerToStart,
        selectStartingStationCard,
        startedGame,
    };

    function selectPlayerToStart(playerToStartId) {
        const playerId = playerStateService.getPlayerId();

        const playerToStartPhaseService =
            playerToStartId === playerId ? playerPhase : opponentPhase;
        playerToStartPhaseService.selectToStart();

        const secondPlayerRequirementService = playerStateService.isFirstPlayer()
            ? opponentRequirementService
            : playerRequirementService;
        secondPlayerRequirementService.addDrawCardRequirement({ count: 1 });

        playerStateService.readyForSelectingStationCards();
        opponentStateService.readyForSelectingStationCards();

        matchService.startSelectingStationCards();
    }

    function selectStartingStationCard({ cardId, location }) {
        if (!playerRuleService.canPutDownMoreStartingStationCards())
            throw new CheatError("Cannot put down more starting station cards");
        if (!playerStateService.hasCardOnHand(cardId))
            throw new CheatError("Card is not on hand");

        playerStateService.selectStartingStationCard(cardId, location);
    }

    function startedGame() {
        if (
            gameConfig.niciaSatuStartsWithEnergyShield() &&
            playerCommanders.has(Commander.NiciaSatu)
        ) {
            let energyShield;
            playerStateService.useDeck((deck) => {
                energyShield = deck.removeFirstCardOfType(
                    EnergyShield.CommonId
                );
            });
            if (energyShield) {
                playerStateService.putDownCardInZone(energyShield, {
                    grantedForFreeByEvent: true,
                });

                opponentActionLog.opponentReceivedCardFromCommander(
                    EnergyShield.CommonId
                );
                playerActionLog.receivedCardFromCommander(
                    EnergyShield.CommonId
                );
            }
        }
    }
}

module.exports = StartGameController;
