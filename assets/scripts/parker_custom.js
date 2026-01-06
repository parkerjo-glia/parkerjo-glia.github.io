window.defaultSite = window.defaultSite ?? { id: "70436271-1338-4b36-b07f-8d1c9f3d6d33", name: "Glia Demo Universal - SE 10" };
var glia;
var username = localStorage.getItem('username');
var gliaSite = JSON.parse(localStorage.getItem('glia_site')) ?? defaultSite;

var installGlia = function (callback) {

  // Capture URL parameters BEFORE Glia loads
  const originalUrl = window.location.href;
  const urlParams = new URLSearchParams(window.location.search);

  const sessionId = urlParams.get('sessionId');
  if (sessionId && sessionId !== "") {
    window.getGliaContext = () => {
      return {
        sessionId: sessionId
      }
    }
  }

  var gliaIntegrationScriptUrl = 'https://api.glia.com/salemove_integration.js?site_id=' + gliaSite.id;
  var scriptElement = document.createElement('script');

  scriptElement.async = 1;
  scriptElement.src = gliaIntegrationScriptUrl;
  scriptElement.type = 'text/javascript';
  if (typeof (callback) === 'function') {
    scriptElement.addEventListener('load', callback);
  }

  document.body.append(scriptElement);
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
          }).catch(function (error) {

          });
        });
      });
    }
  });

  //AWS Lambda URL to get the Token(JWT)
  // Lambda function is "getJWT"
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
      }).catch(function (error) {

      });
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
  window.getGliaContext = () => null

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
    })
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

// Wait for DOM to be fully loaded before executing Glia integration
document.addEventListener('DOMContentLoaded', function () {

  if (username) {
    loadGliaAfterAuth();

    const logOutButton = document.getElementById("btnLogOut");
    logOutButton.addEventListener("click", function () {
      logout();
    });

  } else {
    loadGliaUnauth();
  }

}); // End DOM ready event listener