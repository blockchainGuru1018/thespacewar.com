const resolveModuleWithPossibleDefault = require('../../client/utils/resolveModuleWithPossibleDefault.js');
const Vuex = resolveModuleWithPossibleDefault(require('vuex'));
const FakeUserRepository = require('./FakeUserRepository.js');
const FakeMatchControllerFactory = require('./FakeMatchControllerFactory');
const FakeMatchController = require('./FakeMatchController');
const MatchPage = require('../../client/match/MatchPage.js');
const cardsJson = require('../../server/card/rawCardData.cache.json').data;

const dummyCardInfoRepository = {
    getType() { },
    getCost() { },
    getImageUrl() { }
};

module.exports = function TestController({ playerIds = ['P1A', 'P2A'], matchId = 'M1A', ...pageDeps } = {}) {
    const store = new Vuex.Store({});
    const [ownId, opponentId] = playerIds;
    const matchController = pageDeps.matchController || FakeMatchController();

    pageDeps.matchControllerFactory = pageDeps.matchControllerFactory || FakeMatchControllerFactory({ matchController });
    pageDeps.userRepository = pageDeps.userRepository || FakeUserRepository({ ownUser: { id: ownId } });
    pageDeps.cardInfoRepository = pageDeps.cardInfoRepository || dummyCardInfoRepository;
    pageDeps.rawCardDataRepository = { init() { }, get: () => cardsJson };
    pageDeps.rootStore = store;

    const page = MatchPage(pageDeps);

    return {
        dispatch(...args) {
            pageDeps.matchControllerFactory.getStoreDispatch()(...args);
        },
        showPage() {
            page.show({ matchId, opponentUser: { id: opponentId } });
        },
        tearDown() {
            page.hide();
        }
    };
};