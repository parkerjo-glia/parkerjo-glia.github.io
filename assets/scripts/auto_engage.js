var gliaAPI
var messageNdx = 0;
var conversation;
var visitor;
var currentEngagement;

var scriptCatalog;
var visitorCatalog;
const scriptCatalogURL = "https://parkerjo-glia.github.io/assets/json/script_catalog.json";
const visitorCatalogURL = "https://parkerjo-glia.github.io/assets/json/visitors_catalog.json";

/*
$.getJSON('./assets/json/script_catalog.json', data => {
    scriptCatalog = data;
});
$.getJSON('./assets/json/visitors_catalog.json', data => {
    visitorCatalog = data;
});
*/

async function syntheticEngagement(scriptId) {

    console.log("loading catalogs");
    await loadCatalogs();
    console.log("catalogs loaded");

    sm.getApi({ version: 'v1' }).then(function (glia) {
        gliaAPI = glia;
        messageNdx = 0;
        const scriptNdx = scriptId ?? getRandomNum(scriptCatalog.length - 1);
        const visitorNdx = getRandomNum(visitorCatalog.length - 1);
        conversation = scriptCatalog[scriptNdx];
        visitor = visitorCatalog[visitorNdx];

        var queue_id = '8c458838-cb59-4d6c-ae31-d04fd2bbda1f'; // func you up
        //var queue_id = '76dbea19-92f7-4e8b-8c6d-de99280b7bcd'; // GVA Queue
        glia.queueForEngagement('text', { queueId: queue_id })
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
                const timeout = getRandomNum(500);
                messageNdx = messageNdx + 1;

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
                    setTimeout(sendMessage, timeout, formatMessage(nextMsg.message, visitor));
                }).catch(err => {
                    alert(`Error: ${e}`);
                });
                break;
            case 'visitor-wait':
                console.log(`Waiting at step ${messageNdx}, waiting for ${nextMsg.timeout}`);
                messageNdx = messageNdx + 1;
                setTimeout(processAfterWait, nextMsg.timeout);
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

async function loadCatalogs() {
    await Promise.all[
        getData(scriptCatalog, scriptCatalogURL),
        getData(visitorCatalog, visitorCatalogURL)
    ];
}

async function getData(catalog, url) {
    try {
        console.log(`loading catalog from ${url}`);

        if (!catalog) {

            console.log(`loading catalog from ${url} - fetch`);
            const response = await fetch(url);
            console.log(`loading catalog from ${url} - fetch complete`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            catalog = await response.json();
            console.log('Data received:', data);
        }

        console.log(`loading catalog from ${url} :: Complete`);
        return catalog;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}