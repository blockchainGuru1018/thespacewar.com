const Vue = require('vue');
const Vuex = require('vuex');
const PortalVue = require('portal-vue');
const vClickOutside = require('v-click-outside');
const Router = require('./Router.js');
const RootStore = require('./RootStore.js');
const UserRepository = require('./users/UserRepository.js');
const LoginPage = require('./login/LoginPage.js');
const LobbyPage = require('./lobby/LobbyPage.js');
const MatchPage = require('./match/MatchPage.js');
const MatchRepository = require('./match/MatchRepository.js');
const MatchControllerFactory = require('./match/MatchControllerFactory.js');
const CardDataAssembler = require('../shared/CardDataAssembler.js');
const CardInfoRepository = require('../shared/CardInfoRepository.js');

let socket;
let userRepository;
let matchRepository;
let cardDataAssembler;
let cardInfoRepository;
let rootStore;

Vue.use(Vuex);
Vue.use(PortalVue);
Vue.use(vClickOutside);
bootstrap();

function bootstrap() {
    socket = io();

    cardDataAssembler = CardDataAssembler();
    cardInfoRepository = CardInfoRepository({ cardDataAssembler });
    userRepository = UserRepository({ socket });
    matchRepository = MatchRepository({
        socket,
        userRepository
    });

    rootStore = createStores();

    initRouter();
}

function initRouter() {
    const pagesByName = {
        'lobby': LobbyPage,
        'login': LoginPage,
        'match': MatchPage
    };
    const pageDependencies = {
        userRepository,
        matchRepository,
        matchControllerFactory: MatchControllerFactory({
            socket,
            userRepository
        }),
        cardInfoRepository,
        rootStore
    };
    const router = Router({ pagesByName, pageDependencies });

    router.route('login');
}

function createStores() {
    return RootStore();
}