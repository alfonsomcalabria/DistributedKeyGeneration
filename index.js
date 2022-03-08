const script = require('./script');
const express = require('express');
const Share = require('./Share');
const BN = require('bn.js');
var resultShare = require('./resultShare');
const app = express()
const port = 3000

const ec = require('./alt_bn128');
const Pigreco = require('./pigreco');

const n = 6;
const k = 3;
var secret;
var shares;
var commitments;
var encryptShare, k1_2, k2_1;

app.get('/', (req, res) => {
  res.send('Hello')
})

app.get('/registration', (req, res) => {
  res.send('Registration')
  var key1 = script.registration();
  var key2 = script.registration();
  //compute shared key
  k1_2 = script.sharedKey(key1.sk, key2.pk);
  
  //example encrypt/decrypt fragment
  encryptShare = script.encryptShare(new BN('3ADE68B1', 'hex'), k1_2, 2);
  console.log(encryptShare);
  k2_1 = script.sharedKey(key2.sk, key1.pk);
  var decryptShare = script.encryptShare(new BN(encryptShare, 'hex'), k2_1, 2);
  console.log(decryptShare);
})


app.get('/secret', (req, res) => {
  res.send('Generate secret...')
  secret = script.initial_random_secret();
  console.log("Secret: "+secret);
})

app.get('/splitSecret', (req, res) => {
  res.send('Generate fragment...')
  resultShare = script.share_secret(secret, n, k);
  shares = resultShare.share;
  commitments = resultShare.commitments;
})

app.get('/recovery', (req, res) => {
  res.send('Recovery Secret')
  sharesRec = [shares[0], shares[4], shares[5]];
  var secretRec = new BN(script.recover_secret(sharesRec, k));
  console.log("Secret: "+secretRec);
})

app.get('/verify', (req, res) => {
  res.send('Verify fragment')
  for(let i=0; i<shares.length; i++){
    console.log("Verify fragment["+i+"]: "+(script.verify_share(shares[i].x, shares[i].value , commitments)))
  }
})

app.get('/derivePPubKey', (req, res) => {
  res.send('Partial Public Key');
  var ppubkey = script.partialPublicKey(secret);
  console.log("Partial Pub Key: "+ppubkey.getX()+", "+ppubkey.getY());
})

app.listen(port, () => {
    console.log(`Shamir secret server listening on port ${port}`)
})
