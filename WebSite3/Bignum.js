
// store the base in power of 10 - range 1-7 - if 8 or over, then the multiplicatin will result in 16 digits which exceeds the javascript maximum of 2^32
var bp = 7;
var base = Math.pow(10, bp);

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

    var i = 0;
    var dp = 0;
    var ex = 0;
    

    if (n == null) return;

    n = n.replace(/\s+/g, ''); // remove all the spaces

    //store and strip the sign
    this.s = (n.charAt(0) == '-') ? (n = n.slice(1), -1) : 1;

    // Decimal point?
    if ((dp = n.indexOf('.')) >= 0) {
        n = n.replace('.', '');
        ex = dp;
    }
    
    // Exponential form? 
    if ((i = n.search(/e/i)) > 0) { // search for the character E or e

        // We found the character E. 
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
    }
    else {  // not just Zeros

        for (var tz = 0 ; n.charAt(n.length-1 -tz) == '0'; tz++) { }  // count how many trailin zeros

        n = n.slice(lz, n.length-tz);  // remove the leading and trailing zeros


        this.e = ex - lz - 1; // adjust the exponent for leading and trailing zeros

        // store the rest of the string
        // start from the end and walk back until there is nothing left
        i = 0; // counter
        while (n.length > 0) {
            this.v[i++] = parseInt(n.slice(-bp)); //store the last batch of characters of the string
            n = n.slice(0, -bp); // cut the string back
        }
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

    //add the first character and the decimal point
    st = st.concat(v[v.length-1].toString().charAt(0), '.');
    st = st.concat(v[v.length-1].toString().slice(1)); // add the rest of the first token

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
    
    // initialises the array to store the result. We have to initialise it to Zero anyway because we add to it in the body. 
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

    // calculate the length of the last 2 tokens (i+j-1) and (i+j-1) of res and compare it with 
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



