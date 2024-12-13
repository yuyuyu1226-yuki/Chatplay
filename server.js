var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var { Pool } = require("pg");
var WebSocket = require("ws");

// 環境変数読み込み
require("dotenv").config();

var app = express();
var port = process.env.PORT || 3000; // Render用に環境変数でポート指定

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL接続設定
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Renderのデータベース用
});

// ルート設定
app.use("/auth", require("./routes/auth"));
app.use("/chat", require("./routes/chat"));
app.use("/profile", require("./routes/profile"));

// WebSocketサーバー（リアルタイム通信用）
var wss = new WebSocket.Server({ noServer: true });

wss.on("connection", function (socket) {
  console.log("WebSocket connected");
  socket.on("message", function (message) {
    console.log("Received:", message);
    socket.send("Echo: " + message);
  });
});

// サーバー起動
var server = app.listen(port, function () {
  console.log(`Server running on port ${port}`);
});

// WebSocketとHTTPサーバーの統合
server.on("upgrade", function (request, socket, head) {
  wss.handleUpgrade(request, socket, head, function (ws) {
    wss.emit("connection", ws, request);
  });
});
