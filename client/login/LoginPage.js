const Vue = require('vue');
const LoginView = require('./Login.vue').default;
const ajax = require('../utils/ajax.js');

module.exports = function (deps) {

    const route = deps.route;
    const userRepository = deps.userRepository;

    let vm;

    return {
        show,
        hide
    };

    function show() {
        if (hasPreviousSession()) {
            restoreFromPreviousSession();
            return;
        }

        vm = new Vue({
            render(h) {
                return h(LoginView, {
                    on: {
                        submit: this.submit
                    }
                });
            },
            methods: {
                async submit(name) {
                    let ownUser = await ajax.jsonPost('/login', { name });
                    localStorage.setItem('own-user', JSON.stringify(ownUser));

                    userRepository.storeOwnUser(ownUser);
                    route('lobby');
                }
            }
        });
        const hook = document.createElement('div');
        document.body.appendChild(hook);
        vm.$mount(hook);
    }

    function hasPreviousSession() {
        return !!localStorage.getItem('own-user');
    }

    async function restoreFromPreviousSession() {
        let storedUserJson = localStorage.getItem('own-user');
        if (storedUserJson) {
            const ownUser = JSON.parse(storedUserJson);
            const allUsers = await userRepository.getAll();
            const existsOnServer = allUsers.some(u => u.id === ownUser.id);
            if (existsOnServer) {
                userRepository.storeOwnUser(ownUser);

                const ongoingMatchJson = localStorage.getItem('ongoing-match');
                if (ongoingMatchJson) {
                    const matchData = JSON.parse(ongoingMatchJson);
                    joinMatch(matchData);
                }
                else {
                    route('lobby');
                }
            }
            else {
                localStorage.removeItem('own-user');
                localStorage.removeItem('ongoing-match');
                route('login');
            }
        }
    }

    async function joinMatch({ id: matchId, playerIds }) {
        let ownUserId = userRepository.getOwnUser().id;
        let opponentUserId = playerIds.find(id => id !== ownUserId);
        let users = userRepository.getAllLocal();
        let opponentUser = users.find(u => u.id === opponentUserId);
        route('match', { matchId, opponentUser });
    }

    function hide() {
        if (!vm) return;

        vm.$destroy();
        vm.$el.remove();
        vm = null;
    }
};