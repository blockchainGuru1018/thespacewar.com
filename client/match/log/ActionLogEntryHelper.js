export default function (entry) {
    const logActionsWithCard = [
        "played",
        "moved",
        "repairedCard",
        "paralyzed",
        "destroyed",
        "countered",
        "counteredAttackOnCard",
        "damagedInAttack",
        "triggered",
        "receivedCardFromCommander",
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
            .split("&")
            .join("_amp_")
            .split("s")
            .join("_115_")
            .split("S")
            .join("_83_");
        return encodeHtml(textWithSubstitutedSensitiveCharacters)
            .split("_amp_")
            .join("&")
            .split("_115_")
            .join("s")
            .split("_83_")
            .join("S")
            .split(/\*/)
            .join("<strong>")
            .split(/#/)
            .join("</strong>");
    }

    function htmlWithLink() {
        const cardName = getCardName();

        const cardNameWithAnchors = `<a class="actionLog-entryCardLink"> ${cardName} </a>`;

        return html().replace(cardName, cardNameWithAnchors);
    }

    function getCardName() {
        return entry.text
            .substring(
                entry.text.lastIndexOf("*") + 1,
                entry.text.lastIndexOf("#")
            )
            .replace("#", "");
    }

    function titleText() {
        return entry.text.split(/\*/).join("").split(/#/).join("");
    }

    function encodeHtml(html) {
        return html.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
            return "&#" + i.charCodeAt(0) + ";";
        });
    }
}
