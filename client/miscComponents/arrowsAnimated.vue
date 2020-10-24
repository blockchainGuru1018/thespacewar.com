<template>
  <div class="containerFloating">
    <div v-show="direction === 'left'" class="loader-left">
      <div
        :class="animated? 'ui_arrow-1 scale-arrow animated infinite animated-175 delay-125' : 'ui_arrow-1'"
      ></div>
      <div
        :class="animated? 'ui_arrow-2 scale-arrow animated infinite animated-175 delay-1' : 'ui_arrow-1'"
      ></div>
      <div
        :class="animated? 'ui_arrow-3 scale-arrow animated infinite animated-175 delay-075' : 'ui_arrow-1'"
      ></div>
      <div
        :class="animated? 'ui_arrow-4 scale-arrow animated infinite animated-175 delay-050' : 'ui_arrow-1'"
      ></div>
      <div
        :class="animated? 'ui_arrow-5 scale-arrow animated infinite animated-175 delay-025' : 'ui_arrow-1'"
      ></div>
      <div :class="animated? 'ui_arrow-6 scale-arrow animated infinite animated-175' : 'ui_arrow-1'"></div>
    </div>
    <div v-show="direction === 'right'" class="loader-right">
      <div :class="animated? 'ui_arrow-1 scale-arrow animated animated-075 infinite' : 'ui_arrow-6'"></div>
      <div
        :class="animated? 'ui_arrow-2 scale-arrow animated animated-075 infinite delay-015' : 'ui_arrow-6'"
      ></div>
      <div
        :class="animated? 'ui_arrow-3 scale-arrow animated animated-075 infinite delay-030' : 'ui_arrow-6'"
      ></div>
      <div
        :class="animated? 'ui_arrow-4 scale-arrow animated animated-075 infinite delay-045' : 'ui_arrow-6'"
      ></div>
      <div
        :class="animated? 'ui_arrow-5 scale-arrow animated animated-075 infinite delay-060' : 'ui_arrow-6'"
      ></div>
      <div
        :class="animated? 'ui_arrow-6 scale-arrow animated animated-075 infinite delay-075' : 'ui_arrow-6'"
      ></div>
    </div>
  </div>
</template>

<script>
/**
 * Inspired from https://codepen.io/lexich/pen/ikfao
 */

export default {
  props: {
    direction: {
      type: String,
      default: "left",
    },
    animated: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped lang="scss">
.loader-left {
  float: left;
  width: calc(15px * 6);
}
.loader-right {
  float: right;
  width: calc(15px * 6);
  margin-top: 10px;
}

$right: "https://img-fotki.yandex.ru/get/4909/34732798.0/0_e87c8_427d7f9c_S.png";
$left: "https://img-fotki.yandex.ru/get/5006/34732798.0/0_e87c1_1f1cca3e_S.png";
[class*="ui_arrow-"] {
  width: 15px;
  height: 36px;
  float: left;
}
.loader-left [class*="ui_arrow-"] {
  background: transparent url($left) 0 0 no-repeat;
  filter: hue-rotate(0deg);
  filter: saturate(20);
}
.loader-right [class*="ui_arrow-"] {
  background: transparent url($right) 0 0 no-repeat;
  filter: hue-rotate(0deg);
  filter: saturate(20);
}

.loader-left {
  .ui_arrow-1 {
    background-position-x: 0;
  }
  .ui_arrow-2 {
    background-position-x: -15px;
  }
  .ui_arrow-3 {
    background-position-x: -31px;
  }
  .ui_arrow-4 {
    background-position-x: -46px;
  }
  .ui_arrow-5 {
    background-position-x: -62px;
  }
  .ui_arrow-6 {
    background-position-x: -77px;
  }
}
.loader-right {
  .ui_arrow-1 {
    background-position-x: 0;
  }
  .ui_arrow-2 {
    background-position-x: -15px;
  }
  .ui_arrow-3 {
    background-position-x: -29px;
  }
  .ui_arrow-4 {
    background-position-x: -44px;
  }
  .ui_arrow-5 {
    background-position-x: -59px;
  }
  .ui_arrow-6 {
    background-position-x: -75px;
  }
}

@keyframes scale-arrow {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }

  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
.scale-arrow {
  animation-name: scale-arrow;
}
.animated {
  &.animated-175 {
    animation-duration: 1.75s;
  }
  &.animated-075 {
    animation-duration: 1.75s;
  }
}
.infinite {
  animation-iteration-count: infinite;
}

.delay-015 {
  animation-delay: 0.15s;
}
.delay-025 {
  animation-delay: 0.25s;
}
.delay-030 {
  animation-delay: 0.3s;
}
.delay-050 {
  animation-delay: 0.5s;
}
.delay-055 {
  animation-delay: 0.55s;
}
.delay-060 {
  animation-delay: 0.6s;
}
.delay-075 {
  animation-delay: 0.75s;
}
.delay-1 {
  animation-delay: 1s;
}
.delay-125 {
  animation-delay: 1.25s;
}
.delay-150 {
  animation-delay: 1.5s;
}

.containerFloating {
  background: transparent;
  height: calc(var(--card-height) * 0.2);
  position: fixed;
  left: 0px;
  transform: translateZ(1px);
}
  

</style>
