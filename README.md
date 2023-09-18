# web-chat-server
基于express-ws实现的网页聊天室，用于电脑和手机在局域网之间互传文本、图像消息。

# 运行
- 需要先构建client端，参考web-chat-client/README.md
- 将构建产物web-chat-client/dist目录下的所有文件移动到web-chat-server/src/static目录
- 启动主程序main.js
```js
node src/main.js
```
