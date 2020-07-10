export default function () {
  return {
    namespaced: true,
    name: "guest",
    actions: {
      playAgainstAi,
    },
  };

  async function playAgainstAi({ dispatch, rootGetters }) {
    const checkIfLoggedInAsGuest = rootGetters["login/checkIfLoggedInAsGuest"];

    const loggedInAsGuest = await checkIfLoggedInAsGuest();
    if (!loggedInAsGuest) {
      await dispatch("login/loginAsGuest", null, { root: true });
    }

    await dispatch("lobby/startGameWithBot", null, { root: true });
  }
}
