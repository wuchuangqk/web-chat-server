const express = require('express')
const expressWs = require('express-ws')
const chat = require('./chat')
const { getIP } = require('./utils')
const path = require('path')
const exec = require('child_process').exec

const app = express()
expressWs(app)
app.use('/chat', chat)
app.use(express.static(path.resolve(__dirname, './static')))

const port = 1060
app.listen(port, () => {
  console.log(`chat server is running at ${getIP()}:${port}`);
})

exec(`start http://${getIP()}:${port}`);