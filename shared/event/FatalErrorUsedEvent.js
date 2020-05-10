function FatalErrorUsed({ turn, phase, targetCardCommonId }) {
    return {
        type: FatalErrorUsed.Type,
        created: Date.now(),
        turn,
        phase,
        targetCardCommonId
    };
}

FatalErrorUsed.Type = 'fatalErrorUsed';

module.exports = FatalErrorUsed;
