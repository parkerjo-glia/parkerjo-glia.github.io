window.defaultSite = window.defaultSite ?? { id: "e501268f-9055-4133-a379-64f2a85c08d6", name: "Glia Demo Universal - Digital" };
window.gliaContextSessionItemKey = "gliaContextSession";
var glia;
var username = localStorage.getItem('username');

// Determine site to use: URL param > localStorage > default
var gliaSiteRaw = localStorage.getItem('glia_site');
var useWebAddress = gliaSiteRaw === '"allowed-web-address"';
var gliaSite;

// Check for glia_site in URL query string first (highest priority)
var urlParams = new URLSearchParams(window.location.search);
var urlSiteId = urlParams.get('glia_site') || urlParams.get('site_id');

if (urlSiteId) {
    gliaSite = { id: urlSiteId, name: 'URL Parameter' };
} else if (useWebAddress) {
    gliaSite = null;
} else if (gliaSiteRaw) {
    gliaSite = JSON.parse(gliaSiteRaw) ?? defaultSite;
} else {
    gliaSite = defaultSite;
}

window.getGliaContext = function () {
    // Check for sessionId in URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');
    if (sessionId && sessionId !== "") {
        return { sessionId: sessionId };
    }
    return { sessionId: getGliaContextSession() };
}

var installGlia = function (callback) {
    var gliaIntegrationScriptUrl;

    if (useWebAddress && !urlSiteId) {
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
        if (urlSiteId) {
            gliaSiteElement.textContent = 'URL: ' + urlSiteId.substring(0, 8) + '...';
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
    var idToken;
    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log("200 ok from Lambda");
            idToken = this.responseText;

            window.getGliaContext = () => ({ idToken });

            installGlia(function () {
                sm.getApi({ version: 'v1' }).then(function (api) {
                    glia = api;
                    glia.addEventListener(glia.EVENTS.ENGAGEMENT_START, engagementStart);
                    glia.addEventListener(glia.EVENTS.ENGAGEMENT_END, engagementEnd);
                    glia.updateInformation({
                        externalId: '123456789',
                        name: username,
                        email: username + "@gmail.com",
                        phone: "915-555-5555",
                        customAttributes: {
                            Authenticated: 'YES'
                        }
                    }).then(function () {
                        window.dispatchEvent(new Event('glia-installed'));
                        postGliaInstalled();
                    }).catch(function () { });
                });
            });
        }
    });

    var awsURL = "https://u5aabf3fywin5ciiwtqgwvphhe0nnboh.lambda-url.us-east-1.on.aws/?myParam=" + username;
    xhr.open("GET", awsURL);
    xhr.send();
}

/**
 * Install Glia without obtaining authentication token
 */
function loadGliaUnauth() {
    installGlia(function () {
        sm.getApi({ version: 'v1' }).then(function (api) {
            glia = api;
            glia.addEventListener(glia.EVENTS.ENGAGEMENT_START, engagementStart);
            glia.addEventListener(glia.EVENTS.ENGAGEMENT_END, engagementEnd);
            glia.updateInformation({
                customAttributes: {
                    Authenticated: 'NO'
                }
            }).then(function () {
                window.dispatchEvent(new Event('glia-installed'));
                postGliaInstalled();
            }).catch(function () { });
        });
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
    window.getGliaContext = () => null;

    sm.getApi({ version: 'v1' }).then(function (glia) {
        glia.updateInformation({
            externalId: '',
            customAttributes: {
                Authenticated: 'NO'
            }
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
    }
}

function engagementEnd(engagement) {
    localStorage.removeItem('activeEngagement');
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
