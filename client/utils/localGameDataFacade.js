const OwnUserKey = 'own-user';
const OngoingMatchKey = 'ongoing-match';

module.exports = {
    getOwnUser,
    getOngoingMatch,
    setOwnUser,
    setOngoingMatch,
    removeAll,
    removeOngoingMatch
};

function getOwnUser() {
    return getAndParseOrNull(OwnUserKey);
}

function getOngoingMatch() {
    return getAndParseOrNull(OngoingMatchKey);
}

function setOwnUser(ownUser) {
    stringifyAndSet(OwnUserKey, ownUser);
}

function setOngoingMatch(ongoingMatch) {
    stringifyAndSet(OngoingMatchKey, ongoingMatch);
}

function removeAll() {
    localStorage.removeItem(OwnUserKey);
    removeOngoingMatch();
}

function removeOngoingMatch() {
    localStorage.removeItem(OngoingMatchKey);
}

function getAndParseOrNull(key) {
    const textOrNull = localStorage.getItem(key)
    return textOrNull ? JSON.parse(textOrNull) : null;
}

function stringifyAndSet(key, value) {
    const jsonText = JSON.stringify(value);
    localStorage.setItem(key, jsonText);
}