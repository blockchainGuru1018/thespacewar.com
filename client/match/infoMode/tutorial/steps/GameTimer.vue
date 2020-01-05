<template>
    <div class="infoMode-step">
        <h2>You are running out of time!</h2>
        <p id="infoMode-playerGameTimer">
            This is your game timer. When it runs out you lose. It only ticks whenever it's your turn or the opponent is
            in some way blocked by a choice you need to make.
        </p>
        <div class="infoMode-spacer--tiny" />
        <p id="infoMode-opponentGameTimer">
            This is your opponents game timer, it follows the same rules as yours.
        </p>
    </div>
</template>
<script>
    import LinesMixin from "../LinesMixin.js";

    export default {
        name: 'GameTimer',
        mixins: [LinesMixin([
            ['#infoMode-playerGameTimer', '.matchHeader-playerBanner .matchHeader-bannerClockText'],
            ['#infoMode-opponentGameTimer', '.matchHeader-opponentBanner .matchHeader-bannerClockText']
        ])]
    }
</script>
