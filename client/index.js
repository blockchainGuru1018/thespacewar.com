const Vue = require('vue');
const Vuex = require('vuex');
const PortalVue = require('portal-vue');
const vClickOutside = require('v-click-outside');
const Router = require('./Router.js');
const RootStore = require('./RootStore.js');
const UserRepository = require('./users/UserRepository.js');
const StartPage = require('./start/StartPage.js');
const LoadingStore = require('./loading/LoadingStore.js');
const LoginStore = require('./login/LoginStore.js');
const LobbyStore = require('./lobby/LobbyStore.js');
const MatchPage = require('./match/MatchPage.js');
const MatchRepository = require('./match/MatchRepository.js');
const MatchControllerFactory = require('./match/MatchControllerFactory.js');
const ClientRawCardDataRepository = require('./card/ClientRawCardDataRepository.js');
const CardDataAssembler = require('../shared/CardDataAssembler.js');
const CardInfoRepository = require('../shared/CardInfoRepository.js');
const UserStore = require('./users/UserStore.js');
const AudioStore = require('./match/audio/AudioStore.js');//TODO Move audio folder outside of match folder
require('./utils/cheatEngine.js');

Vue.use(Vuex);
Vue.use(PortalVue);
Vue.use(vClickOutside);
bootstrap();

function bootstrap() {
    const pagesByName = {
        'start': StartPage,
        'match': MatchPage
    };

    const pageDependencies = {};

    // 1st order dependencies
    const socket = io();
    const router = Router({ pagesByName, pageDependencies });
    const rawCardDataRepository = ClientRawCardDataRepository();
    const rootStore = RootStore();
    Object.assign(pageDependencies, {
        socket,
        rawCardDataRepository,
        router,
        rootStore
    });

    // 2nd order dependencies
    const userRepository = UserRepository({ socket });
    const cardDataAssembler = CardDataAssembler({ rawCardDataRepository });
    Object.assign(pageDependencies, {
        cardDataAssembler,
        userRepository
    });

    // 3rd order dependencies
    const cardInfoRepository = CardInfoRepository({ cardDataAssembler });
    const matchRepository = MatchRepository({ socket, userRepository });
    const matchControllerFactory = MatchControllerFactory({ socket, userRepository })
    Object.assign(pageDependencies, {
        cardInfoRepository,
        matchRepository,
        matchControllerFactory
    });

    // 4th order dependencies, page bootstrapping
    const stores = [
        LoadingStore({ rootStore, pageDependencies }),
        LoginStore({ route: router.route, rootStore, userRepository }),
        LobbyStore({ route: router.route, rootStore, userRepository, matchRepository }),
        UserStore({ rootStore, userRepository }),
        AudioStore()
    ];
    for (let store of stores) {
        rootStore.registerModule(store.name, store);
    }
    for (let store of stores) {
        if (store.actions && store.actions.init) {
            rootStore.dispatch(`${store.name}/init`);
        }
    }

    router.route('start', { pageDependencies });
}