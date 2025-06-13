var invoke_make_blank = true;

$("#loginForm").submit(function (e) {
  e.preventDefault();
});

function pageType() {
  localStorage.setItem('isBanking', document.getElementsByClassName("banking").length);
  localStorage.setItem('isCU', document.getElementsByClassName("credit-union").length);
}

function validate() {

  //This rewrite is honestly a bit gross

  const isBanking = localStorage.getItem('isBanking');
  const isCU = localStorage.getItem('isCU');

  const validatePromise = new Promise(function (resolve, reject) {

    if (validate2()) {
      resolve('logged in');
    } else {
      reject('Something went wrong');
    }

  });

  validatePromise
    .catch(function (errorMessage) {
      console.log(errorMessage);
    })
    .then(setUserInfo(isBanking, isCU));

  function validate2() {
    const password = document.getElementById("password").value;
    const username = document.getElementById("first_name").value;

    var loggedIn = false;

    if (username.length > 1 && password == "glia123") {
      loggedIn = true;
      localStorage.setItem('loggingStatus', loggedIn);
      localStorage.setItem('username', username);
      //navigate moved to promise
      loggedIn = true;
      return loggedIn;

    } else if (!(username.length > 1 && password == "glia123") && invoke_make_blank) {
      var newDiv = document.createElement("div");
      var newContent = document.createTextNode("*Failed Login Attempt");
      newDiv.appendChild(newContent);
      newDiv.id = "error-login";
      var element = document.getElementById("username-div");
      var child = document.getElementById("username-label");
      element.insertBefore(newDiv, child);
      invoke_make_blank = false;
      loggedIn = false;
      localStorage.setItem('loggingStatus', loggedIn);
      return loggedIn;
    }
  }


}

/**
 * Sets Visitor Panel info
 */
function setUserInfo(isBanking, isCU) {

  const un = document.getElementById("first_name").value;

  sm.getApi({ version: 'v1' }).then(function (glia) {
    glia.updateInformation({
      //customAttributesUpdateMethod: 'replace',
      externalId: '123456789',
      name: un,
      email: un + "@gmail.com",
      phone: "915-555-5555",
      customAttributes: {
        Authenticated: 'YES'
      }
    }).catch(function (error) {
      console.log(JSON.stringify(error));
    }).then(function () {
      console.log('Custom attributes set');
      if (isBanking > 0) {
        window.location = "account-summary-banking.html";
        return true;
      } else if (isCU > 0) {
        window.location = "account-summary-credit-union.html";
        return true;
      } else {
        window.location = "account-summary-insurance.html";
        return true;
      }
    })
  });

}

function loggingToggle() {
  const loggedStatus = localStorage.getItem('loggingStatus');
  const username = localStorage.getItem('username');
  const isBanking = localStorage.getItem('isBanking');
  const isCU = localStorage.getItem('isCU');
  if (loggedStatus) {
    document.getElementsByClassName("login-section")[0].innerHTML = "<div class='control-label'>Welcome, " + username + "</div><a href='index.html' id='log-out'><span class='tooltiptext'>Log Out</span><img id='logout-icon' src='images/logout.png'</a>";
    logOut();

  } else {
    if (isBanking > 0) {
      document.getElementsByClassName("login-section")[0].innerHTML = "<a href='login-banking.html' class='btn btn-default log-in'>Log In</a>";
    } else if (isCU > 0) {
      document.getElementsByClassName("login-section")[0].innerHTML = "<a href='login-credit-union.html' class='btn btn-default log-in'>Log In</a>";
    } else {
      document.getElementsByClassName("login-section")[0].innerHTML = "<a href='login-insurance.html' class='btn btn-default log-in'>Log In</a>";
    }
  }
}

function logOut() {
  const logOutButton = document.getElementById("log-out");
  logOutButton.addEventListener("click", function () {
    localStorage.removeItem('loggingStatus', 'username');

    sm.getApi({ version: 'v1' }).then(function (glia) {
      glia.updateInformation({
        //customAttributesUpdateMethod: 'replace',
        externalId: '',
        customAttributes: {
          Authenticated: 'NO'
        }
      }).catch(function (error) {
        console.log(JSON.stringify(error));
      }).then(function () {
        console.log('Custom attributes set');
        if (isBanking > 0) {
          window.location = "account-summary-banking.html";
          return true;
        } else if (isCU > 0) {
          window.location = "account-summary-credit-union.html";
          return true;
        } else {
          window.location = "account-summary-insurance.html";
          return true;
        }
      })
    });


  });
}
