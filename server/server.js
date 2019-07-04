const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const SocketIO = require('socket.io');
const wrapControllersWithRejectionProtection = require('./utils/wrapControllersWithRejectionProtection.js');
const SecurityController = require('./user/SecurityController.js');
const SocketRepository = require('./user/SocketRepository.js');
const UserRepository = require('./user/UserRepository.js');
const UserController = require('./user/UserController.js');
const MatchFactory = require('./match/MatchFactory.js');
const MatchRepository = require('./match/MatchRepository.js');
const MatchController = require('./match/MatchController.js');
const CardController = require('./card/CardController.js');
const CheatController = require('./cheat/CheatController.js');
const GitController = require('./git/GitController.js');
const AssetsController = require('./assets/AssetsController.js');
const ServerRawCardDataRepository = require('./card/ServerRawCardDataRepository.js');
const GameConfig = require('../shared/match/GameConfig.js');
const Logger = require('./utils/Logger.js');
const http = require('http');
const { port } = require('./settings.json');
const { DebugPassword } = require('./semi-secret.js');

let inDevelopment;
let app;
let server;
let socketMaster;
let logger = new Logger();

let restartListener = () => {};

module.exports = {
    onRestart,
    start: startServer,
    close: closeServer,
    restart: restartServer
};

function onRestart(listener) {
    restartListener = listener;
}

function startServer(config) {
    inDevelopment = config.inDevelopment;

    return new Promise(async resolve => {
        app = express();
        app.use(bodyParser.json());

        server = http.createServer(app);
        socketMaster = SocketIO(server);

        await run({ config, closeServer, exitProcess });

        console.log(` - 2/2 Setting up server at port ${port}`)
        server.listen(port, () => {
            console.log(` - 2/2 SUCCESS, running on port ${port}\n`)
            resolve();
        });
    });
}

function closeServer() {
    server.close();
    server = null;

    socketMaster.close();
    socketMaster = null;

    logger.clear();

    return new Promise(resolve => setTimeout(resolve, 1000));
}

async function restartServer() {
    restartListener();
}

async function run({ config, closeServer, exitProcess }) {
    const rawCardDataRepository = ServerRawCardDataRepository();

    console.log(' - 1/2 Fetching fresh game data');
    await rawCardDataRepository.init();
    console.log(' - 1/2 SUCCESS');

    //1st level dependencies
    const deps = {
        logger,
        rawCardDataRepository,
        gameConfig: GameConfig.fromConfig(config.gameConfig),
        userRepository: UserRepository({ socketMaster }),
        socketRepository: SocketRepository({ socketMaster })
    };

    //2nd level dependencies
    deps.securityController = SecurityController(deps);
    deps.matchFactory = MatchFactory(deps);

    //3rd level dependencies
    deps.matchRepository = MatchRepository(deps);

    //4th level dependencies
    const controllers = {
        user: UserController(deps),
        match: MatchController(deps),
        card: CardController(deps),
        git: GitController({ closeServer, exitProcess }),
        assets: AssetsController(deps),
        cheat: CheatController(deps)
    };
    deps.controllers = controllers;
    const mappedControllers = wrapControllersWithRejectionProtection(controllers);

    setupRoutes(deps, mappedControllers);
    setupSocketConnectionHandler(deps, controllers);
}

function exitProcess() {
    process.exit();
}

function setupRoutes(deps, controllers) {
    let lastCheckTime = 0;

    app.use(deps.securityController.middleware);

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'client-dist', 'index.html'));
    });
    app.get('/index.js', (req, res) => {
        res.sendFile(path.join(__dirname, 'client-dist', 'index.js'));
    });
    app.post('/login', controllers.user.login);
    app.post('/test-access-key', controllers.user.testAccessKey);
    app.get('/user', controllers.user.getAll);
    app.post('/match', controllers.match.create);
    app.get('/match/:matchId/player/:playerId/state', controllers.match.getOwnState);
    app.get('/card/:cardId/image', controllers.card.getImage);
    app.get('/card/back-image', controllers.card.getBackImage);
    app.get('/card/data', controllers.card.getData);

    app.post('/git/push', controllers.git.onPush);

    app.get('/font/:fontName', controllers.assets.getFont);
    app.get('/icon/:iconName', controllers.assets.getIcon);
    app.get('/image/:imageName', controllers.assets.getImage);
    app.get('/sound/:soundName', controllers.assets.getSound);

    app.post('/test-debug', (req, res) => {
        res.json({ valid: validateDebugPassword(req.body.password) });
        lastCheckTime = Date.now();
    });
    app.post('/cheat', controllers.cheat.cheat);
    app.post('/restart', async (req, res) => {
        if (validateDebugPassword(req.body.password)) {
            await restartServer();

            setTimeout(() => {
                res.redirect('/');
            }, 3000);
        }
        else {
            res.json({ text: 'Invalid password' });
        }
    });

    app.post('/master-log', (req, res) => {
        if (validateDebugPassword(req.body.password)) {
            const masterLog = deps.logger.readMasterLog();
            res.json({ text: masterLog });
        }
        else {
            res.json({ text: `Invalid password` });
        }
    });

    function validateDebugPassword(password) {
        const timeSinceLastCheck = Date.now() - lastCheckTime;
        if (timeSinceLastCheck < 3 * 1000) {
            return false;
        }
        else {
            return password === DebugPassword;
        }
    }
}

function setupSocketConnectionHandler(deps, controllers) {
    const socketRepository = deps.socketRepository;
    const matchRepository = deps.matchRepository;
    const securityController = deps.securityController;

    socketMaster.on('connection', async connection => {
        connection.on('registerConnection', async ({ secret, userId }) => {
            if (!securityController.isAuthorized(secret, userId)) {
                deps.logger.log('Unauthorized user performing action on match', 'authorization');
                return;
            }

            socketRepository.setForUser(userId, connection);

            const ongoingMatch = matchRepository.getForUser(userId);
            if (ongoingMatch) {
                try {
                    await matchRepository.reconnect({
                        playerId: userId,
                        matchId: ongoingMatch.id
                    });
                }
                catch (error) {
                    deps.logger.log('Error when registering connection for user: ' + error.message, 'reconnect error');
                    deps.logger.log('Raw error: ' + error, 'reconnect error');
                }
            }
        });

        connection.on('match', async data => {
            if (!securityController.isAuthorized(data.secret, data.playerId)) {
                deps.logger.log('Unauthorized user performing action on match', 'authorization');
                return;
            }

            try {
                await controllers.match.onAction(data);
            }
            catch (error) {
                const rawErrorMessage = JSON.stringify(error, null, 4);
                const dataString = JSON.stringify(data, null, 4);
                const errorMessage = `(${new Date().toISOString()}) Error in action to match: ${error.message} - DATA: ${dataString} - RAW ERROR: ${rawErrorMessage}`
                deps.logger.log(errorMessage, 'error');
                deps.logger.log(error.stack, 'error-stack');
            }
        });
    });
}
