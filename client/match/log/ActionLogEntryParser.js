module.exports = function (entry) {
    return {
        parse
    };

    function parse() {
        const textWithSubstitutedSensitiveCharacters = entry.text
            .split('&').join('_amp_')
            .split('s').join('_115_')
            .split('S').join('_83_');
        const encodedText = encodeHtml(textWithSubstitutedSensitiveCharacters)
            .split('_amp_').join('&')
            .split('_115_').join('s')
            .split('_83_').join('S');

        return renderPart(parsePart(encodedText, 0));
    }

    function parsePart(text, startIndex = 0, type = '') {
        const subParts = [];
        let i = 0;
        while (i < text.length) {
            if (text[i] === '*') {
                const textToParse = text.slice(i + 1);
                const subPart = parsePart(textToParse, i, 'strong');
                i = subPart.endIndex;
                subParts.push(subPart);
            }
            if (text[i] === '-' && text[i + 1] === '-') {
                const textToParse = text.slice(i + 2);
                const subPart = parsePart(textToParse, i, 'cardInfo');
                i = subPart.endIndex;
                subParts.push(subPart);
            }
            else if (text[i] === '#') {
                break;
            }
            else {
                i++;
            }
        }

        const finalText = text.slice(0, i);
        return {
            text: finalText,
            startIndex,
            endIndex: startIndex + i + 2,
            subParts,
            type
        };
    }

    function renderPart(part) {
        if (part.type === 'cardInfo') {
            const [cardName, cardCommonId] = part.text.split(',');
            return cardName;
        }
        else {
            return renderNestablePartType(part);
        }
    }

    function renderNestablePartType(part) {
        const characters = [];

        if (part.type === 'strong') {
            characters.push(...'<strong>');
        }

        let sliceFromIndex = 0;

        const subParts = part.subParts;
        for (let index = 0; index < subParts.length; index++) {
            const subPart = subParts[index];

            const textUpUntilSubPart = part.text.slice(sliceFromIndex, subPart.startIndex);
            characters.push(...textUpUntilSubPart);
            sliceFromIndex = subPart.endIndex;

            characters.push(...renderPart(subPart));
        }

        const restOfText = part.text.slice(sliceFromIndex, part.text.length);
        characters.push(...restOfText);

        if (part.type === 'strong') {
            characters.push(...'</strong>');
        }
        return characters.join('');
    }

    function encodeHtml(html) {
        return html.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
            return '&#' + i.charCodeAt(0) + ';';
        });
    }
};
