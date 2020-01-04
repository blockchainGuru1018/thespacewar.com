const TimeVisible = 3000;
const ApproximateLengthOfCssLeaveTransition = 1500;

let timeoutId = null;

export function NotificationBannerStore() {
    return {
        namespaced: true,
        name: 'notificationBanner',
        state: {
            wrapperVisible: false,
            bannerVisible: false,
        },
        actions: {
            showForActionLogEntry
        }
    };

    async function showForActionLogEntry({ state }, entry) {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;

            state.wrapperVisible = false;
            state.bannerVisible = false;
            await wait();
        }

        state.wrapperVisible = true;
        timeoutId = setTimeout(() => {
            state.bannerVisible = true;

            timeoutId = setTimeout(() => {
                state.bannerVisible = false;
                timeoutId = setTimeout(() => {
                    state.wrapperVisible = false;
                }, ApproximateLengthOfCssLeaveTransition);
            }, TimeVisible);
        });
    }
}

function wait() {
    return new Promise(resolve => {
        setTimeout(resolve);
    });
}
