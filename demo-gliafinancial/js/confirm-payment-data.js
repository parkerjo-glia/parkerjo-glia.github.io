function getPaymentData() {
localStorage.setItem('setPaymentData', document.getElementById("payment-data").innerHTML);
}

var policyNr
function setPaymentData() {
  var paymentData = localStorage.getItem('setPaymentData');
  var accountRegex = /\*.{4}/;
  var accountNr = paymentData.match(accountRegex);
  document.getElementById("account-nr").innerHTML = accountNr;
  var amountRegex = /\$.*/;
  var paymentAmount = paymentData.match(amountRegex);
  document.getElementById("payment-amount").innerHTML = paymentAmount;
  policyNr = Math.floor(Math.random() * 100000000);
  document.getElementById("policy-nr").innerHTML = policyNr;
  localStorage.setItem('setPolicyNr', policyNr);
}

function getPolicyNr() {
  const getPolicyNr = localStorage.getItem('setPolicyNr');
  document.getElementById("policy-nr").innerHTML = getPolicyNr;
}
