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
                        {{ notificationText }}
                    </h1>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'NotificationBanner',
        props: {
            visible: Boolean,
            notificationText: {
                type: String,
                default: ''
            }
        }
    }
</script>
<style lang="scss">
    @import "notificationBanner.scss";
</style>
