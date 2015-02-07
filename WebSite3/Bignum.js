

var bp = 7; // number of digits per token. Store the base in power of 10 - range 1-7 - if 8 or over, then the multiplicatin will result in 16 digits which exceeds the javascript maximum of 2^32
var base = Math.pow(10, bp);
var PRECISION = 3 // maximum number of tokens

//**************************************************************************************
//                         C O N S T R U C T O R

// Constructor for the bignum structure 
// stored in an array of interger "tokens" or precision bp defined as a constant (1=7)
// the structure of the bignum is 
// "s" for sign, "e" for exponent" and "v" for the array value
// The least significant token is stored in V[0] (the reverse from normal notation) 
// The constructor accepts a string as a prarameter. 
// This is a scientific notation string starting with a sign (or nothing for +) 
//**************************************************************************************

function Big(n) {

    this.e = 0;
    this.v = new Array();
    this.s = 0;

    var i, j, nl;
    var dp = 0;
    var ex = 0;
    var base_e;
    var rem_e;
    var ina = new Array();      //Array to store the integer part 
    var dpa = new Array();      //Array to store the decimal point part 


    if (n == null) return;

    n = n.replace(/\s+/g, ''); // remove all the spaces

    this.s = (n.charAt(0) == '-') ? (n = n.slice(1), -1) : 1; //store and strip the sign



    if ((dp = n.indexOf('.')) >= 0) { // Decimal point?
        n = n.replace('.', '');
        ex = dp;
    }

    if ((i = n.search(/e/i)) > 0) { // search for the character E or e
        (dp < 0) ? ex = i : ex = dp; // if there is no decimal point, set ex to length otherwise dp
        ex = ex + parseInt(n.slice(i + 1));  // add to ex whatever number follows character E
        n = n.slice(0, i); // cut the exponential part off the string so we only have the start

    } else if (dp < 0) {  // if we dont find char E and there are no DP, then it's an integer
        ex = n.length;
    }

    // Determine leading zeros
    for (var lz = 0; n.charAt(lz) == '0'; lz++) { }  // count the number of leading zeros in lz     

    if (lz == (n.length)) { // the string is just a series of Zeros
        this.v[0] = this.e[0] = 0;
        return;
    }


    for (var tz = 0 ; n.charAt(n.length - 1 - tz) == '0'; tz++) { }  // count how many trailin zeros
    n = n.slice(lz, n.length - tz);  // remove the leading and trailing zeros. 
    ex = ex - lz - 1; // adjust the exponent for leading and trailing zeros

    // At this stage we have a clean number in base 10 with ex representing the exponent in scientific notation
    // the string n is also in scientific notation without a decimal point, assuming the first digit is the unit.
    // we now have to convert base 10 in the base of the bignum.

    this.e = Math.floor(ex / bp); // the exponent conversion is trivial, simply the division

    if (ex < 0) {  // if the final number has still negative exponent shift the string to be a multiple of bp

        ex = (-ex-1) % bp  ;
        for (i = 0; i < ex; i++)  // pad zeros before N
            n = "0" + n;

        for (i = 0; i < n.length % bp; i++)  // pad the remaining zeros after N
            n = n + "0";

    }
    else {  // if the exponent is positive

        nl = n.length;
        if (ex+1  < nl) { //there is a decimal point. We have to adjust the padding to get the dp as a multiple of the base. 
            for (i = 0; i < bp-(nl - (ex+1))%bp ; i++) //pad with zeros to make this multiple of bp. only pad the numbers after the decimal point
                n = n + "0";
        }
        else { // there is no decimal point so just add as many zeros after nl to go to ex+1 (modulo bp)
            for (i = 0; i < ((ex+1) - nl) % bp ; i++) //pad with zeros to make this multiple of bp. 
                n = n + "0";
        }
    }


    i = 0; // counter
    while (n.length > 0) {
        this.v[i++] = parseInt(n.substr(-bp)); //store the last batch of characters of the string first. the string is stored back to front. 
        n = n.slice(0, -bp);
    }

}

//**************************************************************************************
//                                  F O R M A T 

// this method simply formats a bignum in a decimal string so that it can be displayed
//**************************************************************************************

Big.prototype.format = function() {

    // start with the sign
    var st = (this.s == 1) ? '+' : '-';
    var v = this.v;
    var e = this.e.toString();

    //add the first token and the decimal point
    st = st.concat(v[v.length-1].toString(), '.');
    

    for (var i = v.length - 2; i >= 0; i--) {

        for (var pad = bp; v[i].toString().length < pad; pad--) { st = st.concat('0'); } //pad with zeros
        st = st.concat(v[i].toString());
    }
    st = st.concat(' E', e);

    return (st);
}

//**************************************************************************************
//                               M U L T I P L I C A T I O N 
//**************************************************************************************

Big.prototype.times = function (y) {

    var res = new Big(); // to store the result
   
    // The sign of the result is -1 if the factor signs are the same, -1 otherwise. 
    res.s = (this.s == y.s) ? 1 : -1;
    
    // initialises the array to store the result. We have to initialise it to Zero because we add to it in the body. 
    for (var ind = 0 ; ind < this.v.length + y.v.length; ind++)
        res.v[ind] = 0;

    for (var i = 0; i < this.v.length; i++)     // this is the main loop. it is o(N2) in length because it's a double loop. 
        for (var j = 0; j < y.v.length; j++) {
            var t = this.v[i] * y.v[j] + res.v[i + j];  // store the result of the multiplication and add any previously held carry. 
            res.v[i + j] = t % base;  //remainder
            if (t >= base) {// if we have a carry, add it to the next token    
                res.v[i + j + 1] += ~~(t / base); //use the bitwise operator to truncate 32 bits before adding it.    
            }
        }

    if (res.v[i + j - 1] == 0) { // if the last element is zero - this is the most significant token
        res.v.pop();  // remove it because we have no carry and no need for leading zeros
        res.e = res.v[i + j - 2].toString().length;  // store the length of the last 2 tokens (in this case, one of them is zero so we only look at one of the last 2)
    }
    else {
        res.e = res.v[i + j - 1].toString().length + bp; // store the length of the last 2 tokens
    }

    // calculate the length of the last 2 tokens (i+j-1) and (i+j-2) of res and compare it with 
    // the sum of the length of the last token of the original numbers (i-1) and (j-1). 
    // if the length is the same as sum, then there is a carry eg 5*5=25 (1+1=2)... and res.e is sum of exp + 1
    // otherwise there is no carry eg 2*3=6 (1+1>1)... and res.e is simply the sum of exp.

    res.e -= this.v[i - 1].toString().length + y.v[j - 1].toString().length - 1;  // the result of this line is either 0 or 1
    res.e += this.e + y.e; //. whatever we had on the previous line (either 0 or 1) gets added to the sum of the 2 exponents. 

    return res;


}

//**************************************************************************************
//                                  A D D I T I O N 
//**************************************************************************************

Big.prototype.plus = function (y) {

    var res = new Big();
    var x = this;
    var eo = x.e - y.e; // the offset between the 2 numbers
    var lo = 0;    // lenth offset
    var reslen = 0; // store the length of the result

    // look at the difference in exponents and shift the smallest number by the difference in exponents. 
    // shifting the smallest number means adding leading zeros at the start (which is the end of the array) 

    if (eo < 0 ) {  // first ensure that x is always bigger than y (otherwise simply swap) 
        x = y;
        y = this;
        eo = -eo;
    }
 
    lo = ((x.v.length - 1) - (y.v.length - 1)) * bp + x.v[0].toString().length - y.v[0].toString().length - eo;


    if (lo >= 0) {  //if x has more digits than y (shifted by offset eo)
        reslen = x.v.length;
        for (var i = 0; i < lo; i++)
            x.v.unshift(0);
    } else {        // if y is the longest array, then add zeros at the end of x
        reslen = y.v.length;
        for (var i = 0; i < lo; i++)
            y.v.unshift(0)
    }

    for (var i = 0; i < reslen; i++) { //loop for the main addition
        res.v[i] = x.v[i] + y.v[i] + (res.v[i] = NaN ? 0 : res.v[i]);
        if (res.v[i] > base) res[i + 1] += res.v[i] - base;
    }





    


    return res;
}

//**************************************************************************************
//                                  S U B T R A C T I O N
//**************************************************************************************

Big.prototype.minus = function (y) {

    var res = new Big();

    return res;
}


//**************************************************************************************
//                                  C O M P A R I S O N S
//**************************************************************************************

Big.prototype.lt = function (y) {

    var res = new Big();

    return res;
}



