<template>
    <div :style="cardStyle" @click="cardClick" ref="card" :class="classes">
        <div class="actionOverlays">
            <div v-if="movable"
                 @click="moveClick"
                 class="movable">
                Move
            </div>
            <div v-if="readyToAttack"
                 @click="readyToAttackClick"
                 class="readyToAttack">
                Ready to attack
            </div>
            <div v-if="attackable"
                 @click="attackClick"
                 class="attackable">
                Attack
            </div>
        </div>
        <div class="indicatorOverlays">
            <div v-if="card.damage && card.damage > 0" class="card-damageIndicator" :style="damageTextStyle">
                -{{ card.damage }}
            </div>
        </div>
    </div>
</template>
<script>
    module.exports = {
        props: [
            'card',
            'movable',
            'readyToAttack',
            'selectedAsAttacker',
            'attackable'
        ],
        data() {
            return {
                damageTextFontSize: 0
            }
        },
        computed: {
            classes() {
                const classes = ['card'];
                if (this.selectedAsAttacker) {
                    classes.push('selectedAsAttacker');
                }
                return classes;
            },
            cardStyle() {
                return {
                    backgroundImage: 'url(/card/' + this.card.commonId + '/image)'
                }
            },
            damageTextStyle() {
                return {
                    fontSize: this.damageTextFontSize + 'px'
                }
            }
        },
        methods: {
            cardClick() {
                this.$emit('click', this.card);
            },
            moveClick() {
                this.$emit('move', this.card);
            },
            readyToAttackClick() {
                this.$emit('readyToAttack', this.card);
            },
            attackClick() {
                this.$emit('attack', this.card);
            }
        },
        mounted() {
            let cardWidth = this.$refs.card.offsetWidth;
            this.damageTextFontSize = Math.round(cardWidth * .25);
        }
    };
</script>
<style scoped lang="scss">
    .card {
        position: relative;
    }

    .actionOverlays, .indicatorOverlays {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
    }

    .actionOverlays {
        z-index: 2;
    }

    .indicatorOverlays {
        z-index: 1;
    }

    .movable {
        background-color: rgba(0, 0, 0, .5);
        color: white;
        font-family: Helvetica, sans-serif;
        font-size: 16px;
        flex: 1 1;
        display: flex;
        align-items: center;
        justify-content: center;
        visibility: hidden;
        opacity: .5;
        cursor: pointer;

        &:hover {
            opacity: 1;
        }
    }

    .readyToAttack, .attackable {
        background-color: rgba(255, 100, 100, .5);
        color: white;
        font-family: Helvetica, sans-serif;
        font-size: 16px;
        flex: 1 1;
        display: flex;
        align-items: center;
        justify-content: center;
        visibility: hidden;
        opacity: .5;
        cursor: pointer;

        &:hover {
            opacity: 1;
        }
    }

    .selectedAsAttacker {
        outline: 2px solid red;
    }

    .actionOverlays:hover {
        & .movable, & .readyToAttack, & .attackable {
            visibility: visible;
        }
    }

    .card-damageIndicator {
        display: flex;
        padding-right: 5%;
        padding-bottom: 24%;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        align-items: flex-end;
        justify-content: flex-end;
        color: red;
        text-shadow: 1px 1px #333;
        font-weight: bold;
        font-family: Arial, sans-serif;
    }
</style>