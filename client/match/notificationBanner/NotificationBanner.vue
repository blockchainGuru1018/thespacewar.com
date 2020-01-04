<template>
    <div class="notificationBanner-wrapper">
        <transition name="notificationBanner-transitionOverlay">
            <div
                v-if="visible"
                class="notificationBanner-overlay"
            />
        </transition>
        <div class="notificationBanner">
            <div class="notificationBanner-headerWrapper">
                <transition name="notificationBanner-transitionHeader">
                    <h1
                        v-if="visible"
                        class="notificationBanner-header"
                    >
                        Opponent used Target Missed
                    </h1>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'NotificationBanner',
        props: { visible: Boolean }
    }
</script>
<style lang="scss">
    @import "notificationBanner.scss";
</style>
