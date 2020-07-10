const { defaults } = require("./bocha-jest/bocha-jest.js");
const FakeConnection = require("./FakeConnection.js");

module.exports = function Player(id = "007", connection = FakeConnection()) {
  return defaults(
    { id, connection },
    {
      id: "007",
      name: "James",
      connection: FakeConnection(),
    }
  );
};
