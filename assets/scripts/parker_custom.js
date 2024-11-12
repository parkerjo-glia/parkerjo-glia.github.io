sm.getApi({version: 'v1'}).then(function(glia) {

    function addSubmitListener(engagement) {
      var submit = document.querySelector('#sign-up_btn');
  
      submit.addEventListener('click', function() {
        var name = document.querySelector('#name').value;
        var email = document.querySelector('#email').value;
        engagement.recordEvent({message: name + ' signed up with email ' + email});
      });
    }
  
    glia.addEventListener(glia.EVENTS.ENGAGEMENT_START, addSubmitListener);
});