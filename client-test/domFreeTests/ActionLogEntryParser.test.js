const ActionLogEntryParser = require('../../client/match/log/ActionLogEntryParser.js');

test('wrap part of text with strong', () => {
    const actionLogParser = ActionLogEntryParser({
        text: 'Not strong *is strong#'
    });

    const html = actionLogParser.parse();

    expect(html).toEqual('Not strong <strong>is strong</strong>');
});

test('wrap multiple parts with strong', () => {
    const actionLogParser = ActionLogEntryParser({
        text: 'Not strong *is strong# Not this *but this#'
    });

    const html = actionLogParser.parse();

    expect(html).toEqual('Not strong <strong>is strong</strong> Not this <strong>but this</strong>');
});

test('wrap strong inside strong', () => {
    const actionLogParser = ActionLogEntryParser({
        text: 'Not strong *is *not# strong#'
    });

    const html = actionLogParser.parse();

    expect(html).toEqual('Not strong <strong>is <strong>not</strong> strong</strong>');
});

test('little s should behave correctly', () => {
    const actionLogParser = ActionLogEntryParser({
        text: 's'
    });

    const html = actionLogParser.parse();

    expect(html).toEqual('s');
});

test('big S should behave correctly', () => {
    const actionLogParser = ActionLogEntryParser({
        text: 'S'
    });

    const html = actionLogParser.parse();

    expect(html).toEqual('S');
});

test('ampersand "&" should behave correctly', () => {
    const actionLogParser = ActionLogEntryParser({
        text: '&'
    });

    const html = actionLogParser.parse();

    expect(html).toEqual('&');
});

test('when parsing cardInfo should only show first comma separated part', () => {
    const actionLogParser = ActionLogEntryParser({
        text: '--yes,no#'
    });

    const html = actionLogParser.parse();

    expect(html).toEqual('yes');
});

test('can have cardInfo inside strong part', () => {
    const actionLogParser = ActionLogEntryParser({
        text: '*--yes,no##'
    });

    const html = actionLogParser.parse();

    expect(html).toEqual('<strong>yes</strong>');
});

test('when parsing cardInfo should only show first comma separated part', () => {
    const actionLogParser = ActionLogEntryParser({
        text: '--lulle,123#'
    });

    const html = actionLogParser.parse();

    expect(html).toEqual('<yes</strong>');
});

//plan
// 1. Break out parser that will create a tree from input text
// 2. Create file that takes the tree and a createElement function (the "h" from vue render functions) and returns a vue component

