import Winning from "./steps/Winning.vue";
import HomeZone from "./steps/HomeZone.vue";
import HomeZone2 from "./steps/HomeZone2.vue";
import OpponentZone from "./steps/OpponentZone.vue";
import Piles from "./steps/Piles.vue";

const ComponentsByName = {
    Winning,
    HomeZone,
    HomeZone2,
    OpponentZone,
    Piles
};

export default {
    InOrder: Object.values(ComponentsByName),
    ComponentsByName
};
