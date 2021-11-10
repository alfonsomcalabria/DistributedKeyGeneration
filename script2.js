const BN = require('bn.js')
const Share = require('./Share');

//var p = new BN(21888242871839275222246405745257275088548364400416034343698204186575808495617);
var p = new BN(500057);
var threshold = new BN(0);
var random = new BN(Math.random());

function share_secret(secret, n, k){
    var shares = new Array(n);
    threshold = k;
    var secretNumber = new BN(secret, 32);
    console.log("secretNumber: "+secretNumber)
    //calcolo coefficienti
    var coefficients = new Array(k);
    coefficients[0] = secretNumber;
    console.log("coefficients[0]: "+coefficients[0]);
    //console.log("coefficients[0]: "+coefficients[0])
    for(i=1; i<k; i++){
        coefficients[i] = new BN(Math.random()*p);
        console.log("coefficients[ "+i+"]: "+coefficients[i]);
    }
    //calcolo pezzi
    for(j=0; j<n; j++){
        //shares[j] = new BN(0);
        shares[j] = new Share(new BN(f(coefficients, j+1, k)), new BN(j+1));
/*         var sum = new BN(f(coefficients, j+1, k));
        sum = sum.add(secretNumber);
        sum = sum.mod(p); */
        //shares[j] = shares[j].add(sum);
       // shares[j].value = new BN(f(coefficients, j+1, k));
       // shares[j].x =  new BN(j+1);
        console.log("shares["+j+"]: "+shares[j].value+"\n");
        console.log("shares["+j+"]: "+shares[j].x+"\n")
/*      console.log("type share["+j+"]: "+typeof(shares[j]));
        console.log("type secretNumber: "+typeof(secretNumber));
        console.log("type sum: "+typeof(sum)); */
       
    }

    //return shares
    var c_shares = new Array(3);
   
    c_shares[0] = new Share(new BN(shares[3].value), new BN(shares[3].x));
    c_shares[1] = new Share(new BN(shares[0].value), new BN(shares[0].x));
    c_shares[2] = new Share(new BN(shares[5].value), new BN(shares[5].x));

    
    
    var secretRec = new BN(recover_secret(c_shares, 3));
    console.log("Number Segreto: "+secretRec); 
    console.log("Segreto: "+secretRec.toString(32));

}

function f(coefficients, x, k){
    var pol = new Array(k-1);
    var sum = new BN(0);
    for(i=0; i<k; i++){
        var base = new BN(x);
        var esp = new BN(i);
        pol[i] = new BN(coefficients[i].mul((base.pow(esp).mod(p))));   //mod(p) aggiunto
        //console.log("typeof pol["+i+"]: "+typeof(pol[i]));
        sum = sum.add(pol[i]);
        //console.log("type sum: "+typeof(sum));
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
    for(j=0; j<shares.length; j++){
        if(i != j){
            //console.log("indice i:"+i+"\nindice j:"+j)
            var prod = new BN(1);
            var jBN = new BN(shares[j].x);
            var diff = new BN(shares[j].x);
            var iBN = new BN(shares[i].x);
            diff = diff.sub(iBN);
           // console.log("diff: "+diff)
           // console.log("a type :"+typeof(a));
            diff = diff.mod(p);
           // console.log("diff mod p: "+diff)
           // console.log("a type dopo modulo :"+typeof(a));
            diff = diff.invm(p);
           // console.log("diff invm p: "+diff)
            //console.log("type a dopo invm: "+typeof(a));
            prod = prod.mul(jBN);
           // console.log("prod per j: "+prod);
            prod = prod.mul(diff);
          //  console.log("prod per diff: "+prod);
            result = result.mul(prod);
            //result = result.mul(a);

           // console.log("type result dopo molt: "+typeof(result));
            result = result.mod(p);
           // console.log("result produttoria: :"+ result);
            //console.log("type result dopo mod: "+typeof(result));
            
        }
    }
    return result;
    
}

module.exports = {
    share_secret: share_secret,
    recover_secret: recover_secret
};


