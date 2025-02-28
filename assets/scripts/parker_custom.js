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