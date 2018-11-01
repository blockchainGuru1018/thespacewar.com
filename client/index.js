const Vue = require('vue');
const Vuex = require('vuex');
const Router = require('./Router.js');
const RootStore = require('./RootStore.js');
const UserRepository = require('./users/UserRepository.js');
const LoginPage = require('./login/LoginPage.js');
const LobbyPage = require('./lobby/LobbyPage.js');
const MatchPage = require('./match/MatchPage.js');
const MatchRepository = require('./match/MatchRepository.js');
const MatchControllerFactory = require('./match/MatchControllerFactory.js');
const CardFactory = require('../shared/CardFactory.js');
const CardInfoRepository = require('../shared/CardInfoRepository.js');

let socket;
let userRepository;
let matchRepository;
let cardFactory;
let cardInfoRepository;
let rootStore;

Vue.use(Vuex);
bootstrap();

function bootstrap() {
    socket = io();

    cardFactory = CardFactory();
    cardInfoRepository = CardInfoRepository({ cardFactory });
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