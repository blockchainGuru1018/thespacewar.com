import MainMenu from './MainMenu.vue';
import DebugMenu from './DebugMenu.vue';
import CheatMenu from './CheatMenu.vue';
import LogMenuShell from './logMenu/LogMenuShell.vue';

const ViewNames = {
    main: 'main',
    debug: 'debug',
    cheat: 'cheat',
    log: 'log',
};

export default {
    ViewNames,
    [ViewNames.main]: MainMenu,
    [ViewNames.debug]: DebugMenu,
    [ViewNames.cheat]: CheatMenu,
    [ViewNames.log]: LogMenuShell,
};
