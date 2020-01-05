<template>
    <div class="infoMode-wrapper">
        <div
            :class="overlayClasses"
            @click="next"
        />
        <div
            class="infoMode"
            @click="next"
        >
            <component :is="Steps[step]" :t-id="`infoMode-step${step}`" />
        </div>
    </div>
</template>
<script>
    import TutorialSteps from "./tutorial/TutorialSteps.js";

    export default {
        name: 'InfoMode',
        components: TutorialSteps.ComponentsByName,
        data() {
            return {
                step: 0
            };
        },
        computed: {
            Steps: () => TutorialSteps.InOrder,
            componentForStep() {
                return this.Steps[this.step];
            },
            overlayClasses() {
                const classes = ['infoMode-overlay'];
                if (this.componentForStep.extraDark) {
                    classes.push('infoMode-overlay--darker');
                }
                return classes;
            }
        },
        methods: {
            next() {
                this.step += 1;
                if (this.step >= this.Steps.length) {
                    this.step = 0;
                    this.$emit('hide');
                }
            }
        }
    }
</script>
<style lang="scss" scoped>
    .infoMode-wrapper {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 3;
    }

    .infoMode-overlay {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1;
        background: rgba(0, 0, 0, .6);
        transition: background 1s;
    }

    .infoMode-overlay--darker {
        background: rgba(0, 0, 0, .88);
    }

    .infoMode {
        position: absolute;
        top: 150px;
        left: 50%;
        z-index: 1;
        transform: translateX(-50%);
        width: 720px;
    }

    .infoMode-continue {
        display: block;
        margin: 5px 0 50px;
        font-size: 14px;
        color: #666;
    }
</style>
<style lang="scss">
    .infoMode-step {
        display: flex;
        justify-content: center;
        flex-direction: column;

        > h2, p {
            font-family: "Space Mono", sans-serif;
            color: white;
        }

        > h2 {
            align-self: center;
            font-size: 36px;
            position: relative;

            &:after {
                content: "click anywhere to continue";
                font-size: 14px;
                color: #666;
                font-family: "Space Mono", sans-serif;
                text-align: center;
                position: absolute;
                top: 110%;
                width: 400px;
                white-space: nowrap;
                transform: translateX(-50%);
                left: 50%;
            }
        }

        > p {
            font-size: 24px;
        }
    }

    .infoMode-spacer {
        height: 300px;
    }

    .infoMode-spacer--small {
        height: 150px;
    }

    .infoMode-spacer--tiny {
        height: 50px;
    }
</style>
