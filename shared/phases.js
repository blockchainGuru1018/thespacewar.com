const TEMPORARY_START_PHASE = "start";

const PHASES = {
  preparation: "preparation",
  draw: "draw",
  action: "action",
  discard: "discard",
  attack: "attack",
  wait: "wait",
  start: TEMPORARY_START_PHASE,
};
const COMMON_PHASE_ORDER = [
  PHASES.draw,
  PHASES.preparation,
  PHASES.action,
  PHASES.discard,
  PHASES.attack,
];

//TODO Improve name "preparation" phase to anything better really

module.exports = {
  COMMON_PHASE_ORDER,
  PHASES,
  TEMPORARY_START_PHASE,
};
