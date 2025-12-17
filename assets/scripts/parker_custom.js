
var installGlia = function (callback) {

  var gliaIntegrationScriptUrl = 'https://api.glia.com/salemove_integration.js';

  // If the current page URL contains a `sessionId` query param,
  // append it to the Glia script URL as `session_context`.
  try {
    var urlParams = new URLSearchParams(window.location.search);
    var sessionId = urlParams.get('sessionId');
    if (sessionId) {
      var sep = gliaIntegrationScriptUrl.indexOf('?') === -1 ? '?' : '&';
      gliaIntegrationScriptUrl += sep + 'session_context=' + encodeURIComponent(sessionId);
    }
  } catch (e) {
    // URLSearchParams may not be available in very old browsers; fail silently.
  }

  var scriptElement = document.createElement('script');

  scriptElement.async = 1;
  scriptElement.src = gliaIntegrationScriptUrl;
  scriptElement.type = 'text/javascript';
  if (typeof (callback) === 'function') {
    scriptElement.addEventListener('load', callback);
  }

  document.body.append(scriptElement);
};

installGlia(function () {

  var glia;

  sm.getApi({ version: 'v1' }).then(function (api) {
    glia = api;
    glia.addEventListener(glia.EVENTS.ENGAGEMENT_START, addSubmitListener);
  });

  function addSubmitListener(engagement) {
    var submit = document.querySelector('#sign-up_btn');

    submit.addEventListener('click', function () {
      var name = document.querySelector('#name').value;
      var email = document.querySelector('#email').value;
      engagement.recordEvent({ message: name + ' signed up with email ' + email });
    });
  }
});