export default function (entry) {
    return {
        html,
        titleText
    };

    function html() {
        const textWithSubstitutedSensitiveCharacters = entry.text
            .split('&').join('_amp_')
            .split('s').join('_115_')
            .split('S').join('_83_');
        return encodeHtml(textWithSubstitutedSensitiveCharacters)
            .split('_amp_').join('&')
            .split('_115_').join('s')
            .split('_83_').join('S')
            .split(/{/)
            .join('<a>')
            .split(/\*/)
            .join('<strong>')
            .split(/#/)
            .join('</strong>')
            .split(/}/)
            .join('</a>');
    }

    function titleText() {
        return entry.text
            .split(/\*/).join('')
            .split(/#/).join('');
    }

    function encodeHtml(html) {
        return html.replace('**', '{*').replace('##', '#}').replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
            return '&#' + i.charCodeAt(0) + ';';
        });
    }
}
