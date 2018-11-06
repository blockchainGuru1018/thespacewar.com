<template>
    <div :style="cardStyle" @click="cardClick" ref="card" class="card">
        <div v-if="card.damage && card.damage > 0" class="card-damageIndicator" :style="damageTextStyle">
            -{{ card.damage }}
        </div>
    </div>
</template>
<script>
    module.exports = {
        props: ['card'],
        data() {
            return {
                damageTextFontSize: 0
            }
        },
        computed: {
            cardStyle() {
                return {
                    backgroundImage: 'url(/card/' + this.card.id + '/image)'
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
            }
        },
        mounted() {
            let cardWidth = this.$refs.card.offsetWidth;
            this.damageTextFontSize = Math.round(cardWidth * .25);
        }
    };
</script>
<style scoped lang="scss">
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