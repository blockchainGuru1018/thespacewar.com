const Vue = require('vue');
const Vuex = require('vuex');
const PortalVue = require('portal-vue');
const vClickOutside = require('v-click-outside');
const Router = require('./Router.js');
const RootStore = require('./RootStore.js');
const UserRepository = require('../users/UserRepository.js');
const ConfigRepository = require('../config/ConfigRepository.js');
const StartPage = require('../start/StartPage.js');
const LoadingStore = require('../loading/LoadingStore.js');
const LoginStore = require('../login/LoginStore.js');
const LobbyStore = require('../lobby/LobbyStore.js');
const GuestStore = require('../guest/GuestStore.js').default;
const MatchPage = require('../match/MatchPage.js');
const MatchRepository = require('../match/MatchRepository.js');
const MatchControllerFactory = require('../match/MatchControllerFactory.js');
const ClientRawCardDataRepository = require('../card/ClientRawCardDataRepository.js');
const CardDataAssembler = require('../../shared');
const CardInfoRepository = require('../../shared/CardInfoRepository.js');
const UserStore = require('../users/UserStore.js');
const ConfigStore = require('../config/ConfigStore');
const AudioStore = require('../match/audio/AudioStore.js');
const BotUpdateListener = require('../ai/BotUpdateListener.js');
const localGameDataFacade = require('../utils/localGameDataFacade.js');
const ajax = require('../utils/ajax.js');
require('../utils/cheatEngine.js');

let UserAuth = require('../../shared/user/UserAuth.js');
let Cookie = require('cookie-reader');
let retrieveSession = require('../../shared/session/retrieveSession.js');

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
    const router = Router({pagesByName, pageDependencies});
    const rawCardDataRepository = ClientRawCardDataRepository();
    const rootStore = RootStore();
    Object.assign(pageDependencies, {
        socket,
        rawCardDataRepository,
        router,
        rootStore
    });

    // 2nd order dependencies
    const configRepository = ConfigRepository({socket});
    const userRepository = UserRepository({socket});
    const cardDataAssembler = CardDataAssembler({rawCardDataRepository});
    Object.assign(pageDependencies, {
        cardDataAssembler,
        configRepository,
        userRepository
    });

    // 3rd order dependencies
    const cardInfoRepository = CardInfoRepository({cardDataAssembler});
    const matchRepository = MatchRepository({socket, userRepository});
    const matchControllerFactory = MatchControllerFactory({socket, userRepository})
    Object.assign(pageDependencies, {
        cardInfoRepository,
        matchRepository,
        matchControllerFactory
    });

    // 4th order dependencies, page bootstrapping
    const botUpdateListener = BotUpdateListener({
        socket,
        rawCardDataRepository
    });
    const stores = [
        ConfigStore({rootStore, configRepository}),
        LoadingStore({rootStore, pageDependencies}),
        LoginStore({route: router.route, rootStore, userRepository, botUpdateListener}),
        LobbyStore({route: router.route, rootStore, userRepository, matchRepository, botUpdateListener, retrieveSession: retrieveSession({Cookie, UserAuth})}),
        GuestStore(),
        UserStore({rootStore, userRepository}),
        AudioStore(),
    ];
    for (const store of stores) {
        rootStore.registerModule(store.name, store);
    }
    for (const store of stores) {
        if (store.actions && store.actions.init) {
            rootStore.dispatch(`${store.name}/init`);
        }
    }

    router.route('start', {pageDependencies});
}

window.loginDebug = password => {
    localGameDataFacade.DebugPassword.set(password);
};

window.readMasterLog = () => {
    (async () => {
        const password = localGameDataFacade.DebugPassword.get();
        const {text} = await ajax.jsonPost('/master-log', {password: password});
        console.info('-----------');
        console.info(text);
        console.info('-----------');
    })();
};
