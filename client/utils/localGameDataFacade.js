const Keys = {
    OwnUser: 'own-user',
    OngoingMatch: 'ongoing-match',
    AudioSettings: 'audio-settings'
};

module.exports = Facade();

function Facade() {
    const facade = {
        getOwnUser: Getter(Keys.OwnUser),
        setOwnUser: Setter(Keys.OwnUser),
        removeOwnUser: Remover(Keys.OwnUser),

        getOngoingMatch: Getter(Keys.OngoingMatch),
        setOngoingMatch: Setter(Keys.OngoingMatch),
        removeOngoingMatch: Remover(Keys.OngoingMatch),

        removeAll
    };

    for (const objectKey of Object.keys(Keys)) {
        const localStorageKey = Keys[objectKey];
        facade[objectKey] = {
            get: Getter(localStorageKey),
            set: Setter(localStorageKey),
            remove: Remover(localStorageKey),
            getWithDefault: DefaultGetter(localStorageKey)
        };
    }

    return facade;
}

function removeAll() {
    for (const localStorageKey of Object.values(Keys)) {
        Remover(localStorageKey)();
    }
}

function Getter(key) {
    return () => getAndParseOrNull(key)
}

function Setter(key) {
    return value => {
        stringifyAndSet(key, value);
        return value;
    };
}

function Remover(key) {
    return () => {
        localStorage.removeItem(key);
    };
}

function DefaultGetter(key) {
    return (defaultValue) => {
        const storedValue = Getter(key)();
        if (!storedValue) {
            Setter(key)(defaultValue);
            return defaultValue;
        }
        else {
            return storedValue;
        }
    };
}

function getAndParseOrNull(key) {
    const textOrNull = localStorage.getItem(key)
    return textOrNull ? JSON.parse(textOrNull) : null;
}

function stringifyAndSet(key, value) {
    const jsonText = JSON.stringify(value);
    localStorage.setItem(key, jsonText);
}
