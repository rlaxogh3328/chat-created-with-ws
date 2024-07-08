import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

//뷰 엔진 설정
app.set("view engine", "pug");
//express에 템플릿이 어디 있는지 지정
app.set("views", __dirname + "/views");
//public url을 생성해서 유저에게 파일을 공유
app.use("/public", express.static(__dirname + "/public"));
//home.pug 를 렌더링해주는 route handler
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

//http.createServer 로 http 프로토콜을 지원하는 서버를 만듦
const server = http.createServer(app);
//그 server 위에 웹소켓을 지원하는 wss 서버를 만듦 > 이렇게 하면 동일한 포트에서 http, ws 두 가지 프로토콜을 지원 가능함.
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "annonymous";
  console.log("Connected to Browser ✅");
  socket.on("close", () => {
    console.log("Disconnected from Browser ❌");
  });
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname} : ${message.payload}`)
        );
        break;
      case "nickname":
        socket["nickname"] = message.payload;
        break;
    }
  });
});

server.listen(3000, handleListen);
