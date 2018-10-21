const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const SocketIO = require('socket.io');
const SocketRepository = require('./user/SocketRepository.js');
const UserRepository = require('./user/UserRepository.js');
const UserController = require('./user/UserController.js');
const MatchRepository = require('./match/MatchRepository.js');
const MatchController = require('./match/MatchController.js');
const CardController = require('./card/CardController.js');
const http = require('http');
const { port } = require('./settings.json');

const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);
const socketMaster = SocketIO(server);

run();

function run() {
    const socketRepository = SocketRepository({ socketMaster });
    const userRepository = UserRepository({ socketMaster });
    const deps = {
        socketRepository,
        userRepository,
        matchRepository: MatchRepository({ socketRepository, userRepository })
    };
    const controllers = {
        user: UserController(deps),
        match: MatchController(deps),
        card: CardController(deps)
    };
    const mappedControllers = wrapControllersWithRejectionProtection(controllers);

    setupRoutes(mappedControllers);
    setupSocketHandler(deps, controllers);
}

function setupRoutes(controllers) {
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

    server.listen(port, () => {
        console.log(`\n\n --- Running on port ${port} ---`)
    });
}

function setupSocketHandler(deps, controllers) {
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
                }
                catch (error) {
                    console.error('Error when registering connection for user: ' + error.message);
                    console.info('Raw error:', error);
                }
            }
        });
        connection.on('match', async data => {
            try {
                await controllers.match.onAction(data);
            }
            catch (error) {
                console.error('Error in action to match: ' + error.message);
                console.info('Raw error:', error);
            }
        });
    });
}

function wrapControllersWithRejectionProtection(controllerMap) {
    let wrappedControllerMap = {};
    Object.keys(controllerMap).forEach(name => {
        wrappedControllerMap[name] = {};
        Object.keys(controllerMap[name]).forEach(methodName => {
            wrappedControllerMap[name][methodName] = async (req, res, next) => {
                try {
                    await controllerMap[name][methodName](req, res);
                }
                catch (error) {
                    console.error('ERROR: ' + error.message)
                    console.info('Raw error:', error)
                    res.status(500).end(error.message);
                    next(error);
                }
            }
        });
    });
    return wrappedControllerMap;
}