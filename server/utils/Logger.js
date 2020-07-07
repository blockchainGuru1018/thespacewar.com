class Logger {
    constructor() {
        this._logsByType = {};
        this._masterLog = [];
    }

    log(message, prefix = "normal") {
        this._logsByType[prefix] = this._logsByType[prefix] || [];
        this._logsByType[prefix].push(message);
        this._masterLog.push(`[${prefix}]\t${message}`);
    }

    read(type = "normal") {
        return this._logsByType[type].join("\n");
    }

    readAll() {
        const all = [];
        for (const type of Object.keys(this._logsByType)) {
            all.push(`\t${type}:`);
            all.push(...this._logsByType[type]);
        }
        return all.join("\n");
    }

    readMasterLog() {
        return this._masterLog.join("\n");
    }

    clear() {
        this._logsByType = {};
    }
}

module.exports = Logger;
