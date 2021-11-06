const BN = require('bn.js')

//var p = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
var p = new BN(10007);
var shares = [];
var threshold = 0;

function share_secret(secret, n, k){
    threshold = k;
    var secretNumber = new BN(secret, 32);
    //calcolo coefficienti
    var coefficients = []; 
    coefficients[0] = secretNumber;
    for(i=1; i<k; i++){
        coefficients[i] = Math.random()*p;
    }
    //calcolo pezzi
    for(j=0; j<n; j++){
        shares[j] = f(coefficients, j, k, p);
        console.log(shares[j]+"\n");
    }
    var c_shares = [];
    c_shares[0] = shares[0];
    c_shares[1] = shares[2];
    c_shares[2] = shares[3];
    //var string = x.toString(32);
    //console.log(x);
    //console.log(string);
    var secretRec = recover_secret(c_shares, 2)
    console.log(secretRec);
}

function f(coefficients, x, k, p){
    var pol = [];
    var sum = 0;
    for(i=0; i<k; i++){
        pol[i]=(coefficients[i]*(Math.pow(x,i)%p));
        sum+=pol[i];
    }
    return sum%p;
}

function recover_secret(shares, k){
    var sum = new BN(0);
    if(k<threshold){
        console.log("Errore");
        return 1;
    }
    //interpolazione lagrange
    for(i=0; i<shares.length; i++){
        sum+=shares[i]*lagrange_coefficient(i, shares)
    }

    return (sum%p).toString(32);
}

function lagrange_coefficient(i, shares){
    var result = 1;
    for(j=0; j<shares.length; j++){
        if(i != j){
            var a = new BN((j-i)%p);
            var invm = (a.invm(p));
            result*=j*invm;
            result%=p;
        }
    }
    return result;
}

module.exports = {
    share_secret: share_secret,
    recover_secret: recover_secret
};


