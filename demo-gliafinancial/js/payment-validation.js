var invoke_make_blank = true;

function validatePayment() {
  const companyName = document.getElementById("company-name").value;
  const fullName = document.getElementById("full-name").value;
  const isBanking = localStorage.getItem('isBanking');
  if(companyName.length > 1 && fullName.length > 1) {
    if (isBanking > 0) {
      window.location = "confirm-payment-banking.html";
    } else {
      window.location = "confirm-payment-insurance.html";
    }

    var deleteDiv = document.getElementById("error-message");
    deleteDiv.remove();
  } else if (companyName.length < 1 && fullName.length < 1 && invoke_make_blank) {
    var newDiv = document.createElement("div");
    var newContent = document.createTextNode("*Required fields have to be filled");
    newDiv.appendChild(newContent);
    newDiv.id = "error-message";
    var element = document.getElementById("required-placement");
    var child = document.getElementById("required");
    element.insertBefore(newDiv, child);
    invoke_make_blank = false;
  }
}
