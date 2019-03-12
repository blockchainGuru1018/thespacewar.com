module.exports = function ({ matchRepository }) {

    return {
        cheat
    };

    async function cheat(req, res) {
        //TODO Need to check for user permissions to matchId, but has to wait until a login system is in place
        const { type, data, playerId, matchId } = req.body;
        const match = await matchRepository.getById(matchId);
        match.cheat(playerId, { type, data });

        res.end();
    }
};