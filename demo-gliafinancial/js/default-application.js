var invoke_make_blank = true;

function required() {
  var empt = document.forms["default-application"]["annual-income"].value;
  if (empt == "" && invoke_make_blank) {
    var newDiv = document.createElement("div");
    var newContent = document.createTextNode("*Required");
    newDiv.appendChild(newContent);
    newDiv.id = "error-div";
    var element = document.getElementById("income-div");
    var child = document.getElementById("income-label");
    element.insertBefore(newDiv, child);
    invoke_make_blank = false;
    return false;
  } else if (empt != "" && (invoke_make_blank == false || invoke_make_blank == true)) {
    localStorage.setItem('setApplicationName', document.getElementsByClassName("page-title")[0].innerHTML)
    localStorage.setItem('setApplicationId', document.getElementsByClassName("application-id")[0].innerHTML)
    const isBanking = localStorage.getItem('isBanking');
    if (isBanking > 0) {
      window.location = "confirmation-banking.html";
    } else {
      window.location = "confirmation-insurance.html";
    }
    var deleteDiv = document.getElementById("error-div");
    deleteDiv.remove();

    return true;
  }
}

// Make help button show tooltip
$(document).ready(function () {
  $('[data-toggle="popover"]').popover();

  // Subscribe to the "glia-installed" event
  window.addEventListener('glia-installed', function () {
    sm.getApi({ version: 'v1' }).then(function (glia) {

      function addSubmitListener(engagement) {
        var submit = document.querySelector('#submit-checking');

        submit.addEventListener('click', function () {
          engagement.recordEvent({ message: 'Visitor received an error trying to submit their checking account application.' });
        });
      }

      glia.addEventListener(glia.EVENTS.ENGAGEMENT_START, addSubmitListener);
    });
  });
});

function setApplicationData() {
  var applicationName = localStorage.getItem('setApplicationName');
  document.getElementById("application-name").innerHTML = applicationName;
  var applicationId = localStorage.getItem('setApplicationId');
  var regex = /[0-9]{10}/;
  var substract = applicationId.match(regex);
  document.getElementById("confirm-application-id").innerHTML = substract;
}
