sm.getApi({version: 'v1'}).then(function(glia) {

    function addSubmitListener(engagement) {
      var submit = document.querySelector('#sign-up_btn');
  
      submit.addEventListener('click', function() {
        var email = document.querySelector('#email').value;
        engagement.recordEvent({message: 'Visitor signed up with e-mail: ' + email});
      });
    }
  
    glia.addEventListener(glia.EVENTS.ENGAGEMENT_START, addSubmitListener);
});