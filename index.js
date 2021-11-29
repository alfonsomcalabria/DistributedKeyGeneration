const script = require('./script');
const express = require('express');
const Share = require('./Share');
const BN = require('bn.js');
var resultShare = require('./resultShare');
const app = express()
const port = 3000

const n = 6;
const k = 3;
var shares;
var commitments;
var result = {}
var pieces = [1, 3, 5];

app.get('/', (req, res) => {
  res.send('Prova')
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

})

app.listen(port, () => {
    console.log(`Shamir secret server listening on port ${port}`)
})
