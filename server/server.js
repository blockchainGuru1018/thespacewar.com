require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const SocketIO = require("socket.io");
const wrapControllersWithRejectionProtection = require("./utils/wrapControllersWithRejectionProtection.js");
const SecurityController = require("./user/SecurityController.js");
const SocketRepository = require("./user/SocketRepository.js");
const InMemoryFridge = require("./utils/InMemoryFridge.js");
const UserRepository = require("./user/UserRepository.js");
const UserController = require("./user/UserController.js");
const MatchFactory = require("./match/MatchFactory.js");
const MatchRepository = require("./match/MatchRepository.js");
const MatchController = require("./match/MatchController.js");
const CardController = require("./card/CardController.js");
const CheatController = require("./cheat/CheatController.js");
const GitController = require("./git/GitController.js");
const AssetsController = require("./assets/AssetsController.js");
const AuthController = require("./auth/AuthController.js");
const ServerRawCardDataRepository = require("./card/ServerRawCardDataRepository.js");
const GameConfig = require("../shared/match/GameConfig.js");
const HandleConnection = require("./connections/HandleConnection.js");
const Logger = require("./utils/Logger.js");
const http = require("http");
const { port } = require("./settings.json");
const { DebugPassword } = require("./semi-secret.js");
const morgan = require("morgan");
const config = require("../config");
const cookieParser = require("cookie-parser");
const serverRuntimeGlobals = require("./serverRuntimeGlobals.js");
let inDevelopment;
let app;
let server;
let socketMaster;

const logger = new Logger();

let restartListener = () => {};

module.exports = {
  onRestart,
  start: startServer,
  close: closeServer,
  restart: restartServer,
};

function onRestart(listener) {
  restartListener = listener;
}

function getPort() {
  if (typeof process.env.PORT == "undefined") {
    return port;
  }

  return process.env.PORT;
}

function startServer(config) {
  inDevelopment = config.inDevelopment;

  serverRuntimeGlobals.isRunningInTestEnvironment = inDevelopment;

  return new Promise(async (resolve) => {
    app = express();
    //app.use(morgan('dev')); Disabled 2020-06-23: Useful for performance tuning and debugging, but noisy otherwise.
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    server = http.createServer(app);
    socketMaster = SocketIO(server);

    await run({ config, closeServer, exitProcess });

    console.info(` - 2/2 Setting up server at port ${getPort()}`);
    server.listen(getPort(), () => {
      console.info(` - 2/2 SUCCESS, running on port ${getPort()}\n`);
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

  return new Promise((resolve) => setTimeout(resolve, 1000));
}

async function restartServer() {
  restartListener();
}

async function run({ config, closeServer, exitProcess }) {
  const rawCardDataRepository = ServerRawCardDataRepository();

  console.info(" - 1/2 Fetching fresh game data");
  await rawCardDataRepository.init();
  console.info(" - 1/2 SUCCESS");

  //1st level dependencies
  const deps = {
    logger,
    rawCardDataRepository,
    gameConfig: GameConfig.fromConfig(config.gameConfig),
    userRepository: UserRepository({ socketMaster }),
    socketRepository: SocketRepository({ socketMaster }),
    fridge: InMemoryFridge(),
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
    git: GitController({ ...deps, closeServer, exitProcess }),
    assets: AssetsController(deps),
    cheat: CheatController(deps),
    auth: AuthController(deps),
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

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "client-dist", "index.html"));
  });
  app.get("/experiments", (req, res) => {
    res.sendFile(path.join(__dirname, "client-dist", "experiments-page.html"));
  });
  app.get("/index.js", (req, res) => {
    res.sendFile(path.join(__dirname, "client-dist", "index.js"));
  });
  app.post("/login", controllers.user.login);
  app.post("/guest-login", controllers.user.guestLogin);
  app.post("/log-game", controllers.user.sendLogGame);
  app.post("/test-access-key", controllers.user.testAccessKey);
  app.get("/user", controllers.user.getAll);
  app.post("/match", controllers.match.create); //TODO Have playerId be part of uri so that the route is authenticated
  app.post("/match/invite", controllers.match.invitePlayerToGame);
  app.post("/match/decline", controllers.match.declineInvitation); //
  app.post("/match/accept", controllers.match.acceptInvitation); //
  app.post("/match/cancel", controllers.match.cancelInvitation);
  app.post("/match/:playerId/bot", controllers.match.createWithBot);
  app.get(
    "/match/:matchId/player/:playerId/state",
    controllers.match.getOwnState
  );

  app.get("/card/:cardId/image", controllers.card.getImage);
  app.get("/card/back-image", controllers.card.getBackImage);
  app.get("/card/data", controllers.card.getData);

  app.post("/git/push", controllers.git.onPush);

  app.get("/font/:fontName", controllers.assets.getFont);
  app.get("/icon/:iconName", controllers.assets.getIcon);
  app.get("/image/:imageName", controllers.assets.getImage);
  app.get("/sound/:soundName", controllers.assets.getSound);
  app.get("/libraries/:libraryName", controllers.assets.getLibrary);
  app.get("/config", (request, response) => {
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(config));
  });
  app.get("/is-logged-in-to-home", controllers.auth.getAuthLoggedIn);

  app.post("/test-debug", (req, res) => {
    res.json({ valid: validateDebugPassword(req.body.password) });
    lastCheckTime = Date.now();
  });
  app.post("/cheat", controllers.cheat.cheat);
  app.post("/restart", async (req, res) => {
    2;
    if (validateDebugPassword(req.body.password)) {
      await restartServer();

      setTimeout(() => {
        res.redirect("/");
      }, 3000);
    } else {
      res.json({ text: "Invalid password" });
    }
  });

  app.post("/master-log", (req, res) => {
    if (validateDebugPassword(req.body.password)) {
      const masterLog = deps.logger.readMasterLog();
      res.json({ text: masterLog });
    } else {
      res.json({ text: `Invalid password` });
    }
  });

  // app.get("/test-match-restoration", async (req, res) => {
  // await controllers.match._testMatchRestoration();
  // await controllers.git.onPush(req, res);
  // });

  //WARNING: this endpoint its just for testing should not be on production i guess
  // app.delete("/match", async (req, res) => {
  //   await controllers.match._deleteMatches();
  //   res.json("deleted");
  // });

  function validateDebugPassword(password) {
    const timeSinceLastCheck = Date.now() - lastCheckTime;
    if (timeSinceLastCheck < 3 * 1000) {
      return false;
    } else {
      return password === DebugPassword;
    }
  }
}

function setupSocketConnectionHandler(deps, controllers) {
  socketMaster.on("connection", async (connection) => {
    HandleConnection({ ...deps, controllers, connection });
  });
}
