const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const {
  verifyToken,
  verifyTokenForSocket,
} = require("./middleware/verifyToken");
require("dotenv").config();
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
app.use(bodyParser.json({ extended: false }));
app.use(cors());
const httpLogger = require("./middleware/logger");
app.use(httpLogger);

var linkController = require("./link");
app.use("/link", verifyToken, linkController);

var authController = require("./auth");
const {
  askToConnect,
  insertMessage,
  approveConnect,
  getAllMessages,
  checkHasConnection,
} = require("./message");
app.use("/auth", authController);

app.get("", (_, res) => {
  return res.status(200).send("Wellcome to My Chat App API v1.0.0");
});

///////////////////////////socket//////////////////////////
const allSockets = new Map();
const CONSTANTS = require("./constants");

io.on("connection", (socket) => {
  socket = verifyTokenForSocket(socket);
  if (!socket) return;
  if (!allSockets.has(socket.user.username))
    allSockets.set(socket.user.username, socket);
  checkHasConnection(socket,socket.user.username);
  getAllMessages(socket.user, socket);
  socket.on(CONSTANTS.EVENT, (data$) => {
    const { type, data } = data$;
    switch (type) {
      case CONSTANTS.MESSAGE:
        return insertMessage(socket.user, allSockets, data);
      case CONSTANTS.REQUEST:
        return askToConnect(socket.user, allSockets, data);
      case CONSTANTS.APPROVE:
        return approveConnect(socket.user, allSockets, data);
      default:
        socket.emit(CONSTANTS.EVENT, { type: "ERROR", data: "no type" });
    }
  });
  socket.on("disconnect", () => {
    allSockets.delete(socket.user.username);
  });
});
///////////////////////////////////////////////////////////

http.listen(process.env.API_PORT, process.env.API_HOST, () => {
  console.log(
    `socket is listening on http://${process.env.API_HOST}:${process.env.API_PORT}`
  );
}).timeout = 2000;
