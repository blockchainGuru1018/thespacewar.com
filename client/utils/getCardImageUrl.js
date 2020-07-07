const Commander = require("../../shared/match/commander/Commander.js");

const CommanderToImageUrl = {
    [Commander.FrankJohnson]: "https://images.thespacewar.com/commander-1.png",
    [Commander.KeveBakins]: "https://images.thespacewar.com/commander-2.png",
    [Commander.NiciaSatu]: "https://images.thespacewar.com/commander-3.png",
    [Commander.GeneralJackson]:
        "https://images.thespacewar.com/commander-4.png",
    [Commander.DrStein]: "https://images.thespacewar.com/commander-5.png",
    [Commander.TheMiller]: "https://images.thespacewar.com/commander-6.png",
};

module.exports = {
    byCommonId(cardCommonId) {
        return "https://images.thespacewar.com/card-" + cardCommonId + ".jpg";
    },
    forCommander(commander) {
        return CommanderToImageUrl[commander];
    },
};
