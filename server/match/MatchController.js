module.exports = function (deps) {

    const matchRepository = deps.matchRepository;

    return {
        create,
        getOwnState,
        onAction
    }

    async function create(req, res) {
        const playerId = req.body.playerId;
        const opponentId = req.body.opponentId;
        const match = await matchRepository.create({ playerId, opponentId });
        res.json(match);
    }

    async function getOwnState(req, res) {
        const matchId = req.params.matchId;
        const playerId = req.params.playerId;
        const match = await matchRepository.getById(matchId);
        const state = match.getOwnState(playerId);
        res.json(state);
    }

    async function onAction(data) {
        const match = await matchRepository.getById(data.matchId);
        if (!match) {
            throw new Error('Cannot find ongoing match with id');
        }

        match[data.action](data.playerId, data.value);
    }
}