const getCardImageUrl = require("../utils/getCardImageUrl.js");

module.exports = function ({ pageDependencies }) {
  let progressIntervalId = null;
  const rawCardDataRepository = pageDependencies.rawCardDataRepository;
  const cardDataAssembler = pageDependencies.cardDataAssembler;

  return {
    namespaced: true,
    name: "loading",
    state: {
      loaded: false,
      progress: 0,
    },
    getters: {
      loadingDone,
    },
    actions: {
      load,
      initFakeLoadingProgress,
    },
  };

  function loadingDone(state) {
    return state.progress >= 140 && state.loaded;
  }

  async function load({ state, dispatch }) {
    dispatch("initFakeLoadingProgress");
    state.loaded = false;

    await Promise.all([
      dispatch("login/authenticateUserSession", null, { root: true }),
      loadAllImages(),
    ]);

    state.loaded = true;
  }

  function initFakeLoadingProgress({ state, getters }) {
    progressIntervalId = setInterval(() => {
      state.progress +=
        Math.random() < 0.5 ? (Math.random() < 0.5 ? 0.4 : 0.8) : 1.6;
      // state.progress += 100;
      if (getters.loadingDone) {
        clearInterval(progressIntervalId);
      }
    }, 10);
  }

  async function loadAllImages() {
    await rawCardDataRepository.init();

    const sources = cardDataAssembler
      .createLibrary()
      .map((cardData) => getCardImageUrl.byCommonId(cardData.commonId));
    await Promise.all(sources.map(loadImage));
  }

  function loadImage(source) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = resolve;
      image.src = source;
    });
  }
};
