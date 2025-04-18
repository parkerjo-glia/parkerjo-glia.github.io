var gliaAPI
var messageNdx = 0;
var conversation;
var visitor;
var currentEngagement;

var scriptCatalog;
var visitorCatalog;

$.getJSON('./assets/json/script_catalog.json', data => {
    scriptCatalog = data;
});
$.getJSON('./assets/json/visitors_catalog.json', data => {
    visitorCatalog = data;
});

function syntheticEngagement(scriptId) {

    sm.getApi({ version: 'v1' }).then(function (glia) {

        alert("Salemove loaded");
/*
        gliaAPI = glia;
        messageNdx = 0;
        const scriptNdx = scriptId ?? getRandomNum(scriptCatalog.length - 1);
        const visitorNdx = getRandomNum(visitorCatalog.length - 1);
        conversation = scriptCatalog[scriptNdx];
        visitor = visitorCatalog[visitorNdx];

        var queue_id = 'a50612a3-db67-4f2e-bc94-8bf3410a3b9f'; // func you up
        //var queue_id = '76dbea19-92f7-4e8b-8c6d-de99280b7bcd'; // GVA Queue
        glia.queueForEngagement('text', { queueId: queue_id })
        glia.addEventListener(glia.EVENTS.ENGAGEMENT_START, engagementStarted);
    */
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

    if (lastMessage.sender == 'operator') {
        console.log(`Received Operator Message for step ${messageNdx} :: ${JSON.stringify(lastMessage)}`);
        messageNdx = messageNdx + 1;
        setTimeout(processChatMessage, 500);
    }
}

function processChatMessage() {
    console.log(`Processing Step ${messageNdx}`);

    if (messageNdx >= conversation.messages.length) {
        currentEngagement.end().then(() => {
            alert("Engagement Over");
        });
    } else {

        const nextMsg = conversation.messages[messageNdx];
        console.log(`Processing Step ${messageNdx} :: ${nextMsg.sender} - ${nextMsg.type}`);

        switch (nextMsg.type) {
            case 'visitor-msg':
                messageNdx = messageNdx + 1;
                setTimeout(updateInfoAndSend,  nextMsg.delay, nextMsg);
                break;
            case 'visitor-wait':
                console.log(`Waiting at step ${messageNdx}, waiting for ${nextMsg.timeout}`);
                messageNdx = messageNdx + 1;
                setTimeout(processAfterWait, nextMsg.delay);
                break;
            case 'operator-wait':
                messageNdx = messageNdx + 1;
                processChatMessage();
                break;
            default:
                break;
        }
    }
}

function updateInfoAndSend(nextMsg) {
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
        sendMessage(formatMessage(nextMsg.message, visitor));
    }).catch(err => {
        alert(`Error: ${err}`);
    });
}

function sendMessage(message) {
    currentEngagement.chat.sendMessage(message, null);
    processChatMessage();
}

function processAfterWait() {
    console.log(`Wait is over, begin processing msg ${messageNdx}`);
    processChatMessage()
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