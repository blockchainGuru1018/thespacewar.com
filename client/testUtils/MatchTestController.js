const resolveModuleWithPossibleDefault = require('../utils/resolveModuleWithPossibleDefault.js');
const Vuex = resolveModuleWithPossibleDefault(require('vuex'));
const FakeUserRepository = require('./FakeUserRepository.js');
const FakeMatchControllerFactory = require('./FakeMatchControllerFactory.js');
const FakeMatchController = require('./FakeMatchController.js');
const cardsJson = require('../../server/card/rawCardData.cache.json').data;
const {mount, createLocalVue} = require('@vue/test-utils');

const MatchView = resolveModuleWithPossibleDefault(require('../match/Match.vue'));
const MatchStores = require('../match/MatchStores.js');
const PortalVue = resolveModuleWithPossibleDefault(require('portal-vue'));
const vClickOutside = resolveModuleWithPossibleDefault(require('v-click-outside'));

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(PortalVue);
localVue.use(vClickOutside);

const dummyCardInfoRepository = {
    getType() { },
    getCost() { },
    getImageUrl() { }
};

module.exports = function TestController({ playerIds = ['P1A', 'P2A'], matchId = 'M1A', ...pageDeps } = {}) {
    const store = new Vuex.Store({strict: false});
    registerFakeAudioModule(store);

    const [ownId, opponentId] = playerIds;
    const matchController = pageDeps.matchController || FakeMatchController();

    pageDeps.matchControllerFactory = pageDeps.matchControllerFactory || FakeMatchControllerFactory({ matchController });
    pageDeps.userRepository = pageDeps.userRepository || FakeUserRepository({ ownUser: { id: ownId } });
    pageDeps.cardInfoRepository = pageDeps.cardInfoRepository || dummyCardInfoRepository;
    pageDeps.rawCardDataRepository = { init() { }, get: () => cardsJson };
    pageDeps.rootStore = store;

    MatchStores({ ...pageDeps, rootStore: store, matchId, opponentUser: { id: opponentId } });
    let wrapper;

    return {
        dispatch(...args) {
            pageDeps.matchControllerFactory.getStoreDispatch()(...args);
        },
        showPage() {
            wrapper = mount(MatchView, {
                store,
                localVue,
                attachToDocument: true
            });
        },
        tearDown() {
            wrapper.destroy();
        }
    };
};

function registerFakeAudioModule(rootStore) {
    rootStore.registerModule('audio', {
        namespaced: true,
        actions: {
            background() {}
        }
    });
}
