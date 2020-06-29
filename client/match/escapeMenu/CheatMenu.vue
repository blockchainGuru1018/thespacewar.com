<template>
    <div
        v-if="visible"
        class="cheatMenu"
    >
        <div class="escapeMenu-option">
            <label>
                <span>
                    Type*
                </span>
                <select v-model="cheatType">
                    <option
                        v-for="option in cheatTypeOptions"
                        :key="option.value"
                        :value="option.value"
                    >
                        {{ option.text }}
                    </option>
                </select>
            </label>
        </div>
        <div class="escapeMenu-option">
            <label>
                <span>
                    Count*
                </span>
                <input
                    v-model.number="cheatCount"
                    type="number"
                >
            </label>
        </div>
        <div class="escapeMenu-option">
            <label>
                <span>
                    Card ID
                </span>
                <select v-model="cheatCommonId">
                    <option
                        v-for="option in cardOptions"
                        :key="option.value"
                        :value="option.value"
                    >
                        {{ option.text }}
                    </option>
                </select>
            </label>
        </div>
        <div class="escapeMenu-option">
            <label>
                <span>Player</span>
                <select v-model="cheatPlayerId">
                <option v-for="(value,key) in playerOrder" :key="key" :value="value">{{value}}</option>
                </select>
            </label>
        </div>
        <button
            class="escapeMenu-option"
            @click="sendCheat"
        >
            Send
        </button>
        <button
            class="escapeMenu-option"
            @click="showDebugOptions"
        >
            Back
        </button>
    </div>
</template>

<script>
    import Vuex from "vuex";
    import {ViewNames} from "./views.js";

    const escapeMenuHelpers = Vuex.createNamespacedHelpers('escapeMenu');
    const matchHelpers = Vuex.createNamespacedHelpers('match');

    module.exports = {
        data() {
            return {
                cheatType: 'addCard',
                cheatCount: 1,
                cheatCommonId: '',
                cheatPlayerId: "BOT",
            };
        },
        computed: {
            ...escapeMenuHelpers.mapState([
                'view'
            ]),
            ...matchHelpers.mapGetters([
                'cardDataAssembler'
            ]),
            ...matchHelpers.mapState([
                'playerOrder'
            ]),
            visible() {
                return this.view === ViewNames.cheat;
            },
            cheatTypeOptions() {
                return [
                    { value: 'addCard', text: 'Add card' },
                    { value: 'actionPoints', text: 'Add action points' },
                    { value: 'removeAllRequirements', text: 'Remove all requirements' },
                    { value: 'addDamageStationCardRequirement', text: 'Add damage station card requirement' },
                    { value: 'getCardsInDeck', text: 'Get cards in deck (result is logged in the console)' }
                ];
            },
            cardOptions() {
                const allCards = this.cardDataAssembler.createOneOfEach();
                return allCards.map(cardData => {
                    return { value: cardData.commonId, text: cardData.name };
                });
            }
        },
        methods: {
            ...escapeMenuHelpers.mapActions([
                'selectView',
            ]),
            showDebugOptions() {
                this.selectView(ViewNames.debug);
            },
            sendCheat() {
                 window.cheat(this.cheatType, {
                    count: this.cheatCount,
                    commonId: this.cheatCommonId,
                    playerCheatedId: this.cheatPlayerId
                });
            },
        }
    };
</script>
