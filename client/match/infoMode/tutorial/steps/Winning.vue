<template>
    <div class="infoMode-step">
        <h2>Winning</h2>
        <p id="infoMode-opponentStation">
            These are your opponents station cards. Attack cards in this station to flip them face-up. If all of them
            are face-up, you win.
        </p>
        <div class="infoMode-spacer--tiny" />
        <p id="infoMode-playerStation">
            These are all your station cards. If all your cards are face-up, you lose.
        </p>
    </div>
</template>
<script>
    import LinesMixin from "../LinesMixin.js";

    export default {
        name: 'Winning',
        mixins: [LinesMixin([
            ['#infoMode-opponentStation', '.field-opponentStation'],
            ['#infoMode-playerStation', '.field-playerStation']
        ])]
    }
</script>
