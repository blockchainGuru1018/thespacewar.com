const Vue = require('vue');
const Vuex = require('vuex');
const SocketCommander = require('./SocketCommander.js');
const Router = require('./Router.js');
const RootStore = require('./RootStore.js');
const UserRepository = require('./users/UserRepository.js');
const LoginPage = require('./login/LoginPage.js');
const LobbyPage = require('./lobby/LobbyPage.js');
const MatchPage = require('./match/MatchPage.js');
const MatchRepository = require('./match/MatchRepository.js');
const MatchControllerFactory = require('./match/MatchControllerFactory.js');

let socket;
let socketCommander;
let userRepository;
let matchRepository;
let rootStore;

Vue.use(Vuex);
bootstrap();

function bootstrap() {
    socket = io();
    socketCommander = SocketCommander({ socket });

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
        socketCommander,
        rootStore
    };
    const router = Router({ pagesByName, pageDependencies });

    router.route('login');
}

function createStores() {
    return RootStore({ socketCommander });
}