<template>
    <div
        :class="['matchHeader-banner', {'matchHeader-reverse': reverse, 'matchHeader-playerBanner': isPlayer, 'matchHeader-opponentBanner': !isPlayer }]"
    >
        <div class="matchHeader-bannerName">
            {{ name }}
        </div>
        <div class="matchHeader-bannerBarsWrapper">
            <div class="matchHeader-bannerBars">
                <template v-for="bar in bars">
                    <div
                        v-if="bar.empty"
                        :key="bar.key"
                        class="matchHeader-bannerBar matchHeader-bannerBar--empty"
                    />
                    <div
                        v-else-if="bar.flipped"
                        :key="bar.key"
                        class="matchHeader-bannerBar matchHeader-bannerBar--flipped"
                    />
                    <div
                        v-else
                        :key="bar.key"
                        class="matchHeader-bannerBar"
                    />
                </template>
            </div>
            <div class="matchHeader-stationCardsNotice">
                <div class="matchHeader-stationCardCount">
                    {{ stationCards.length }}
                </div>
                <div class="matchHeader-stationCardsText">
                    Station cards
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    const Vuex = require('vuex');
    const matchHelpers = Vuex.createNamespacedHelpers('match');

    module.exports = {
        props: ['isPlayer', 'reverse'],
        computed: {
            ...matchHelpers.mapState([
                'opponentUser',
                'ownUser',
                'mode'
            ]),
            ...matchHelpers.mapGetters([
                'allPlayerStationCards',
                'allOpponentStationCards',
                'maxStationCardCount'
            ]),
            name() {
                if (this.isPlayer) {
                    return this.ownUser.name;
                }
                else {
                    return this.opponentUser.name;
                }
            },
            stationCards() {
                return this.isPlayer ? this.allPlayerStationCards : this.allOpponentStationCards;
            },
            bars() {
                const stationCards = this.stationCards.slice();

                stationCards.push(...range(this.maxStationCardCount - stationCards.length).map(index => ({
                    key: `e:${index}`,
                    empty: true
                })));

                const reverse = this.reverse;
                return stationCards.slice().sort((a, b) => getCardSortOrder(a, reverse) - getCardSortOrder(b, reverse));
            }
        }
    };

    function getCardSortOrder({ flipped, empty }, reverse) {
        if (empty) return reverse ? 0 : 2;
        if (flipped) return 1;
        return reverse ? 2 : 0;
    }

    function range(count) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(i);
        }
        return result;
    }
</script>

<style lang="scss">
    @import "banner";

    .matchHeader-banner {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        border: 2px solid $bannerBorderColor;
        background: $bannerBackgroundColor;
        padding: 5px;
        margin-top: $bannerTopMargin;
        margin-left: $bannerSideMargin;
        top: 0;
        left: 0;
        z-index: 3;

        &.matchHeader-playerBanner {
            border: 2px solid $bannerPlayerBorderColor;
            background: $bannerPlayerBackgroundColor;
        }

        &.matchHeader-opponentBanner {
            border: 2px solid $bannerOpponentBorderColor;
            background: $bannerOpponentBackgroundColor;
        }
    }

    .matchHeader-reverse {
        margin: 0 $bannerSideMargin 10px 0;
        top: auto;
        left: auto;
        bottom: 0;
        right: 0;
        flex-direction: row-reverse;
    }

    .matchHeader-bannerName {
        font-family: "Libel Suit", sans-serif;
        letter-spacing: .1em;
        font-size: 28px;
        margin-right: $bannerInnerSideMargin;
        justify-content: flex-start;

        .matchHeader-playerBanner & {
            color: $playerColor;
        }

        .matchHeader-opponentBanner & {
            color: $opponentColor;
        }

        .matchHeader-reverse & {
            margin-right: 0;
            margin-left: $bannerInnerSideMargin;
            justify-content: flex-end;
        }
    }

    .matchHeader-bannerBarsWrapper {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;

        .matchHeader-reverse & {
            flex-direction: row-reverse;
            justify-content: flex-end;
        }
    }

    .matchHeader-bannerBars {
        display: flex;
        align-items: center;
        justify-content: flex-start;

        .matchHeader-reverse & {
            justify-content: flex-end;
        }
    }

    .matchHeader-bannerBar {
        width: 12px;
        height: 28px;
        margin: 0 1px;

        .matchHeader-playerBanner & {
            border: 2px solid $playerSecondaryColor;
            background: $playerColor;
        }

        .matchHeader-opponentBanner & {
            border: 2px solid $opponentSecondaryColor;
            background: $opponentColor;
        }
    }

    .matchHeader-bannerBar.matchHeader-bannerBar--flipped {
        background: transparent;
    }

    .matchHeader-bannerBar.matchHeader-bannerBar--empty {
        background: transparent;
        border: 2px solid rgba(255, 255, 255, .05);
    }

    .matchHeader-stationCardsNotice {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;

        text-transform: uppercase;
        font-weight: 100;
        font-size: 13px;
        font-family: "Space mono", sans-serif;
        line-height: 102%;

        margin: 10px 5px 10px 15px;

        .matchHeader-reverse & {
            margin: 10px 15px 10px 5px;
        }

        .matchHeader-playerBanner & {
            color: $bannerPlayerTextColor;
        }

        .matchHeader-opponentBanner & {
            color: $bannerOpponentTextColor;
        }
    }

    .matchHeader-stationCardCount {
        position: relative;
        bottom: 2px;
        font-size: 30px;
        margin: 0 6px 0 0;
    }

    .matchHeader-stationCardsText {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        text-transform: uppercase;
        font-weight: 100;
        font-size: 13px;
        font-family: "Space mono", sans-serif;
        line-height: 102%;
        width: 56px;
        height: 0; /* It should not have an effect on the container height, so that's why its zero */
    }
</style>
