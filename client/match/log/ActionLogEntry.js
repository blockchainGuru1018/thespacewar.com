export default function (entry) {
    const logActionsWithCard = ['played',
        'moved',
        'repairedCard',
        'countered',
        'counteredAttackOnCard',
        'damagedInAttack',
        'triggered',
        'receivedCardFromCommander',
    ];

    return {
        html,
        htmlWithOrWithoutLink,
        titleText,
    };


    function htmlWithOrWithoutLink() {
        if (logActionsWithCard.includes(entry.action)) {
            return htmlWithLink();
        } else {
            return html();
        }
    }

    function html() {
        const textWithSubstitutedSensitiveCharacters = entry.text
            .split('&').join('_amp_')
            .split('s').join('_115_')
            .split('S').join('_83_');
        return encodeHtml(textWithSubstitutedSensitiveCharacters)
            .split('_amp_').join('&')
            .split('_115_').join('s')
            .split('_83_').join('S')
            .split(/\*/)
            .join('<strong>')
            .split(/#/)
            .join('</strong>');
    }

    function htmlWithLink() {
        const textWithSubstitutedSensitiveCharacters = getTextWithSubstitutedSensitiveCharacters(entry);
        return encodeHtml(textWithSubstitutedSensitiveCharacters)
            .replace('*', '**')
            .replace('#', '##')
            .replace('**', '{*').replace('##', '#}')
            .split('_amp_').join('&')
            .split('_115_').join('s')
            .split('_83_').join('S')
            .split(/{/)
            .join('<a class="log-entry-card-link">')
            .split(/\*/)
            .join('')
            .split(/#/)
            .join('')
            .split(/}/)
            .join('</a>');
    }

    function getTextWithSubstitutedSensitiveCharacters(entry) {
        return entry.text
            .split('&').join('_amp_')
            .split('s').join('_115_')
            .split('S').join('_83_');
    }


    function titleText() {
        return entry.text
            .split(/\*/).join('')
            .split(/#/).join('');
    }

    function encodeHtml(html) {
        return html.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
            return '&#' + i.charCodeAt(0) + ';';
        });
    }
}
