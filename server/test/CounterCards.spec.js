// const setupIntegrationTest = require("./testUtils/setupIntegrationTest.js");
// const FakeCardDataAssembler = require("../../shared/test/testUtils/FakeCardDataAssembler.js");
// const createCard = FakeCardDataAssembler.createCard;
// const PutDownCardEvent = require("../../shared/PutDownCardEvent.js");
// const FatalError = require("../../shared/card/FatalError.js");
// const Luck = require("../../shared/card/Luck.js");

// describe("when opponent use Fatal Error to destroy a card", () => {
//   it(" with cost higher than 2 and player counters that with Luck and it fails", () => {
//     const { match } = setupIntegrationTest({
//       turn: 2,
//       playerStateById: {
//         P1A: {
//           phase: "attack",
//           events: [
//             PutDownCardEvent.forTest({
//               turn: 1,
//               location: "zone",
//               cardId: "C1A",
//               choice: "C2A",
//             }),
//           ],
//           cardsInZone: [
//             createCard({
//               commonId: FatalError.CommonId,
//               id: "C1A",
//             }),
//           ],
//         },
//         P2A: {
//           cardsInZone: [createCard({ id: "C2A", type: "spaceShip", cost: 2 })],
//           cardsOnHand: [
//             createCard({
//               commonId: Luck.CommonId,
//               id: "C3A",
//               type: "event",
//             }),
//           ],
//         },
//       },
//     });
//     try {
//       match.putDownCard("P2A", {
//         location: "zone",
//         cardId: "C3A",
//         choice: "C1A",
//       });
//     } catch (err) {
//       expect(err.message).toBe("Cannot put down card");
//     }
//   });

//   it(" with cost 2", () => {
//     const { match, secondPlayerAsserter } = setupIntegrationTest({
//       turn: 2,
//       playerStateById: {
//         P1A: {
//           phase: "attack",
//           events: [
//             PutDownCardEvent.forTest({
//               turn: 1,
//               location: "zone",
//               cardId: "C1A",
//               choice: "C2A",
//             }),
//           ],
//           cardsInHand: [
//             createCard({
//               commonId: FatalError.CommonId,
//               id: "C1A",
//             }),
//           ],
//         },
//         P2A: {
//           cardsInZone: [createCard({ id: "C2A", type: "spaceShip", cost: 8 })],
//           cardsOnHand: [
//             createCard({
//               commonId: Luck.CommonId,
//               id: "C3A",
//               type: "event",
//             }),
//           ],
//         },
//       },
//     });

//     match.toggleControlOfTurn("P2A");

//     match.putDownCard("P2A", {
//       cardId: "C3A",
//       location: "zone",
//       choice: "counter",
//     });

//     console.log(match.getOwnState("P2A").cardsInZone);
//   });
// });
describe("when opponent use Fatal Error to destroy a card", () => {
  it(" unfinish test :'(", () => {
    expect(true).toBe(true);
  });
});
