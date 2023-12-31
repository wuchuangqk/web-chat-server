const express = require("express");
const expressWs = require("express-ws");
const { arrayRandom } = require('./utils')

const wsRouter = express.Router()
expressWs(wsRouter);  // 增强expree路由，使其具有ws的能力
const clients = []
let seed = 0
// const colors = ['bg-purple-600', 'bg-fuchsia-600', 'bg-pink-600', 'bg-violet-600', 'bg-sky-600', 'bg-teal-600', 'bg-yellow-600', 'bg-red-600'] // 颜色轮盘

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
  const { type, data, user } = JSON.parse(msg)
  switch (type) {
    case 'message':
      sendToOthers(ws, msg)
      break
    // 发送方握手
    case 'offer':
      onOffer(data, user)
      break
    // 接收方回应
    case 'answer':
      onAnswer(data)
      break
    case 'update-user':
      const client = getClientById(user.id)
      client.user.name = user.name
      client.user.type = user.type
      sendToAll({ type: 'users', data: clients.map(client => client.user) })
      break
  }
}

// 发送方通知接收方
const onOffer = (data, user) => {
  const receiveClient = getClientById(data.receive)
  if (!receiveClient) return
  receiveClient.ws.send(JSON.stringify({
    type: 'receiveOffer',
    data: {
      sender: user.id, // 发送方
      description: data.description, // 发送方的offer
    }
  }))
}

// 接收方回应发送方
// 让对方接收自己的answer
const onAnswer = (data) => {
  const senderClient = getClientById(data.sender)
  if (!senderClient) return
  senderClient.ws.send(JSON.stringify({
    type: 'receiveAnswer',
    data: {
      description: data.description, // 接收方的answer
    }
  }))
}

// 移除断开链接的用户
const removeOffLine = (ws, code) => {
  // 移除链接
  const index = clients.findIndex(client => client.ws === ws)
  if (index !== -1) {
    console.log('ws close:', clients[index].user.name);
    clients.splice(index, 1)
    sendToAll({ type: 'users', data: clients.map(client => client.user) })
  }
}

const getClientById = (id) => {
  const client = clients.find(client => client.user.id === id)
  return client || null
}

// 一个新的websocket链接被建立
wsRouter.ws('/', (ws, req) => {
  const { name, type } = req.query
  seed++
  clients.push({
    ws,
    user: {
      id: seed,
      name,
      type
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