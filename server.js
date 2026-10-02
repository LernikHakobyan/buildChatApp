import http from "http";
import fs from "fs";
import { WebSocketServer } from "ws";

const PORT = 3001;

const server = http.createServer((req, res) => {
  fs.readFile("./public/index.html", (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading index.html");
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/html",
    });

    res.end(data);
  });
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket, req) => {
  const username = new URL(req.url, "http://localhost").searchParams.get(
    "username",
  );

  const joinedMessage = JSON.stringify({
    type: "system",
    text: `${username} joined`,
  });

  wss.clients.forEach((client) => {
    client.send(joinedMessage);
  });

  socket.on("message", (data) => {
    const { username, text } = JSON.parse(data.toString());

    const chatMessage = JSON.stringify({
      type: "chat",
      username,
      text,
    });

    wss.clients.forEach((client) => {
      client.send(chatMessage);
    });
  });

  socket.on("close", () => {
    const leftMessage = JSON.stringify({
      type: "system",
      text: `${username} left`,
    });

    wss.clients.forEach((client) => {
      client.send(leftMessage);
    });
  });
});

server.listen(PORT, () => {
  console.log("Chat server running at http://localhost:3001");
});