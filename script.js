const BN = require('bn.js')
const Share = require('./Share');
const crypto = require('crypto');
const resultShare = require('./resultShare');
const ec = require('./alt_bn128');


var p = new BN("30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47", "hex");

var threshold = new BN(0);

//var string = 'MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDePqM6BupZNJkriuBB2Rg0ZGiV0OyonRjiWHY0+B5urSec256si7540VAtEcJFXie6JfeSfTCMAZKGGBtm48Ac+WD6Yx6cDf29tAc5JWkMVFlTjTYnjjK9Uex3MewkBzlzBFSXniWt8tNLz6qxZ6++ChUa5c5mCN6Vog+cH5Rqpb+IF+sYH29wA9916dGZIO85w6toOEfIR+VbYeS7wvRhTJA4ielpbOBnhuovGvtMM7P06lDoi9grw0Dz2JE0WtjCLExx6Svgat/0e/cHOdBtwyjC5RqhpZtru77fk/48suz7mfKS/fRaXvA13CkKju0RXFcalpGJaymO0l6B+b9AgMBAAECggEBAKlLp8V1LSGE+sT7hndCq7iFYFH3k7+h5CnP30PcWjpO9uT7O3UPAqpAMEYUyBtVbQfVEjFp4ghUzkwNoxoOlfK8WQ6DYPbZhZfzwqjagZodyunloQIixSSdw96OYyNxtEGs4OkRA+Uz3s9OFPu7jIDGwtoEF2+NIEF6F1ERGniUAS9UJ1Sd+hS5q9p3GkfhO99gUrTjZ0VlpDaSjg+5sw5f+a7GzcxK+0qnv2U/nrg8MlGKL6wFFx83G5D6EVJ4Zyw+hrdMe4sp9QjYrRXHfzdjou5Q0VO9fZCEjLVMeoMnZS9SiDYA0qYSZbHG8f5BVV9nGR3X2rbqVIQaiirCc/UCgYEA/2UvlzJPcsMlq4TqA/UiDlVR7mWkeuizpRz687IOHvIYvZxQqRU4X2halKalsF7avi8np2JL6dlngYRaUKS8KfUTujZG5wnrdkbLz11hsF+uhbkw3VxDGmklXvs49vXZjTJifXcvzTFGXf7zGB6bjufEKCLupyeKMymOPkHMY4MCgYEA3sVbToF+zUwGbV2xEYv5/MCYwEffX+LENrGpI+4MXBTA7VwlAXK3l8StzYL6eRQk2tULsAxV7BNp2LacFeJD3BgFH3vEFhbn097h0l/T3ozlRWUEeS39qAPZgVinhGK/71pwAa9CFs6Hbepwqq9aZzMCX4AcINJkIyA5jUwoA38CgYEA2ydL8DVGwZa9g3IZkW3PXHdQR/7GZoW6aev1WBqpTVq3ajVxbbX82rnkSHy73x12HQ6/uz15IODildwp19uUb3iTBg4/R1BW0fasO3PJORzR2IPyb3EVT9t8KwXuetS6axQaOcmFplErLctxdHgHSliNFVfsbFlcmMyG99tkdNsCgYB6r5xKjxzDebQsdSX4cOubXIKDmtGVYDEJoixxoj9iUvexgUbMFl6wEdxaS2EgX4ywjBZkvVZwrnxjoqYxkywmQYBIx4PFWpYQZDZgAvCPJ295GVouVrrU1lHqX2XajfwAmQEInHm8T7/cM/oatnoGTdxntglHtjb59Vxcye1bhwKBgQDXIeibcyEDBYjOiwY4MhFzn2GJO6m/sXjCt+KVqqhCsHoglAtsnR+qPzOqAy7e3TKUrGkOZ0/UnvNVM7d0ZsZ6GXNA/F/3j/XoSwTcMFeUbANs0pTQb+NtTUFUB9D5ByXDye22//HYFlxK3KD24gspEaexeK6hxFkcuVv3j9XrNA==';
//var result = new TextDecoder().decode(byte);
//console.log("result "+result);

function share_secret(secret, n, k){
    var shares = new Array(n);
    var commitments = new Array(k);
    threshold = k;
    var secretNumber = new BN(secret);
    console.log("secretNumber: "+secretNumber)
    //calcolo coefficienti
    var coefficients = new Array(k);
    coefficients[0] = secretNumber;
   //console.log("coefficients[0]: "+coefficients[0]);
    for(i=1; i<k; i++){
        var random = new BN(crypto.randomInt(1, Math.pow(2, 48)));
        coefficients[i] = new BN(random)
        console.log("coefficients[ "+i+"]: "+coefficients[i]);
    }
    //calcolo pezzi
    for(j=0; j<n; j++){
        shares[j] = new Share(new BN(f(coefficients, j+1, k)), new BN(j+1));
        console.log("shares["+j+"]: "+shares[j].value+"\n");
        console.log("shares["+j+"]: "+shares[j].x+"\n")
       
    }

    //calcolo commitments
    for(k=0; k<coefficients.length; k++){
        commitments[k] = ec.curve.g.mul(coefficients[k]);
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

function verify_share(x, share, commitments){
    var base = new BN(x);
    var result = commitments[0];
    for(k=1; k<commitments.length; k++){
        esp = new BN(k+1)
        result = result.add(commitments[k].mul(base.pow(esp).mod(p)));
    }
    return ec.curve.g.mul(share) == result;
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
    verify_share: verify_share,
    setShares: setShares
};
