const CheatError = require('./CheatError.js');
const failIfThrows = require('./failIfThrows.js');

module.exports = function ({
    card,
    playerStateService,
    playerRuleService,
}) {
    return ({ withError = false }) => {
        if (withError) return check();
        return failIfThrows(check);
    };

    function check() {
        const nameOfCardSource = playerStateService.nameOfCardSource(card.id);
        const isInStation = nameOfCardSource.startsWith('station');
        const isInHand = nameOfCardSource !== 'hand';
        if (isInHand && !isInStation) {
            throw new CheatError('Cannot move card from zone to station');
        }

        if (!playerRuleService.canPutDownStationCards()) {
            throw new CheatError('Cannot put down card');
        }

        if (!card.canBePutDownAsExtraStationCard && !playerRuleService.canPutDownMoreStationCardsThisTurn()) {
            throw new CheatError('Cannot put down more station cards this turn');
        }
    }
};
