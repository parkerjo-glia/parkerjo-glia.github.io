window.defaultSite = window.defaultSite ?? { id: "e501268f-9055-4133-a379-64f2a85c08d6", name: "Glia Demo Universal - Digital" };
window.gliaContextSessionItemKey = "gliaContextSession";

// UUID validation helper - defined here since it's used before site-selector loads
function isUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

window.gliaDemo = {};

window.gliaDemo.sites = [
    { id: '', name: '' },
    { id: 'e501268f-9055-4133-a379-64f2a85c08d6', name: 'Glia Demo Universal - Digital', code: "demo_digital" },
    { id: '209c6db0-4f0c-4002-bf09-0e9b57e701c3', name: 'Glia Demo Universal - Phone', code: "demo_phone" },
    { id: '19243c86-8fb5-4841-9b16-5567adaec1b9', name: 'Glia SE 1 - Demo', code: "se1_demo" },
    { id: '8737a7ef-0aff-4b24-a4b4-dac24e35a21c', name: 'Glia SE 2 - Demo', code: "se2_demo" },
    { id: 'b23158b9-4c19-4858-99f1-85155540f80c', name: 'Glia SE 3 - Demo', code: "se3_demo" },
    { id: '18ad232b-bf58-4cb7-99c6-c0b2b1d47d51', name: 'Glia SE 4 - Demo', code: "se4_demo" },
    { id: 'e31cf5bc-7d87-4495-ad9b-3c104b45b3ee', name: 'Glia SE 5 - Demo', code: "se5_demo" },
    { id: '4f629cae-abd6-486d-9140-3bc6506c2d6c', name: 'Glia SE 6 - Demo', code: "se6_demo" },
    { id: 'af76e495-7859-43de-9d3b-a46f83dedb98', name: 'Glia SE 7 - Demo', code: "se7_demo" },
    { id: '07c4fad6-6a45-4673-b164-7bd767633fb9', name: 'Glia SE 8 - Demo', code: "se8_demo" },
    { id: '0062f71e-899d-4c16-b1eb-dd370fbc6e83', name: 'Glia SE 9 - Demo', code: "se9_demo" },
    { id: '70436271-1338-4b36-b07f-8d1c9f3d6d33', name: 'Glia SE 10 - Demo', code: "se10_demo" },
    { id: '6779a7de-7336-47da-aa82-76c0a1993bb0', name: 'Glia SE 11 - Demo', code: "se11_demo" }
];

window.gliaDemo.seAgents = [
    {
        siteId: '209c6db0-4f0c-4002-bf09-0e9b57e701c3', agents: [
            { name: "Brian Christiansen", code: "brian-c" },
            { name: "Chad Anderson", code: "chad-a" },
            { name: "Jimi Hendrix", code: "jimi" },
            { name: "Jonathan Parker", code: "parker" },
            { name: "Kishan Patel", code: "kishan" },
            { name: "Robert Blain", code: "blain" },
            { name: "Sandy Chansamone", code: "sandy" },
            { name: "Scott Hathaway", code: "scott" },
            { name: "Steve Revucky", code: "steve" },
            { name: "Teagrin Forde", code: "tea-grin" }
        ]
    }
]

var glia;
var username = localStorage.getItem('username');

// Determine site to use: URL param > localStorage > default
var gliaSiteRaw = localStorage.getItem('glia_site');
var useWebAddress = gliaSiteRaw === '"allowed-web-address"';
var gliaSite;

// Check for glia_site in URL query string first (highest priority)
var urlParams = new URLSearchParams(window.location.search);
var siteParam = urlParams.get('glia_site') || urlParams.get('site_id');

if (siteParam) {
    gliaSite = window.gliaDemo.sites.find(
        site => site.id === siteParam || site.code === siteParam
    );

    if (!gliaSite && isUUID(siteParam)) {
        gliaSite = { id: siteParam, name: "Manual Demo" };
    }

    if (gliaSite) {
        localStorage.setItem('glia_site', JSON.stringify(gliaSite));
    }
} else if (useWebAddress) {
    gliaSite = null;
} else if (gliaSiteRaw) {
    gliaSite = JSON.parse(gliaSiteRaw) ?? defaultSite;
} else {
    gliaSite = defaultSite;
}

/*
window.getGliaContext = function () {
    // Check for sessionId in URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');
    if (sessionId && sessionId !== "") {
        return { sessionId: sessionId };
    }
    return { sessionId: getGliaContextSession() };
}*/

var installGlia = function (callback) {
    var gliaIntegrationScriptUrl;

    if (useWebAddress && !siteParam) {
        // Load without site_id - Glia will use site_id from the page's URL query string
        gliaIntegrationScriptUrl = 'https://api.glia.com/salemove_integration.js';
    } else {
        gliaIntegrationScriptUrl = 'https://api.glia.com/salemove_integration.js?site_id=' + gliaSite.id;
    }

    var scriptElement = document.createElement('script');

    scriptElement.async = 1;
    scriptElement.src = gliaIntegrationScriptUrl;
    scriptElement.type = 'text/javascript';
    if (typeof (callback) === 'function') {
        scriptElement.addEventListener('load', callback);
    }

    document.body.append(scriptElement);

    var gliaSiteElement = document.getElementById("glia-site");
    if (gliaSiteElement) {
        if (siteParam) {
            gliaSiteElement.textContent = 'URL: ' + siteParam.substring(0, 8) + '...';
        } else if (useWebAddress) {
            gliaSiteElement.textContent = 'Web Address';
        } else {
            gliaSiteElement.textContent = gliaSite.name;
        }
    }
};

/**
 * User has logged in, need to obtain the standard Id token first and then install Glia
 * Set additional custom attributes to indicate authenticated experience
 */
function loadGliaAfterAuth() {

    var authVisitorInfo = {
        externalId: "123456789",
        customAttributes: {}
    };

    var useDirectId = localStorage.getItem("useDirectId") === "true";

    if (useDirectId) {
        var idToken;
        var xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                console.log("200 ok from Lambda");
                idToken = this.responseText;

                window.getGliaContext = () => ({ idToken });

                installGlia(() => postGliaLoaded(authVisitorInfo));
            }
        });

        var awsURL = "https://u5aabf3fywin5ciiwtqgwvphhe0nnboh.lambda-url.us-east-1.on.aws/?myParam=" + username;
        xhr.open("GET", awsURL);
        xhr.send();
    } else {
        installGlia(() => postGliaLoaded(authVisitorInfo));
    }
}

/**
 * Install Glia without obtaining authentication token
 */
function loadGliaUnauth() {
    installGlia(postGliaLoaded);
}

function postGliaLoaded(visitorInfo) {
    sm.getApi({ version: 'v1' }).then(function (api) {
        glia = api;
        glia.addEventListener(glia.EVENTS.ENGAGEMENT_START, engagementStart);
        glia.addEventListener(glia.EVENTS.ENGAGEMENT_END, engagementEnd);
        glia.updateInformation(visitorInfo).then(function () {
            window.dispatchEvent(new Event('glia-installed'));
            postGliaInstalled(glia);
        }).catch(function () { });
    });
}

function postGliaInstalled(glia) {

    if (!glia.isInEngagement()) {
        localStorage.removeItem('activeEngagement');
    }

    // Show Cobrowse if applicable
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('show_cbcode')) {
        document.body.appendChild(document.createElement('sm-visitor-code'));
    }
}

function logout() {

    localStorage.removeItem('loggingStatus');
    localStorage.removeItem('username');
    localStorage.removeItem('useDirectId');
    localStorage.removeItem('sessionExpiration');

    window.getGliaContext = () => null;

    sm.getApi({ version: 'v1' }).then(function (glia) {
        glia.updateInformation({
            externalId: '',
            customAttributes: {}
        }).catch(function (error) {
            console.log(JSON.stringify(error));
        }).then(function () {
            console.log('Custom attributes set for unauthenticated user');
            window.location = "index.html";
            return true;
        });
    });
}

function engagementStart(engagement) {
    var submit = document.querySelector('#sign-up_btn');

    if (submit) {
        submit.addEventListener('click', function () {
            var nameField = document.querySelector('#name');
            var emailField = document.querySelector('#email');

            if (nameField && emailField) {
                var name = nameField.value;
                var email = emailField.value;
                engagement.recordEvent({ message: name + ' signed up with email ' + email });
            }
        });
    }

    if (engagement && engagement.engagementId) {
        setLocalStorageItemWithExpiry('activeEngagement', engagement.engagementId);
        var changeGliaSiteLink = document.getElementById('change-glia-site-link');
        if (changeGliaSiteLink) {
            changeGliaSiteLink.style.opacity = '0.5';
            changeGliaSiteLink.style.cursor = 'not-allowed';
            changeGliaSiteLink.onclick = function (e) {
                e.preventDefault();
                alert('Cannot change Glia site while an engagement is active.');
            };
        }
    }
}

function engagementEnd(engagement) {
    localStorage.removeItem('activeEngagement');
    var changeGliaSiteLink = document.getElementById('change-glia-site-link');
    if (changeGliaSiteLink) {
        changeGliaSiteLink.style.opacity = '';
        changeGliaSiteLink.style.cursor = '';
        changeGliaSiteLink.onclick = null;
    }
}

function getGliaContextSession() {
    const gliaContextSession = getLocalStorageItemWithExpiry(window.gliaContextSessionItemKey);

    if (!gliaContextSession) {
        const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        return setLocalStorageItemWithExpiry(window.gliaContextSessionItemKey, sessionId).value;
    }

    return gliaContextSession;
}

function getLocalStorageItemWithExpiry(key) {
    const itemStr = localStorage.getItem(key);

    if (!itemStr) {
        return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }
    return item.value;
}

function setLocalStorageItemWithExpiry(key, value, ttlMS) {
    const now = new Date();
    const ttl = ttlMS || 3600000; // default to 1 hour expiration

    const item = {
        value: value,
        expiry: now.getTime() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));

    return item;
}

// Wait for DOM to be fully loaded before executing Glia integration
document.addEventListener('DOMContentLoaded', function () {
    if (username) {
        loadGliaAfterAuth();

        const logOutButton = document.getElementById("btnLogOut");
        if (logOutButton) {
            logOutButton.addEventListener("click", function () {
                logout();
            });
        }
    } else {
        loadGliaUnauth();
    }
});
