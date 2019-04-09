const axios = require('axios');
const cardsJson = require('../server/card/cards.json');
const readline = require('readline');

const DONE = [
    {
        "id": "21",
        "name": "Energy Shield",
        "price": "3",
        "type_card": "green",
        "detail": "Protects base station. (You can only have one Energy Shield in play at the same time.)",
        "defense": "5",
        "attack": "0",
        "number_copies": "3",
    },
    {
        "id": "23",
        "name": "Small Cannon",
        "price": "1",
        "type_card": "green",
        "detail": "Can attack 2 times per turn.",
        "defense": "1",
        "attack": "2",
        "number_copies": "0",
    },
    {
        "id": "24",
        "name": "Trigger-Happy Joe",
        "price": "2",
        "type_card": "spaceShip",
        "detail": "Can attack 2 times per turn.",
        "defense": "2",
        "attack": "1",
        "number_copies": "1",
    },
    {
        "id": "6",
        "name": "Fast Missile",
        "price": "2",
        "type_card": "missile",
        "detail": "Can move the first turn.",
        "defense": "1",
        "attack": "2",
        "number_copies": "1",
    },
    {
        "id": "28",
        "name": "Hunter",
        "price": "3",
        "type_card": "spaceShip",
        "detail": "Can move the first turn.",
        "defense": "1",
        "attack": "2",
        "number_copies": "2",
    },
    {
        "id": "29",
        "name": "Small Repair Shop",
        "price": "2",
        "type_card": "spaceShip",
        "detail": "Can repair 3 damage instead of attacking. Can move the first turn.",
        "defense": "3",
        "attack": "1",
        "number_copies": "1",
    },
    {
        "id": "15",
        "name": "Supernova",
        "price": "10",
        "type_card": "event",
        "detail": "All cards except station cards are destroyed. Each player receives 3 station damage and discards 3 cards. Your turn is ended.",
        "defense": "0",
        "attack": "0",
        "number_copies": "1",
    },
    {
        "id": "14",
        "name": "Excellent work",
        "price": "2",
        "type_card": "event",
        "detail": "Put down this card as an extra station card.\r\n[ OR ] Draw 3 cards.",
        "defense": "0",
        "attack": "0",
        "number_copies": "3",
    },
    {
        "id": "20",
        "name": "Grand Oppurtunity",
        "price": "5",
        "type_card": "event",
        "detail": "Draw 6 cards and then discard 2 cards from your hand.",
        "defense": "0",
        "attack": "0",
        "number_copies": "1",
    },
    {
        "id": "42",
        "name": "Discovery",
        "price": "0",
        "type_card": "event",
        "detail": "Each player draws 4 cards.\r\n[ OR ] Each player discards 2 cards.",
        "defense": "0",
        "attack": "0",
        "number_copies": "2",
    },
    {
        "difficulty": "4",
        "type_card": "event",
        "name": "Fatal Error",
        "id": "38",
        "price": "0",
        "detail": "Destroy any card in play (on the table including station cards).\r\nThe opponent may draw 2 cards.",
        "defense": "0",
        "attack": "0",
        "number_copies": "2",
    },
    {
        "difficulty": "4",
        "type_card": "duration",
        "name": "Good Karma",
        "id": "11",
        "price": "3",
        "detail": "Draw 4 extra cards in your draw phase, then after your draw phase discard 2 cards from your hand.",
        "defense": "0",
        "attack": "0",
        "number_copies": "2",
    },
    {
        "difficulty": "3",
        "type_card": "duration",
        "name": "Neutralization",
        "id": "12",
        "price": "2",
        "detail": "No other duration card has any effect.",
        "defense": "0",
        "attack": "0",
        "number_copies": "2",
    },

    {
        "difficulty": "1",
        "type_card": "spaceShip",
        "name": "The Last Hope",
        "id": "30",
        "price": "3",
        "detail": "Can repair 5 damage instead of attacking.",
        "defense": "5",
        "attack": "1",
        "number_copies": "1",
    },
    {
        "difficulty": "9",
        "type_card": "missile",
        "name": "Nuclear missile",
        "id": "8",
        "price": "2",
        "defense": "3",
        "attack": "10",
        "number_copies": "1",
    },
    {
        "difficulty": "9",
        "type_card": "spaceShip",
        "name": "The Shade",
        "id": "27",
        "price": "4",
        "detail": "Stealth (invisible upside down, becomes visible when attacking).\r\nCan enter stealth instead of attacking.",
        "defense": "4",
        "attack": "3",
        "number_copies": "1",
    },
    {
        "difficulty": "3",
        "type_card": "spaceShip",
        "name": "The Dark Destroyer",
        "id": "2",
        "price": "6",
        "detail": "Opponent may draw 2 cards when this enters play.",
        "defense": "10",
        "attack": "7",
        "number_copies": "1",
    },
    {
        "difficulty": "4",
        "type_card": "spaceShip",
        "name": "Pursuiter",
        "id": "19",
        "price": "1",
        "detail": "You may sacrifice Pursuiter from play instead of attacking to deal 4 damage to target in same zone (collision).",
        "defense": "1",
        "attack": "2",
        "number_copies": "2",
    },
    {
        "difficulty": "6",
        "type_card": "duration",
        "name": "Expansion",
        "id": "40",
        "price": "1",
        "detail": "You may put down or move an extra station card each turn, if you do the opponent may draw a card.",
        "defense": "0",
        "attack": "0",
        "number_copies": "2",
    },
    {
        "difficulty": "6",
        "type_card": "duration",
        "name": "Full Force Forward",
        "id": "9",
        "price": "3",
        "detail": "\u00b7 +1 attack of your space ships (blue).\r\n\u00b7 Your space ships can move the first turn     they enter play.",
        "defense": "0",
        "attack": "0",
        "number_copies": "2",
    },
    {
        "difficulty": "5",
        "type_card": "spaceShip",
        "name": "Disturbing Sensor",
        "id": "37",
        "price": "4",
        "detail": "\u00b7 Enemy missiles can't move or attack.\r\n\u00b7 If opponent after draw phase has more   than 1 card in hand, he or she           discards a card.",
        "defense": "4",
        "attack": "0",
        "number_copies": "1",
    },
    {
        "difficulty": "1",
        "type_card": "spaceShip",
        "name": "Deadly Sniper",
        "id": "39",
        "price": "4",
        "detail": "Long distance shooter.\r\n(Can after the first turn shoot targets in enemy zone from home zone)",
        "defense": "4",
        "attack": "2",
        "number_copies": "1",
        "image_card": "https:\/\/admin.thespacewar.com\/source\/services\/generate_card_md_39.png"
    }
];

const SKIP = [
    {
        "id": "57",
        "name": "* Station *",
        "price": "0",
        "type_card": "event",
        "detail": "Draw 1 card. (normally used as a station card)",
        "defense": "0",
        "attack": "0",
        "number_copies": "0"
    },
    {
        "id": "33",
        "name": "Confusing Orders",
        "price": "1",
        "type_card": "event",
        "detail": "Target enemy space ship cannot do anything next turn.",
        "defense": "0",
        "attack": "0",
        "number_copies": "0",
    },
    {
        "id": "10",
        "name": "Defense Focus",
        "price": "3",
        "type_card": "duration",
        "detail": "Prevent the first damage in attacks to your space ships.",
        "defense": "0",
        "attack": "0",
        "number_copies": "0",
    },

];

const COUNTERS = [
    {
        "difficulty": "7",
        "type_card": "event",
        "name": "Target Missed",
        "id": "16",
        "price": "0",
        "detail": "Play this card directly during enemy attack from space ship (not colisision, missile or cannon) to make it fail. [ OR ] Draw 1 card.",
        "defense": "0",
        "attack": "0",
        "number_copies": "3",
    },
    {
        "difficulty": "2",
        "type_card": "event",
        "name": "Luck",
        "id": "31",
        "price": "0",
        "detail": "Counter target card costing 2 or less.\r\n[ OR ] Draw 2 cards.",
        "defense": "0",
        "attack": "0",
        "number_copies": "4",
    },
    {
        "difficulty": "5",
        "type_card": "duration",
        "name": "Avoid",
        "id": "34",
        "price": "2",
        "detail": "Discard this card from table to counter card being played.",
        "defense": "0",
        "attack": "0",
        "number_copies": "2",
    },

];

const HEAVY_GUI = [
    {
        "difficulty": "9",
        "type_card": "duration",
        "name": "Over Capacity",
        "id": "13",
        "price": "2",
        "detail": "You have no maximum hand size.\r\nDuring your action phase you may look at and move station cards to your hand.",
        "defense": "0",
        "attack": "0",
        "number_copies": "2",
    },
    {
        "difficulty": "7",
        "type_card": "event",
        "name": "Missiles Launched",
        "id": "17",
        "price": "5",
        "detail": "Find 2 missile cards (red cards) from your draw or discard pile and play them without cost.",
        "defense": "0",
        "attack": "0",
        "number_copies": "1",
    },
    {
        "difficulty": "7",
        "type_card": "event",
        "name": "Perfect Plan",
        "id": "18",
        "price": "2",
        "detail": "Search for a card from the draw pile, discard pile or station cards and put it into your hand.",
        "defense": "0",
        "attack": "0",
        "number_copies": "1",
    },
];

const EASY_GUI = [
    {
        "difficulty": "8",
        "type_card": "missile",
        "name": "EMP Missile",
        "id": "7",
        "price": "2",
        "detail": "Destroys Energy Shield or paralyzes space ship (turn the card and it cannot do anything until repaired).",
        "defense": "2",
        "attack": "0",
        "number_copies": "2",
    },
];

const NO_GUI = [];


const categories = [
    { name: 'Counters', tasks: COUNTERS, leadTime: 4 },
    { name: 'Heavy GUI', tasks: HEAVY_GUI, leadTime: 6 },
    { name: 'Easy GUI', tasks: EASY_GUI, leadTime: 3 },
    { name: 'No GUI', tasks: NO_GUI, leadTime: 2 }
];
const allCards = [
    ...[].concat.apply([], categories.map(c => c.tasks)),
    ...DONE,
    ...SKIP
];
const allTasksNotCounters = [].concat.apply([], categories.filter(c => c.name !== 'Counters').map(c => c.tasks));

const AVG_WEEKLY_WORK_TIME = 15;
const WEEKS_UNTIL_RELEASE = 3;

const totalDifficulty = categories.reduce((ca, a) => {
    return ca + a.tasks.reduce((ta, t) => {
        return ta + parseInt(t.difficulty, 10);
    }, 0);
}, 0);

const cardsNotIncluded = cardsJson.filter(card => {
    const hasNoEffect = [
        "Normal missile.",
        "Normal space ship.",
        "Normal cannon.",
    ].some(ignoreDetail => card.detail.includes(ignoreDetail));
    if (hasNoEffect) return false;

    return !allCards.some(c => c.id === card.id);
});

function run() {
    const rl = readline.createInterface(process.stdin, process.stdout);
    rl.on('line', line => {
        console.log('\n\n')
        if (line === 'commands') {
            console.log([
                'list',
                'status',
                'calculate success',
                'report'
            ].join('\n'));
        }
        else if (line === 'create tasks') {
            createTasksInKanbanflow();
        }
        else if (line === 'list') {
            printAllTasksRanked();
        }
        else if (line === 'status') {
            printCardsIncludedStatus();
        }
        else if (line === 'calculate success') {
            printSuccessCalculation();
        }
        else if (line === 'report') {
            printCardsIncludedStatus();
            console.log('\n\n')
            printAllTasksRanked();
            console.log('\n\n')
            printSuccessCalculation();
        }
        console.log('\n\nAnything else?')
    });
}

async function createTasksInKanbanflow() {
    // const KF_API_TOKEN = 'd81207bbd7b8944baece4a96f8a40a5a';
    const prioritizedColumnId = 'hEhN6dP01zlp';
    const devSwimlaneId = 'QgN9RhgcXigk';
    // const getBoardUrl = 'https://kanbanflow.com/api/v1/board?apiToken=d81207bbd7b8944baece4a96f8a40a5a'
    // url: "https://kanbanflow.com/api/v1/tasks",
    //     contentType: 'application/json',

    const doneTasks = [];
    const errors = [];

    const taskData = listAllTasksRanked().map(createTask);
    for (const task of taskData) {
        const data = { ...task, columnId: prioritizedColumnId, swimlaneId: devSwimlaneId };
        const url = `https://kanbanflow.com/api/v1/tasks?apiToken=d81207bbd7b8944baece4a96f8a40a5a`;

        process.stdout.write('\nSending task: ' + task.name);
        try {
            const { taskId } = await axios.post(url, data);
            doneTasks.push({ taskId, name: task.name });
            process.stdout.write(' . . . done');
        } catch (err) {
            process.stdout.write(' . . . FAILED!');
            errors.push(err);
        }
    }
    console.log('\n\n All done.')

    console.log('\nERRORS: ' + errors.length)
    console.log(errors.map((e, i) => `${i}: ${e.message}`).join('\n'));
    console.log('\nSucceeded with tasks: ' + doneTasks.map((t, i) => `${i}: ${t.name}\t${t.taskId}`));
}

function createTask(taskCard, index) {
    const cardData = cardsJson.find(c => c.id === taskCard.id);
    const difficulty = parseInt(taskCard.difficulty)
    const color = difficulty > 5 ? 'yellow' : 'orange';
    const description = `Card description: "${taskCard.detail}"`
        + `\nType: ${taskCard.type_card} (${cardData.type_card})`
        + `\nAttack: ${taskCard.attack}`
        + `\nDefense: ${taskCard.defense}`
        + `\nCost: ${taskCard.price}`
        + `\n\nNumber of copies: ${taskCard.number_copies}`
        + `\nDev. difficulty: ${taskCard.difficulty}`
        + `\nPriority score: ${getScoreForTask(taskCard)}`
    return {
        name: `${taskCard.name} (${taskCard.id})`,
        color,
        description,
        labels: [
            { name: 'Card', pinned: true }
        ],
        subTasks: [
            { name: 'Implement' },
            { name: 'Merge' }
        ],
        position: index
    };
}

function listAllTasksRanked() {
    return allTasksNotCounters.sort((a, b) => getScoreForTask(b) - getScoreForTask(a));
}

function printAllTasksRanked() {
    const tasksPrioritized = listAllTasksRanked();
    const taskList = tasksPrioritized.map((t, index) => {
        const {
            type_card: type,
            number_copies: nCopies,
            difficulty: diff,
            name,
            id
        } = t;
        const score = getScoreForTask(t);
        const order = index + 1;
        return `\n${order}: ${name.substr(
            0,
            10
        )}... x${nCopies}\tid: ${id}\ttype: ${type}\t difficulty: ${diff} \t (${score}p)`;
    });

    console.log('Total difficulty: ' + totalDifficulty);
    console.log('Priority list: ' + taskList);
}

function printCardsIncludedStatus() {
    if (cardsNotIncluded.length) {
        console.log('YOU ARE MISSING CARDS!');
        console.log('Cards not included: ' + cardsNotIncluded.map(c => c.name).join('\n'));
    }
    else {
        console.log(`All cards are included. A total of: ${allCards.length - SKIP.length} cards (+${SKIP.length} skipped)`);
    }
}

function printSuccessCalculation() {
    console.log('DONE: ' + DONE.length);
    categories.forEach(category => printCategory(category.name, category.tasks, category.leadTime));
    const totalEstimate = categories.reduce((acc, c) => acc + c.leadTime * c.tasks.length, 0);
    console.log('Total estimate: ' + totalEstimate + 'h (' + (totalEstimate / 24) + ' days)');
    console.log('Done in ' + totalEstimate / AVG_WEEKLY_WORK_TIME + ' weeks');
    console.log('You will... ' + (totalEstimate / AVG_WEEKLY_WORK_TIME < WEEKS_UNTIL_RELEASE ? 'SUCCEED :)' : 'FAIL :('));
}

function printCategory(name, tasks, leadTime) {
    const totalDifficultyOfCategory = tasks.reduce((ta, t) => ta + parseInt(t.difficulty), 0)
    const estimatedHours = leadTime * tasks.length
    console.log(`${name}: ${tasks.length}  \tEst. ${estimatedHours}h \tTotal difficulty: ${totalDifficultyOfCategory}`);
}

function getScoreForTask(task) {
    const priorities = {
        event: 2,
        duration: .8,
        spaceShip: .5,
        missile: 1,
        numberOfCopies: 3,
        difficulty: 1
    };
    const difficulty = parseInt(task.difficulty);
    const numberOfCopies = parseInt(task.number_copies);
    const difficultyReverseScore = 10 - difficulty;
    const score = (difficultyReverseScore * priorities.difficulty)
        + (numberOfCopies * priorities.numberOfCopies)
        + (priorities[task.type_card]);

    return Math.round((score * 100)) / 100;
}

run();