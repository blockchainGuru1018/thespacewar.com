const localGameDataFacade = require("../utils/localGameDataFacade.js");

module.exports = function () {
    let settings = localGameDataFacade.AudioSettings.getWithDefault({
        masterGain: 0.75,
    });

    return {
        masterGain,
        setMasterGain,
    };

    function masterGain() {
        return settings.masterGain;
    }

    function setMasterGain(newGain) {
        mergeAudioSettings({ masterGain: newGain });
    }

    function mergeAudioSettings(newSettings) {
        settings = localGameDataFacade.AudioSettings.set({
            ...settings,
            ...newSettings,
        });
    }
};
