<template>
    <div class="infoMode-step">
        <h2>Winning</h2>
        <p id="infoMode-opponentStation">
            This is your opponents station cards. Attack cards in this station to flip them. If you flip them
            all,
            you
            win.
        </p>
        <p id="infoMode-playerStation">
            If all your cards are flipped, you lose.
        </p>
        <p>
            Cards that are flipped can be played as cards from your hand.
        </p>
    </div>
</template>
<script>
    import LinesMixin from "./LinesMixin.js";

    export default {
        name: 'Winning',
        mixins: [LinesMixin([
            ['#infoMode-opponentStation', '.field-opponentStation'],
            ['#infoMode-playerStation', '.field-playerStation']
        ])]
    }
</script>
