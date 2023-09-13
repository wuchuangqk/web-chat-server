const express = require('express')
const expressWs = require('express-ws')
const chat = require('./chat')
const { getIP } = require('./utils')

const app = express()
expressWs(app)
app.use('/chat', chat)

const port = 1060
app.listen(port, () => {
  console.log(`chat server is running at ${getIP()}:${port}`);
})