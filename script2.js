const BN = require('bn.js')

//var p = new BN(21888242871839275222246405745257275088548364400416034343698204186575808495617);
var p = new BN(10007);
var threshold = new BN(0);

function share_secret(secret, n, k){
    var shares = new Array(n);
    threshold = k;
    var secretNumber = new BN(secret, 16);
    console.log("secretNumber: "+secretNumber)
    //calcolo coefficienti
    var coefficients = new Array(k-1);
    //coefficients[0] = secretNumber;
    //console.log("coefficients[0]: "+coefficients[0])
    for(i=0; i<k-1; i++){
        coefficients[i] = new BN(Math.random()*p);
        console.log("coefficients[ "+i+"]: "+coefficients[i]);
    }
    //calcolo pezzi
    for(j=0; j<shares.length; j++){
        shares[j] = new BN(0);
        var sum = new BN(f(coefficients, j+1, k));
        sum = sum.add(secretNumber);
        sum = sum.mod(p);
        shares[j] = shares[j].add(sum);
        console.log("shares["+j+"]: "+shares[j]+"\n");
/*      console.log("type share["+j+"]: "+typeof(shares[j]));
        console.log("type secretNumber: "+typeof(secretNumber));
        console.log("type sum: "+typeof(sum)); */
       
    }

    //return shares
    var c_shares = new Array(3);
    c_shares[0] = new BN(shares[0]);
    c_shares[1] = new BN(shares[1]);
    c_shares[2] = new BN(shares[2]);
    var secretRec = new BN(recover_secret(c_shares, 3));
    console.log("Number Segreto: "+secretRec); 

}

function f(coefficients, x, k){
    var pol = new Array(k-1);
    var sum = new BN(0);
    for(i=0; i<k-1; i++){
        pol[i] = new BN(coefficients[i]*Math.pow(x, i+1));
        //console.log("typeof pol["+i+"]: "+typeof(pol[i]));
        sum = sum.add(pol[i]);
        //console.log("type sum: "+typeof(sum));
    }

    return sum;
}

function recover_secret(shares, k){
    var sum = new BN(0);
    if(k<threshold){
        console.log("Errore");
        return 1; //DA VEDEREE
    }
    //interpolazione lagrange
    for(i=1; i<=k; i++){
       sum = sum.add(shares[i-1].mul(lagrange_coefficient(i, shares)));
       //console.log("sum["+i+"]: "+sum);
       //console.log("sum type :"+typeof(sum));
    }
    sum = sum.mod(p);
    //console.log("sum type (fuori al ciclo) :"+typeof(sum));
    return sum;
}

function lagrange_coefficient(i, shares){
    var result = new BN(1);
    //console.log("result type :"+typeof(result));
    for(j=1; j<=shares.length; j++){
        if(i != j){
            var jBN = new BN(j);
            var a = new BN(j-i);
           // console.log("a type :"+typeof(a));
            a = a.mod(p);
           // console.log("a type dopo modulo :"+typeof(a));
            a = a.invm(p);
            //console.log("type a dopo invm: "+typeof(a));
            result = result.mul(jBN);
            result = result.mul(a);
           // console.log("type result dopo molt: "+typeof(result));
            result = result.mod(p);
            //console.log("type result dopo mod: "+typeof(result));
            
        }
    }
    return result;
    
}

module.exports = {
    share_secret: share_secret,
    recover_secret: recover_secret
};


