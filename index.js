const script = require('./script');
const express = require('express')
const app = express()
const port = 3000


app.get('/', (req, res) => {
  res.send('Prova')
  script.share_secret(150, 6,3);
})


app.listen(port, () => {
    console.log(`Shamir secret server listening on port ${port}`)
})
