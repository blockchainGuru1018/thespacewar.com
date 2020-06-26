const FindCardRequirementFactory = require('../match/requirement/FindCardRequirementFactory.js');
const FakeCardDataAssembler = require("./testUtils/FakeCardDataAssembler.js");
const createState = require('./fakeFactories/createState.js');
const createCard = FakeCardDataAssembler.createCard;
const TestHelper = require('./fakeFactories/TestHelper.js');

test('can create a requirement with a limit of actions points',()=>{
    const testHelper = TestHelper(createState({
        playerStateById:{
            'P1A': {
                discardedCards:  [createCard({id: '1', cost: 6}), createCard({id: '2', cost: 7})]
            }
        }
    }));

    const findCardRequirementFactory = FindCardRequirementFactory({
        //sourceFetcher: { discardPile: ()=>{return [{id: '1', cost: 6}, {id: '2', cost: 7}]}},
        sourceFetcher: testHelper.sourceFetcher('P1A'),
        requirementSpec: {
            "type": "findCard",
            "count": 2,
            "actionPointsLimit": 6,
            "sources": [
              "discardPile"
            ],
            "target": "hand",
            "submitOnEverySelect": true
        },
        card: {commonId: 88}
    });

    const r = findCardRequirementFactory.create();
    expect(r).toEqual({ 
        type: "findCard",
        cardGroups: [ {
            source: 'discardPile',
            cards: [
                {id: '1', cost: 6}
            ]
        }],
        cardCommonId: 88,
        count: 2,
        target: 'hand',
        common: false,
        waiting: false,
        cancelable: false,
        actionPointsLimit:{ 
            actionPointsLeft: 6
        },
        submitOnEverySelect: true
    })
})