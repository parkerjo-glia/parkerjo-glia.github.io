var gliaAPI
var conversation;
var messageNdx = 0;
var visitor;
var currentEngagement;

var scriptCatalog = [];
var visitorCatalog = [];

$.getJSON('./assets/json/script_catalog.json', data => {
    scriptCatalog = data;
});
$.getJSON('./assets/json/visitors_catalog.json', data => {
    visitorCatalog = data;
});

function syntheticEngagement() {
    sm.getApi({ version: 'v1' }).then(function (glia) {
        messageNdx = 0;
        const scriptNdx = getRandomNum(scriptCatalog.length - 1);
        const visitorNdx = getRandomNum(visitorCatalog.length - 1);
        conversation = scriptCatalog[scriptNdx];
        visitor = visitorCatalog[visitorNdx];

        gliaAPI = glia;
        glia.queueForEngagement('text', { queueId: '76dbea19-92f7-4e8b-8c6d-de99280b7bcd' })
        glia.addEventListener(glia.EVENTS.ENGAGEMENT_START, engagementStarted);
    }).catch(e => {
        alert(`Error: ${e}`);
    });
}

function engagementStarted(engagement) {
    console.log("Engagement Started");
    currentEngagement = engagement;
    engagement.chat.addEventListener(engagement.chat.EVENTS.MESSAGES_WITH_STATUS_UPDATES, messageReceived);
}

function messageReceived(messages) {
    const lastMessage = messages[0];

    if (lastMessage.sender == 'operator' || (lastMessage.sender == 'visitor' && lastMessage.status == 'delivered')) {
        messageNdx = messageNdx + 1;
        processChatMessage();
    }
}

function processChatMessage() {

    if (messageNdx >= conversation.messages.length) {
        currentEngagement.end().then(() => {
            alert("Engagement Over");
        });
    } else {

        gliaAPI.updateInformation({
            name: visitor.name,
            phone: visitor.phone,
            email: visitor.email,
            customAttributesUpdateMethod: 'merge',
            customAttributes: {
                visitor_id: `${visitor.id}`,
                conversation_id: `${conversation.id}`,
                step_in_conversation: `${messageNdx}`
            }
        }).then(() => {

            const nextMsg = conversation.messages[messageNdx];

            switch (nextMsg.type) {
                case 'visitor-msg':
                    const charNum = nextMsg.message.length;
                    const timeout = charNum * getRandomNum(25);

                    setTimeout(currentEngagement.chat.sendMessage, timeout, formatMessage(nextMsg.message, visitor));
                    break;
                case 'visitor-wait':
                    messageNdx = messageNdx + 1
                    setTimeout(processChatMessage, nextMsg.timeout)
                case 'operator-wait':
                    messageNdx = messageNdx + 1
                    processChatMessage();
                default:
                    break;
            }
        }).catch(err => {

        });
    }
}

function sendMessage(message) {
    currentEngagement.chat.sendMessage(message, null);
    messageNdx = messageNdx + 1;
    processChatMessage();
}

function getRandomNum(maxNum) {
    return Math.floor(Math.random() * maxNum);
}

function formatMessage(str, data) {
    for (const key in data) {
        const regex = new RegExp(`\\$\\{${key}\\}`, 'g'); // 'g' flag for global replacement
        str = str.replace(regex, data[key]);
    }
    return str;
}