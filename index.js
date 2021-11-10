const script = require('./script2');
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Prova')
})


app.get('/secret', (req, res) => {
  res.send('Calcolo...')
  script.share_secret('ciao', 6,3);
})


app.listen(port, () => {
    console.log(`Shamir secret server listening on port ${port}`)
})
