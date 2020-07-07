const MatchRepository = require("../match/MatchRepository.js");
const FakeMatchFactory = require("./testUtils/FakeMatchFactory.js");
const User = require("../../shared/user/User.js");

describe("Restore matches", () => {
  test("stores matches in the fridge", async () => {
    const RESTORABLE_STATE = "MATCH_RESTORABLE_STATE_FAKE";
    const fridge = {
      putIn: jest.fn(),
      takeOut: jest.fn(),
    };
    const match = {
      id: "M1",
      getRestorableState: () => RESTORABLE_STATE,
      playerIds: () => ["P1", "P2"],
      toClientModel: () => ({}),
    };
    const repository = MatchRepository({
      fridge,
      userRepository: {
        getUser: () => ({}),
        updateUser: () => {},
      },
      socketRepository: {
        getForUser: () => ({
          emit() {},
        }),
        hasConnectionToUser: () => true,
      },
      matchFactory: {
        create: () => match,
      },
      logger: {
        log: (message) => console.error(message),
      },
    });

    await repository.create({ playerId: "P1", opponentId: "P2" });
    repository.storeAll();

    expect(fridge.putIn).toBeCalledWith([
      { restorableState: RESTORABLE_STATE, playerIds: ["P1", "P2"] },
    ]);
  });

  test("can take out matches from the fridge", async () => {
    const RESTORABLE_STATE = "MATCH_RESTORABLE_STATE_FAKE";
    const fridge = {
      putIn: jest.fn(),
      takeOutAll: () => [
        { restorableState: RESTORABLE_STATE, playerIds: ["P1", "P2"] },
      ],
    };
    const match = {
      id: "M1",
      restoreFromRestorableState: jest.fn(),
      toClientModel: () => ({ id: "M1", playerIds: ["P1", "P2"] }),
    };
    const userRepository = {
      getUser: jest.fn().mockResolvedValue({}),
      updateUser: () => {},
    };
    const repository = MatchRepository({
      fridge,
      userRepository,
      socketRepository: {
        getForUser: () => ({
          emit() {},
        }),
        hasConnectionToUser: () => true,
      },
      matchFactory: {
        create: () => match,
      },
      logger: {
        log: (message) => console.error(message),
      },
    });

    await repository.restoreAll();

    expect(userRepository.getUser).toBeCalledWith("P1");
    expect(userRepository.getUser).toBeCalledWith("P2");
    expect(match.restoreFromRestorableState).toBeCalledWith(RESTORABLE_STATE);
  });

  test("when take out already existing match from fridge should throw an error!", async () => {
    const users = [new User({ id: "P1" }), new User({ id: "P2" })];
    const repository = createMatchRepository({ users });

    await repository.create({ playerId: "P1", opponentId: "P2" });
    await repository.storeAll();
    const error = await catchError(() => repository.restoreAll());

    expect(error).toBeDefined();
    expect(error.message).toContain("Player is already in a match");
  });
});

function FakeFridge() {
  let data = [];
  return {
    takeOutAll: () => data,
    putIn: (matches) => {
      data = matches;
    },
  };
}

function createMatchRepository({ users, fridge = FakeFridge() }) {
  const userRepository = FakeUserRepository(users);
  const socketRepository = FakeSocketRepository(users);
  const matchFactory = FakeMatchFactory({
    userRepository,
    socketRepository,
  });
  const repository = MatchRepository({
    fridge,
    userRepository,
    socketRepository,
    matchFactory,
    logger: {
      log: (message) => console.error(message),
    },
  });
  return repository;
}

function FakeUserRepository(users) {
  return {
    getUser(id) {
      const userData = users.find((u) => u.id === id);
      if (!userData) return null;

      return User.fromData(userData);
    },
    updateUser: jest.fn(),
  };
}

function FakeSocketRepository(users) {
  const connectionByUserId = new Map();

  for (const user of users) {
    setForUser(user.id, FakeConnection());
  }

  return {
    setForUser,
    getForUser,
    hasConnectionToUser,
    getAllConnectedUserIds,
  };

  function setForUser(userId, socket) {
    connectionByUserId.set(userId, socket);
  }

  function getForUser(userId) {
    return connectionByUserId.get(userId);
  }

  function hasConnectionToUser(userId) {
    return connectionByUserId.has(userId);
  }

  function getAllConnectedUserIds() {
    return Array.from(connectionByUserId.keys());
  }
}

function FakeConnection() {
  return {
    emit(message, data) {
      console.log("EMIT", message, data);
    },
  };
}

async function catchError(callback) {
  try {
    await callback();
  } catch (error) {
    return error;
  }
}
