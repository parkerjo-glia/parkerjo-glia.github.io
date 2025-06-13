
var invoke_make_blank = true;

function pageType() {
  localStorage.setItem('isBanking', document.getElementsByClassName("banking").length);
}

function validate() {
  const firstName = document.getElementById("first_name").value
  localStorage.setItem("username", firstName);  
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;
  const isBanking = localStorage.getItem('isBanking');
  var loggedIn = false;

  if (username.length > 1 && password == "glia123") {
    if (isBanking > 0) {
      window.location = "account-summary-banking.html";
    } else {
      window.location = "account-summary-insurance.html";
    }
    loggedIn = true;
    localStorage.setItem('loggingStatus', loggedIn);
    localStorage.getItem('username', username);

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
  }
}

function loggingToggle() {
  const loggedStatus = localStorage.getItem('loggingStatus');
  const username = localStorage.getItem('username');
  const isBanking = localStorage.getItem('isBanking');
  if (loggedStatus) {
    document.getElementsByClassName("login-section")[0].innerHTML = "<div class='control-label'>Welcome, " + username + "</div><a href='index.html' id='log-out'><span class='tooltiptext'>Log Out</span><img id='logout-icon' src='images/logout.png'</a>";
    logOut();

  } else {
      if (isBanking > 0) {
        document.getElementsByClassName("login-section")[0].innerHTML = "<a href='login-banking.html' class='btn btn-default log-in'>Log In</a>";
      } else {
        document.getElementsByClassName("login-section")[0].innerHTML = "<a href='login-insurance.html' class='btn btn-default log-in'>Log In</a>";
      }
  }
}

function logOut() {
  const logOutButton =  document.getElementById("log-out");
  logOutButton.addEventListener("click", function() {
    localStorage.removeItem('loggingStatus', 'username');
  });
}