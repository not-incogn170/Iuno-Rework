console.log('START SERVER')
const express = require('express')

const app = express()

app.get('/', (req, res) => {
  res.send('RIKUDO.NET API RUNNING')
})

app.listen(3000, () => {
  console.log('SERVER RUNNING')
})