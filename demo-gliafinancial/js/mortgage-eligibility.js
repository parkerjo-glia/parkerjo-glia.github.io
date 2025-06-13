function CommaFormatted(amount) {
    var delimiter = ","; // replace comma if desired
    var a = amount.split('.',2)
    var d = a[1];
    var i = parseInt(a[0]);
    if(isNaN(i)) { return ''; }
    var minus = '';
    if(i < 0) { minus = '-'; }
    i = Math.abs(i);
    var n = new String(i);
    var a = [];
    while(n.length > 3) {
        var nn = n.substr(n.length-3);
        a.unshift(nn);
        n = n.substr(0,n.length-3);
    }
    if(n.length > 0) { a.unshift(n); }
    n = a.join(delimiter);
    if(d.length < 1) { amount = n; }
    else { amount = n + '.' + d; }
    amount = minus + amount;
    return amount;
}

function CurrencyFormatted(amount) {
    var i = parseFloat(amount);
    if(isNaN(i)) { i = 0.00; }
    var minus = '';
    if(i < 0) { minus = '-'; }
    i = Math.abs(i);
    i = parseInt((i + .005) * 100);
    i = i / 100;
    s = new String(i);
    if(s.indexOf('.') < 0) { s += '.00'; }
    if(s.indexOf('.') == (s.length - 2)) { s += '0'; }
    s = minus + s;
    return s;
}

function mortgageEligible() {
var term = document.formval2.period2.value;;
var rate = document.formval2.int_rate2.value;
var apr = rate / 12;
var amt = document.formval2.pr_amt2.value;
var inc = document.formval2.NetIncome.value;
var termmth = term * 12;


var payment = amt/40 *(apr * Math.pow((1 + apr), termmth))/(Math.pow((1 + apr), termmth) - 1);
var currency = CurrencyFormatted(payment)
var pmt = CommaFormatted(currency)

if (payment < inc) {
         document.formval3.field11.value = ("You would be eligible for this mortgage!! Your estimated monthly payment would be:");
         document.formval3.field12.value = ("");
         document.formval3.field13.value = ("$" + pmt);
          
     } else {
         document.formval3.field11.value = ("We are sorry! But you are not eligible for a mortgaged based on the provided informatoin");
         document.formval3.field12.value = ("");  
         document.formval3.field13.value = ("");
     }
}


