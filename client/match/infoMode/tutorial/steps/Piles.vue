<template>
    <div class="infoMode-step">
        <h2>Draw & Discard</h2>
        <p id="infoMode-drawPile">
            This is your draw pile. The number in the top right shows how many cards are left in your deck.
        </p>
        <p>
            When you have no more cards left you will start taking damage to your station at the start of each turn.
        </p>
        <p id="infoMode-discardPile">
            This is your discard pile. If you have too many cards on your hand at the end of your action phase, you move
            cards from your hand to here.
        </p>
    </div>
</template>
<script>
    import LinesMixin from "../LinesMixin.js";

    export default {
        name: 'Piles',
        mixins: [LinesMixin([
            ['#infoMode-drawPile', '.field-player .field-drawPile'],
            ['#infoMode-discardPile', '.field-player .field-discardPile']
        ])]
    }
</script>
