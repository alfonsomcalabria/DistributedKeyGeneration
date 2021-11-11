const BN = require('bn.js')

//var p = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
//var p = new BN(10007);
var p = 10007;
var shares = [];
var threshold = 0;

function share_secret(secret, n, k){
    threshold = k;
    //var secretNumber = new BN(secret, 32);
    var secretNumber = secret;
    console.log("secretNumber: "+secretNumber)
    //calcolo coefficienti
    var coefficients = [];
    //coefficients[0] = secretNumber;
    //console.log("coefficients[0]: "+coefficients[0])
    for(i=0; i<k-1; i++){
        coefficients[i] = Math.floor(Math.random()*p)+1
        console.log("coefficients[ "+i+"]: "+coefficients[i]);
    }
    //calcolo pezzi
    for(j=0; j<n; j++){
        shares[j] = (secretNumber + f(coefficients, j+1, k))%p;
        console.log("shares["+j+"]: "+shares[j]+"\n");
    }
    var c_shares = [];
    c_shares[0] = shares[0];
    c_shares[1] = shares[1];
    c_shares[2] = shares[2];
    //var string = x.toString(32);
    //console.log(x);
    //console.log(string);
    var secretRec = recover_secret(c_shares, 3)
    console.log(secretRec);
}

function f(coefficients, x, k){
    var pol = [];
    var sum = 0;
    for(i=0; i<k-1; i++){
        pol[i]=(coefficients[i]*(Math.pow(x,i+1)));
        sum+=pol[i];
    }

    return sum;
}

function recover_secret(shares, k){
    var sum = 0;
    var prod = 1;
    if(k<threshold){
        console.log("Errore");
        process.exit();
    }
    //interpolazione lagrange
    for(i=1; i<=shares.length; i++){
        sum+=shares[i-1]*lagrange_coefficient(i, shares)
    }

    return (sum%p);
}

function lagrange_coefficient(i, shares){
    var result = 1;
    for(j=1; j<=shares.length; j++){
        if(i != j){
            var a = (j-i)%p;
            var invm = (1/a)%p;
            result=result*j*invm;
            result%=p;
            
        }
    }
    return result;
    
}

module.exports = {
    share_secret: share_secret,
    recover_secret: recover_secret
};


