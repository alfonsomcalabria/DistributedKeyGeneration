const script = require('./script');
const express = require('express');
const Share = require('./Share');
const BN = require('bn.js');
const app = express()
const port = 3000

const n = 6;
const k = 3;
var shares;
var pieces = [1, 3, 5];

app.get('/', (req, res) => {
  res.send('Prova')
})


app.get('/secret', (req, res) => {
  res.send('Calcolo...')
  shares = script.share_secret('ciao', n, k);
})

app.get('/recovery', (req, res) => {
  res.send('Result')
  sharesRec = script.setShares(shares, k, pieces);
  var secretRec = new BN(script.recover_secret(sharesRec, k));
  console.log("Segreto ricostruito!")
  console.log("Segreto: "+secretRec.toString(32));
  

})

app.listen(port, () => {
    console.log(`Shamir secret server listening on port ${port}`)
})
