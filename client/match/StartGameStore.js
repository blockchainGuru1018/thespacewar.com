const Commander = require("../../shared/match/commander/Commander.js");
const commandersRows = {
  Regular: [
    { name: "Liana Henders", value: Commander.LianaHenders },
    { name: "Frank Johnson", value: Commander.FrankJohnson },
    { name: "Keve Bakins", value: Commander.KeveBakins },
    { name: "Nicia Satu", value: Commander.NiciaSatu },
    { name: "General Jackson", value: Commander.GeneralJackson },
    { name: "The Miller", value: Commander.TheMiller },
  ],
  TheSwarm: [
    { name: "Zuuls", value: Commander.Zuuls },
    { name: "Crakux", value: Commander.Crakux },
    { name: "Staux", value: Commander.Staux },
    { name: "Naalox", value: Commander.Naalox },
  ],
  AllCommander: [
    {
      id: 0,
      value: [{ name: "Liana Henders", value: Commander.FrankJohnson }],
    },
    {
      id: 1,
      value: [{ name: "Frank Johnson", value: Commander.FrankJohnson }],
    },
    { id: 2, value: [{ name: "Keve Bakins", value: Commander.KeveBakins }] },
    { id: 3, value: [{ name: "Nicia Satu", value: Commander.NiciaSatu }] },
    {
      id: 4,
      value: [{ name: "General Jackson", value: Commander.GeneralJackson }],
    },
    { id: 5, value: [{ name: "Dr.Stein", value: Commander.DrStein }] },
    { id: 6, value: [{ name: "The Miller", value: Commander.TheMiller }] },
    { id: 7, value: [{ name: "Zuuls", value: Commander.Zuuls }] },
    { id: 8, value: [{ name: "Crakux", value: Commander.Crakux }] },
    { id: 9, value: [{ name: "Naalox", value: Commander.Naalox }] },
    { id: 10, value: [{ name: "Staux", value: Commander.Staux }] },
    {
      id: 11,
      value: [{ name: "Capt. Shera Kinson", value: Commander.FrankJohnson }],
    },
    {
      id: 12,
      value: [{ name: "Capt. Wayne Mccarter", value: Commander.FrankJohnson }],
    },
    { id: 13, value: [{ name: "Zyre", value: Commander.FrankJohnson }] },
  ],
  UnitedStars: [
    { name: "Dr.Stein", value: Commander.DrStein },
  ]
};
module.exports = function ({ matchController }) {
  return {
    namespaced: true,
    name: "startGame",
    state: {
      localPlayerHasRegisteredAsReady: false,
      commanderSelectionHidden: false,
    },
    getters: {
      playerHasRegisteredAsReady,
      commanderCardsVisible,
      canSelectCommander,
      commandersOptionsRows,
      commandersOptions,
      readyButtonVisible,
      _doneSelectingStationCards,
    },
    actions: {
      playerReady,
      selectCommander,
    },
  };

  function playerHasRegisteredAsReady(state, getters, rootState) {
    return (
      state.localPlayerHasRegisteredAsReady ||
      rootState.match.readyPlayerIds.includes(rootState.match.ownUser.id)
    );
  }

  function commanderCardsVisible(state, getters) {
    return getters._doneSelectingStationCards;
  }

  function canSelectCommander(state, getters) {
    return (
      getters._doneSelectingStationCards && !getters.playerHasRegisteredAsReady
    );
  }

  function readyButtonVisible(state, getters, rootState) {
    const hasSelectedCommander = !!rootState.match.commanders[0];
    return hasSelectedCommander && !getters.playerHasRegisteredAsReady;
  }

  function _doneSelectingStationCards(state, getters, rootState, rootGetters) {
    return (
      rootGetters["match/gameOn"] ||
      rootGetters["match/startingStationCardsToPutDownCount"] === 0
    );
  }

  function playerReady({ state }) {
    state.localPlayerHasRegisteredAsReady = true;
    matchController.emit("playerReady");
  }

  //TODO: split on 2 parts
  function commandersOptionsRows(state, getters) {
    return [
      {
        commanderOptions: getters.commandersOptions.slice(
          0,
          getters.commandersOptions.length / 2
        ),
      },
      {
        commanderOptions: getters.commandersOptions.slice(
          getters.commandersOptions.length / 2
        ),
      },
    ];
  }

  function commandersOptions(state, getters, rootState) {
    if (rootState.match.currentDeck === "CustomDeck") {
      const { value } = commandersRows.AllCommander.find(
        (commnader) => commnader.id === rootState.match.customDeck.commander
      );
      return value;
    }
    return (
      commandersRows[rootState.match.currentDeck] || commandersRows["Regular"]
    );
  }

  function selectCommander({ rootState }, commander) {
    rootState.match.commanders = [commander]; //TODO This should not change state of another store directly. Implement a commit or something!
    matchController.emit("selectCommander", { commander }); //TODO This could potentially lead to some lag weird visual behaviour if you quickly select different commanders (as the server would bounce back many results)
  }
};
