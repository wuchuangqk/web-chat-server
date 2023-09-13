const express = require("express");
const expressWs = require("express-ws");
const { arrayRandom } = require('./utils')

const wsRouter = express.Router()
expressWs(wsRouter);  // 增强expree路由，使其具有ws的能力
const clients = []
let seed = 0
const colors = ['bg-purple-600', 'bg-fuchsia-600', 'bg-pink-600', 'bg-violet-600', 'bg-sky-600', 'bg-teal-600', 'bg-yellow-600', 'bg-red-600'] // 颜色轮盘

// 给所有人发消息
const sendToAll = (data) => {
  sendToOthers(null, JSON.stringify(data))
}

// 给除自己以外的所有人发消息
const sendToOthers = (self, data) => {
  clients.forEach(client => {
    if (client.ws === self) return
    client.ws.send(data)
  })
}

const handleMessage = (ws, msg) => {
  // console.log('ws message:', msg, typeof msg);
  const { type } = JSON.parse(msg)
  switch (type) {
    case 'message':
      sendToOthers(ws, msg)
      break
  }
}

// 移除断开链接的用户
const removeOffLine = (ws, code) => {
  console.log('ws close:', code);
  // 移除链接
  const index = clients.findIndex(client => client.ws === ws)
  if (index !== -1) {
    clients.splice(index, 1)
    sendToAll({ type: 'users', data: clients.map(client => client.user) })
  }
}

// 一个新的websocket链接被建立
wsRouter.ws('/', (ws, req) => {
  seed++
  clients.push({
    ws,
    user: {
      id: seed,
      name: `用户${seed}`,
      color: arrayRandom(colors)
    },
  })
  sendToAll({ type: 'users', data: clients.map(client => client.user) })
  ws.send(JSON.stringify({ type: 'id', data: seed }))
  // 进行socket监听
  ws.on('message', (msg) => handleMessage(ws, msg))
  ws.on('close', (code) => removeOffLine(ws, code))
  ws.on('error', (err) => {
    console.log('ws error:', err);
  })
})

module.exports = wsRouter