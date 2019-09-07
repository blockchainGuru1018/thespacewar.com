
module.exports = function FakeUserRepository({ ownUser }) {
    return {
        getOwnUser() {
            return ownUser;
        }
    }
}