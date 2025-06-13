const defaultSite = { id: "e501268f-9055-4133-a379-64f2a85c08d6", name: "Glia Demo Universal - Digital" };
var username = localStorage.getItem('username');
var gliaSite = JSON.parse(localStorage.getItem('glia_site')) ?? defaultSite;

var installGlia = function (callback) {
    var gliaIntegrationScriptUrl = 'https://api.glia.com/salemove_integration.js?site_id=' + gliaSite.id;
    var scriptElement = document.createElement('script');

    scriptElement.async = 1;
    scriptElement.src = gliaIntegrationScriptUrl;
    scriptElement.type = 'text/javascript';
    if (typeof (callback) === 'function') {
        scriptElement.addEventListener('load', callback);
    }

    document.body.append(scriptElement);

    $("#glia-site").text(gliaSite.name);
};

/**
 * User has logged in, need to obtain the standard Id token first and then install Glia
 * Set additional custom attributes to indicate authenticated experience
 */
function loadGliaAfterAuth() {

    var idToken;
    var xhr = new XMLHttpRequest();

    // listen to completion of the XHR request to retrieve the ID Token
    // load glia after setting idToken value in Glia Context to ensure the visitor id doesn't change
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log("200 ok from Lambda");
            idToken = this.responseText;

            window.getGliaContext = () => ({ idToken });

            installGlia(function () {
                sm.getApi({ version: 'v1' }).then(function (glia) {
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
                    }).catch(function (error) {

                    });
                });
            });
        }
    });

    //AWS Lambda URL to get the Token(JWT)
    var awsURL = "https://u5aabf3fywin5ciiwtqgwvphhe0nnboh.lambda-url.us-east-1.on.aws/?myParam=" + username;
    xhr.open("GET", awsURL);
    xhr.send();
}

/**
 * Install Glia without obtaining authentication token
 * 
 */
function loadGliaUnauth() {
    installGlia(function () {
        sm.getApi({ version: 'v1' }).then(function (glia) {
            glia.updateInformation({
                customAttributes: {
                    Authenticated: 'NO'
                }
            }).then(function () {
                window.dispatchEvent(new Event('glia-installed'));
            }).catch(function (error) {

            });
        });
    });
}

if (username) {
    loadGliaAfterAuth();
} else {
    loadGliaUnauth();
}