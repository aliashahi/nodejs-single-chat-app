const jwt = require("jsonwebtoken");
const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("نوکن ارسال نشده است");
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("توکن اشتباه است");
  }
  return next();
};

const verifyTokenForSocket = (socket) => {
  const token = socket.handshake.query["x-access-token"];

  if (!token) {
    socket.emit("نوکن ارسال نشده است");
    socket.disconnect();
    return null;
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    socket.user = decoded;
  } catch (err) {
    socket.emit("نوکن ارسال نشده است");
    socket.disconnect();
    return null;
  }
  return socket;
};

module.exports = { verifyToken, verifyTokenForSocket };
