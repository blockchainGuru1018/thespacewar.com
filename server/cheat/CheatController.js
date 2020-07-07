const { DebugPassword } = require("../semi-secret.js");

module.exports = function ({ matchRepository }) {
  return {
    cheat,
  };

  async function cheat(req, res) {
    //TODO Need to check for user permissions to matchId, but has to wait until a login system is in place
    const { type, data, playerId, matchId, password } = req.body;
    if (password !== DebugPassword) {
      res.json("Invalid password");
      return;
    }

    const match = await matchRepository.getById(matchId);
    const result = match.cheat(playerId, { type, data });
    if (result) {
      res.json(result);
    } else {
      res.json(false);
    }
  }
};
