<template>
    <div class="infoMode-step">
        <h2>Draw & Discard</h2>
        <p id="infoMode-drawPile">
            This is your draw pile. The number in the top right shows how many cards are left in your deck.
        </p>
        <div class="infoMode-spacer--tiny" />
        <p id="infoMode-discardPile">
            This is your discard pile. You move a card from your hand to here to discard it.
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
