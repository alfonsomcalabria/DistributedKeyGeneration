const script = require('./script');
const express = require('express');
const Share = require('./Share');
const BN = require('bn.js');
var resultShare = require('./resultShare');
const app = express()
const port = 3000

const ec = require('./alt_bn128');
const Pigreco = require('./pigreco');
const { derivePublicKey, randomSecret } = require('./script');

const n = 6;
const k = 3;
var shares;
var commitments;
var result = {}
var pieces = [1, 3, 5];

var encryptShare, k1_2, k2_1;

app.get('/', (req, res) => {
  res.send('Prova')
})

app.get('/registration', (req, res) => {
  res.send('Registrazione')
  var key1 = script.registration();
  var key2 = script.registration();
  k1_2 = script.sharedKey(key1.sk, key2.pk);
  encryptShare = script.encryptShare(new BN('3ADE68B1', 'hex'), k1_2, 2);
  console.log(encryptShare);
  k2_1 = script.sharedKey(key2.sk, key1.pk);
  var decryptShare = script.encryptShare(new BN(encryptShare, 'hex'), k2_1, 2);
  console.log(decryptShare);
})


app.get('/secret', (req, res) => {
  res.send('Calcolo...')
  resultShare = script.share_secret(602548, n, k);
  shares = resultShare.share;
  commitments = resultShare.commitments;
})

app.get('/recovery', (req, res) => {
  res.send('Result')
  sharesRec = script.setShares(shares, k, pieces);
  var secretRec = new BN(script.recover_secret(sharesRec, k));
  console.log("Segreto ricostruito!")
  console.log("Segreto: "+secretRec);

})

app.get('/verify', (req, res) => {
  res.send('Verify')
  console.log(script.verify_share(shares[2].x, shares[2].value , commitments));
  var alpha = new BN(17);
  var x1 = ec.curve.g;
  var x2 = ec.curve.g.mul(new BN(4711));
  var y1 = x1.mul(alpha);
  var y2 = x2.mul(alpha);
  var pigreco = script.dleq(x1, y1, x2, y2, alpha);
  var verify_dleq = script.dleq_verify(x1, y1, x2, y2, pigreco);
  console.log(verify_dleq);

})

app.get('/derivempk', (req, res) => {
  res.send('Calcolo mpk');
  console.log(script.partialPublicKey(602548));
  var shares = randomSecret();
  console.log("Shares: "+ shares);
  //console.log(derivePublicKey(shares));
})

app.listen(port, () => {
    console.log(`Shamir secret server listening on port ${port}`)
})
