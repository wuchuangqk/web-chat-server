const express = require("express");
const expressWs = require("express-ws");

const wsRouter = express.Router()
expressWs(wsRouter);  // 增强expree路由，使其具有ws的能力
const clients = []
let seed = 0

// 给所有人发消息
const sendToAll = (data) => {
  sendToOthers(null, data)
}

// 给除自己以外的所有人发消息
const sendToOthers = (self, data) => {
  clients.forEach(client => {
    if (client.ws === self) return
    console.log(2);
    client.ws.send(JSON.stringify(data))
  })
}

const handleMessage = (ws, msg) => {
  console.log('ws message:', msg, typeof msg);
  const { type, data } = JSON.parse(msg)
  switch (type) {
    case 'message':
      console.log(1);
      sendToOthers(ws, { type, data })
      break
  }
}

// 一个新的websocket链接被建立
wsRouter.ws('/', (ws, req) => {
  seed++
  clients.push({
    id: seed,
    ws
  })
  sendToAll({ type: 'user', data: clients.map(client => client.id) })
  // 进行socket监听
  ws.on('message', (msg) => handleMessage(ws, msg))
  ws.on('close', (code) => {
    console.log('ws close:', code);
    // 移除链接
    const index = clients.findIndex(client => client.ws === ws)
    if (index !== -1) {
      clients.splice(index, 1)
      sendToAll({ type: 'user', data: clients.map(client => client.id) })
    }
  })
  ws.on('error', (err) => {
    console.log('ws error:', err);
  })
})

module.exports = wsRouter