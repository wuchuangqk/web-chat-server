const express = require('express')
const expressWs = require('express-ws')
const chat = require('./chat')
const { getIP } = require('./utils')
const path = require('path')
const exec = require('child_process').exec
const bodyParser = require('body-parser')

const app = express()
expressWs(app)
app.all("*", function (req, res, next) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", '*'); // 添加这一行代码，代理配置不成功
  res.setHeader("Access-Control-Allow-Methods", 'POST, GET, OPTIONS, DELETE, PUT');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, If-Modified-Since")
  // fix error: UnsupportedMediaTypeError: unsupported charset "UTF8"
  if (req.headers['content-encoding'] === 'UTF8') {
    delete req.headers['content-encoding'];
  }
  next();
})
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.resolve(__dirname, './static')))
app.use('/chat', chat)
app.post('/log', (req, res) => {
  // console.log(req);
  console.log('log', req.body);
  res.send('ok')
})
const port = 1060
app.listen(port, () => {
  console.log(`chat server is running at ${getIP()}:${port}`);
})

exec(`start http://${getIP()}:${port}`);