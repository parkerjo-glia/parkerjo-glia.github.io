window.defaultSite = window.defaultSite ?? { id: "e501268f-9055-4133-a379-64f2a85c08d6", name: "Glia Demo Universal - Digital" };
window.gliaContextSessionItemKey = "gliaContextSession";
var glia;
var username = localStorage.getItem('username');
var gliaSiteRaw = localStorage.getItem('glia_site');
var useWebAddress = gliaSiteRaw === '"allowed-web-address"';
var gliaSite = useWebAddress ? null : (JSON.parse(gliaSiteRaw) ?? defaultSite);

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
    var siteId;
    
    if (useWebAddress) {
        // Get site_id from URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        siteId = urlParams.get('site_id');
        if (!siteId) {
            console.warn('Glia: "Use Web Address" mode enabled but no site_id query parameter found');
            return;
        }
    } else {
        siteId = gliaSite.id;
    }

    var gliaIntegrationScriptUrl = 'https://api.glia.com/salemove_integration.js?site_id=' + siteId;
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
        if (useWebAddress) {
            gliaSiteElement.textContent = 'Web Address (' + siteId.substring(0, 8) + '...)';
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
                    glia.addEventListener(glia.EVENTS.ENGAGEMENT_START, addSubmitListener);
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
                        showCobrowseCode();
                    }).catch(function () {});
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
            glia.addEventListener(glia.EVENTS.ENGAGEMENT_START, addSubmitListener);
            glia.updateInformation({
                customAttributes: {
                    Authenticated: 'NO'
                }
            }).then(function () {
                window.dispatchEvent(new Event('glia-installed'));
                showCobrowseCode();
            }).catch(function () {});
        });
    });
}

function showCobrowseCode() {
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

function addSubmitListener(engagement) {
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
