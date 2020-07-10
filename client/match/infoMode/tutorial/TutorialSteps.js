import Winning from "./steps/Winning.vue";
import HomeZone from "./steps/HomeZone.vue";
import HomeZone2 from "./steps/HomeZone2.vue";
import OpponentZone from "./steps/OpponentZone.vue";
import Piles from "./steps/Piles.vue";
import PhasesIntro from "./steps/PhasesIntro.vue";
import DrawPhase from "./steps/DrawPhase.vue";
import ActionPhase from "./steps/ActionPhase.vue";
import DiscardPhase from "./steps/DiscardPhase.vue";
import AttackPhase from "./steps/AttackPhase.vue";
import CardTypes from "./steps/CardTypes.vue";
import CardTypes2 from "./steps/CardTypes2.vue";
import EventCards from "./steps/EventCards.vue";
import LastTip from "./steps/LastTip.vue";
import GameTimer from "./steps/GameTimer.vue";
import HomeZone0 from "./steps/HomeZone0.vue";

const ComponentsByName = {
  Winning,
  HomeZone0,
  HomeZone,
  HomeZone2,
  OpponentZone,
  Piles,
  PhasesIntro,
  DrawPhase,
  ActionPhase,
  DiscardPhase,
  AttackPhase,
  CardTypes,
  CardTypes2,
  EventCards,
  GameTimer,
  LastTip,
};

export default {
  InOrder: Object.values(ComponentsByName),
  ComponentsByName,
};
