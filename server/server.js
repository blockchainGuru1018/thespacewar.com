const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const SocketIO = require('socket.io');
const wrapControllersWithRejectionProtection = require('./utils/wrapControllersWithRejectionProtection.js');
const SocketRepository = require('./user/SocketRepository.js');
const UserRepository = require('./user/UserRepository.js');
const UserController = require('./user/UserController.js');
const MatchRepository = require('./match/MatchRepository.js');
const MatchController = require('./match/MatchController.js');
const CardController = require('./card/CardController.js');
const GitController = require('./git/GitController.js');
const AssetsController = require('./assets/AssetsController.js');
const ServerRawCardDataRepository = require('./card/ServerRawCardDataRepository.js');
const Logger = require('./utils/Logger.js');
const http = require('http');
const { port } = require('./settings.json');

let app;
let server;
let socketMaster;
let logger = new Logger();

module.exports = {
    start: startServer,
    restart: restartServer
};

async function run({ closeServer, exitProcess, inProduction = false }) {

    const rawCardDataRepository = ServerRawCardDataRepository();

    console.log(' - 1/2 Fetching fresh game data');
    await rawCardDataRepository.init();
    console.log(' - 1/2 SUCCESS');

    const socketRepository = SocketRepository({ socketMaster });
    const userRepository = UserRepository({ socketMaster });
    const deps = {
        logger,
        rawCardDataRepository
    };
    deps.socketRepository = socketRepository;
    deps.userRepository = userRepository;
    deps.matchRepository = MatchRepository(deps);
    deps.inProduction = inProduction;

    const controllers = {
        user: UserController(deps),
        match: MatchController(deps),
        card: CardController(deps),
        git: GitController({ closeServer, exitProcess }),
        assets: AssetsController(deps)
    };
    deps.controllers = controllers;
    const mappedControllers = wrapControllersWithRejectionProtection(controllers);

    setupRoutes(deps, mappedControllers);
    setupSocketConnectionHandler(deps, controllers);
}

function exitProcess() {
    process.exit();
}

function closeServer() {
    server.close();
    server = null;

    socketMaster.close();
    socketMaster = null;

    logger.clear();

    return new Promise(resolve => setTimeout(resolve, 1000));
}

function startServer({ production }) {
    process.env.production = production;

    return new Promise(async resolve => {
        app = express();
        app.use(bodyParser.json());

        server = http.createServer(app);
        socketMaster = SocketIO(server);

        await run({ closeServer, exitProcess, inProduction: !!production });

        console.log(` - 2/2 Setting up server at port ${port}`)
        server.listen(port, () => {
            console.log(` - 2/2 SUCCESS, running on port ${port}\n`)
            resolve();
        });
    });
}

async function restartServer() {
    await closeServer();
    await startServer();
}

function setupRoutes(deps, controllers) {
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'client-dist', 'index.html'));
    });
    app.get('/index.js', (req, res) => {
        res.sendFile(path.join(__dirname, 'client-dist', 'index.js'));
    });
    app.post('/login', controllers.user.login);
    app.get('/user', controllers.user.getAll);
    app.post('/match', controllers.match.create);
    app.get('/match/:matchId/player/:playerId/state', controllers.match.getOwnState);
    app.get('/card/:cardId/image', controllers.card.getImage);
    app.get('/card/back-image', controllers.card.getBackImage);
    app.get('/card/data', controllers.card.getData);

    app.post('/git/push', controllers.git.onPush);

    app.get('/icon/:iconName', controllers.assets.getIcon);
    app.get('/image/:imageName', controllers.assets.getImage);

    if (!deps.inProduction) {
        app.post('/restart', async (req, res) => {
            await restartServer()
            res.end();
        });
        app.get('/logs', async (req, res) => {
            const matchLogs = deps.logger.readAll();
            res.end(matchLogs);
        });
        app.get('/logs/:type', async (req, res) => {
            const matchLogs = deps.logger.read(type);
            res.end(matchLogs);
        });
    }
}

function setupSocketConnectionHandler(deps, controllers) {
    const socketRepository = deps.socketRepository;
    const matchRepository = deps.matchRepository;

    socketMaster.on('connection', async connection => {
        connection.on('registerConnection', async ({ userId }) => {
            console.log(' -- registering connection for user', userId)
            socketRepository.setForUser(userId, connection);

            const ongoingMatch = matchRepository.getForUser(userId);
            if (ongoingMatch) {
                try {
                    await matchRepository.reconnect({
                        playerId: userId,
                        matchId: ongoingMatch.id
                    });
                } catch (error) {
                    console.error('Error when registering connection for user: ' + error.message);
                    console.info('Raw error:', error);
                }
            }
        });

        connection.on('match', async data => {
            try {
                await controllers.match.onAction(data);
            } catch (error) {
                const rawErrorMessage = JSON.stringify(error, null, 4);
                const dataString = JSON.stringify(data, null, 4);
                const errorMessage = `(${new Date().toISOString()}) Error in action to match: ${error.message} - DATA: ${dataString} - RAW ERROR: ${rawErrorMessage}`
                deps.logger.log(errorMessage, 'error');
                deps.logger.log(error.stack, 'error-stack');
            }
        });
    });
}