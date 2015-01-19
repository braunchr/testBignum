
// store the base in power of 10 
var bp = 2;
var base = 100;

function Big(n) {

    var i = 0;
    var dp = 0;
    var ex = 0;
    this.e = 0;
    this.v = new Array();
    this.s = 0;

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
    if ((i = n.search(/e/i)) > 0) { // search for the character E

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
        v[0] = e[0] = 0;
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


Big.prototype.times = function (y) {

    var res = new Big();
    var t = 0;
    
    // start with the sign
    res.s = (this.s == y.s) ? 1 : -1;

    // add the exponents (will have to see if there is a carry at the end)
    res.e = this.e + y.e;

    // then the multiplication
    // initialises the array of results
    for (var ind = 0 ; ind < this.v.length + y.v.length; ind++)
        res.v[ind] = 0;

    for (var i = 0; i < this.v.length; i++)

        for (var j = 0; j < y.v.length; j++) {
            t = res.v[i + j] + this.v[i] * y.v[j];
            res.v[i + j] = t % base;  //remainder
            if (t >= base)
                res.v[i + j + 1] += t / base | 0; //use the bitwise operator to truncate 32 bits
        }

    

    if (res.v[i + j - 1] == 0) // if the last element is zero 
        res.v.pop();  // remove it because we have no carry
    else
        res.e += res.v[i + j - 1].toString().length; // store the length of the carry we add it to the exponent and will adjust below. 


    res.e += res.v[this.v.length + y.v.length - 2].toString().length  // add the one before last
    res.e -= Math.max(this.v[this.v.length - 1].toString().length , y.v[y.v.length - 1].toString().length); // subtract the length of the last 2 cells of each number
        

    return res;
}

