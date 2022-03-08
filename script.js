const BN = require('bn.js')
const Share = require('./Share');
const crypto = require('crypto');
const resultShare = require('./resultShare');
const Pigreco = require('./pigreco');
const Web3 = require('web3');

const ec = require('./alt_bn128');

// keccak256 implemented in Solidity
const sha3 = Web3.utils.soliditySha3;


var p = new BN(ec.curve.n, "hex"); 

var threshold = new BN(0);

//h = generator for partial public key
var h_x = new BN('1581953BCF3CE078038FA19D974E26E4757A0E65573D9628EC8939BB77A6FD04', 'hex');
var h_y = new BN('B1FD6EDA65BD4E6866A28BCCFEE143309BFB597378217A2002E5CAC8CFE645F', 'hex');
var h = ec.curve.point(h_x, h_y);

//key generation for each member
function registration(){
    var sk = new BN(crypto.randomInt(1, Math.pow(2, 48)));
    var pk = ec.curve.g.mul(sk);
    var key = {
        pk: pk,
        sk : sk
    }
    return key
}

//generate a random secret
function initial_random_secret(){
    var random = new BN(crypto.randomInt(1, Math.pow(2, 48))).mod(p);
    return random
}

//generate fragment 
function share_secret(secret, n, k){
    var shares = new Array(n);
    var commitments = new Array(k);
    threshold = k;
    var secretNumber = new BN(secret);
    console.log("secretNumber: "+secretNumber)
    
    //compute coefficients
    var coefficients = new Array(k);
    coefficients[0] = secretNumber;
    for(i=1; i<k; i++){
        var random = new BN(crypto.randomInt(1, Math.pow(2, 48)));
        coefficients[i] = new BN(random)
        console.log("coefficients[ "+i+"]: "+coefficients[i]);
    }

    //compute fragments
    for(j=0; j<n; j++){
        shares[j] = new Share(new BN(f(coefficients, j+1, k)), new BN(j+1));
        console.log("shares["+j+"]: "+shares[j].value+"\n");
        console.log("shares["+j+"]: "+shares[j].x+"\n")
       
    }

    //compute commitments for verification
    for(k=0; k<coefficients.length; k++){
        commitments[k] = ec.curve.g.mul(coefficients[k]);
        console.log("Commitments["+k+"]:"+commitments[k].getX()+", "+commitments[k].getY())
    }
    var result = new resultShare(shares, commitments);
    return result;
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

//secret reconstruction
function recover_secret(shares, k){
    var sum = new BN(0);
    if(k<threshold){
        console.log("Errore");
        process.exit();
    }
    //lagrange interpolation
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

//verify fragment
function verify_share(x, share, commitments){
    var base = new BN(x);
    var result = commitments[0];
    //console.log(result.getX()+", "+result.getY());
    for(k=0; k<commitments.length-1; k++){
        esp = new BN(k+1)
        //prod = commitments[k+1].mul(base.pow(esp).mod(p));
        //result = result.add(prod)
        result = result.add(commitments[k+1].mul(base.pow(esp).mod(p)));
    }
    verify = ec.curve.g.mul(share);
    return verify.eq(result);
}

function sha3ToBN(hexString) {
    return new BN(hexString.split('x')[1], 'hex')
}

//compute correctness proof
function dleq(x1, y1, x2, y2, alpha){
    w = new BN(crypto.randomInt(1, Math.pow(2, 48)));
    a1 = x1.mul(w);
    a2 = x2.mul(w);
    c = sha3ToBN(sha3(a1.getX(), a1.getY(), a2.getX(), a2.getY(), x1.getX(), x1.getY(), y1.getX(), y1.getY(), x2.getX(), x2.getY(), y2.getX(), y2.getY()))
    prod = alpha.mul(c);
    r = w.sub(prod);
    r = r.umod(p);  //umod perchè r è negativo
    var pigreco = new Pigreco(c, r);
    return pigreco;
}

//verify correctness proof 
function dleq_verify(x1, y1, x2, y2, pigreco){
    a1 = (x1.mul(pigreco.r)).add(y1.mul(pigreco.c));
    a2 = (x2.mul(pigreco.r)).add(y2.mul(pigreco.c));
    c = sha3ToBN(sha3(a1.getX(), a1.getY(), a2.getX(), a2.getY(), x1.getX(), x1.getY(), y1.getX(), y1.getY(), x2.getX(), x2.getY(), y2.getX(), y2.getY())) 
    return c.eq(pigreco.c)
}

//compute partial public key with generator h
function partialPublicKey(secret){
    return h.mul(secret);
}

//compute master public key
function derivePublicKey(shares){
    var mpk = new BN(1);
    var msk = new BN(0);
    for(i=0; i<shares.length; i++){
       msk = msk.add(new BN(shares[i]));
    }
    console.log("msk: "+msk)
    mpk = h.mul(msk);
    return mpk;
}

//compute shareKey for encrypt fragment
function sharedKey(sk, pk){
    var kij = pk.mul(sk);
    return kij;
}

//encrypt fragment with shared key 
//decrypt = encrypt
function encryptShare(share, kij, j){
    var x = kij.getX();
    var h = sha3ToBN(sha3(x, j));
    return share.xor(h);
}



module.exports = {
    initial_random_secret: initial_random_secret,
    share_secret: share_secret,
    recover_secret: recover_secret,
    verify_share: verify_share,
    dleq: dleq,
    dleq_verify: dleq_verify,
    derivePublicKey: derivePublicKey,
    partialPublicKey: partialPublicKey,
    registration: registration,
    sharedKey: sharedKey,
    encryptShare: encryptShare
};
