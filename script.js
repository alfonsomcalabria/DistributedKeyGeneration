const BN = require('bn.js')
const Share = require('./Share');

var p = new BN("30644E72E131A029B85045B68181585D2833E84879B9709143E1F593F0000001", 'hex');
//var p = new BN(21888242871839275222246405745257275088548364400416034343698204186575808495617);
//var p = new BN(500057);
var threshold = new BN(0);


function share_secret(secret, n, k){
    var shares = new Array(n);
    threshold = k;
    var secretNumber = new BN(secret, 32);
    console.log("secretNumber: "+secretNumber)
    //calcolo coefficienti
    var coefficients = new Array(k);
    coefficients[0] = secretNumber;
   //console.log("coefficients[0]: "+coefficients[0]);
    for(i=1; i<k; i++){
        var random = new BN(Math.random());
        random = random.mul(p);
        coefficients[i] = random;
        console.log("coefficients[ "+i+"]: "+coefficients[i]);
    }
    //calcolo pezzi
    for(j=0; j<n; j++){
        shares[j] = new Share(new BN(f(coefficients, j+1, k)), new BN(j+1));
        console.log("shares["+j+"]: "+shares[j].value+"\n");
        console.log("shares["+j+"]: "+shares[j].x+"\n")
       
    }

    return shares;
}

function f(coefficients, x, k){
    var pol = new Array(k-1);
    var sum = new BN(0);
    for(i=0; i<k; i++){
        var base = new BN(x);
        var esp = new BN(i);
        pol[i] = new BN(coefficients[i].mul((base.pow(esp).mod(p))));
        sum = sum.add(pol[i]);
    }
    sum = sum.mod(p);

    return sum;
}

function recover_secret(shares, k){
    var sum = new BN(0);
    if(k<threshold){
        console.log("Errore");
        process.exit();
    }
    //interpolazione lagrange
    for(i=0; i<shares.length; i++){
       sum = sum.add((shares[i].value).mul(lagrange_coefficient(i, shares)));
    }
    sum = sum.mod(p);
    return sum;
}

function lagrange_coefficient(i, shares){
    var result = new BN(1);
    for(j=0; j<shares.length; j++){
        if(i != j){
            var jBN = new BN(shares[j].x);
            var diff = new BN(shares[j].x);
            var iBN = new BN(shares[i].x);
            diff = ((diff.sub(iBN)).mod(p)).invm(p);
            result = ((result.mul(jBN)).mul(diff)).mod(p);
        }
    }
    return result;
    
}

function setShares(share, k, pieces){
    var shareRec = new Array(k);
    for(i=0; i<k; i++){
        shareRec[i] = new Share(new BN(share[pieces[i]].value), new BN(share[pieces[i]].x));
    }
    return shareRec;
}


module.exports = {
    share_secret: share_secret,
    recover_secret: recover_secret,
    setShares: setShares
};
