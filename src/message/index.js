const { getGUID } = require("../utils");
const CONSTANTS = require("../constants");
const { Message, Connection, Link } = require("../data");
//////////////////utils///////////////////////////////
const checkHasConnection = async (socket, username) => {
  try {
    let c1 = await Connection.findOne({
      owner_username: username,
    }).exec();
    if (c1)
      socket.emit(CONSTANTS.EVENT, { type: CONSTANTS.IN_CHAT, data: true });
    else {
      let c2 = await Connection.findOne({
        invited_username: username,
      }).exec();
      if (c2)
        socket.emit(CONSTANTS.EVENT, { type: CONSTANTS.IN_CHAT, data: true });
    }
  } catch {}
};

const sendDataToUser = (allSocket, username, data) => {
  try {
    allSocket.get(username).emit(CONSTANTS.EVENT, data);
  } catch {}
};

const getAllMessages = async (user, socket) => {
  let c1 = await Connection.findOne({
    owner_username: user.username,
  }).exec();
  if (c1) {
    const messages = await Message.find({ key: c1.key }).exec();
    socket.emit(CONSTANTS.EVENT, {
      type: CONSTANTS.MESSAGE,
      data: messages.map((o) => ({
        create_date: o.create_date,
        owner_username: o.owner_username,
        message: o.message,
      })),
    });
  } else {
    let c2 = await Connection.findOne({
      invited_username: user.username,
    }).exec();
    if (c2) {
      const messages = await Message.find({ key: c2.key }).exec();
      socket.emit(CONSTANTS.EVENT, {
        type: CONSTANTS.MESSAGE,
        data: messages.map((o) => ({
          create_date: o.create_date,
          owner_username: o.owner_username,
          message: o.message,
        })),
      });
    }
  }
};

const insertMessage = async (user, allSocket, message) => {
  let c1 = await Connection.findOne({
    owner_username: user.username,
  }).exec();

  let c2 = await Connection.findOne({
    invited_username: user.username,
  }).exec();

  if (c1) {
    const msg = new Message({
      create_date: new Date().toUTCString(),
      key: c1.key,
      owner_username: user.username,
      message,
    });
    await msg.save().then(async () => {
      const messages = await Message.find({ key: c1.key }).exec();
      sendDataToUser(allSocket, c1.invited_username, {
        type: CONSTANTS.MESSAGE,
        data: messages.map((o) => ({
          create_date: o.create_date,
          owner_username: o.owner_username,
          message: o.message,
        })),
      });
      sendDataToUser(allSocket, c1.owner_username, {
        type: CONSTANTS.MESSAGE,
        data: messages.map((o) => ({
          create_date: o.create_date,
          owner_username: o.owner_username,
          message: o.message,
        })),
      });
    });
  }

  if (c2) {
    const msg = new Message({
      create_date: new Date().toUTCString(),
      key: c1.key,
      owner_username: user.username,
      message,
    });
    await msg.save().then(async () => {
      const messages = await Message.find({ key: c2.key }).exec();
      sendDataToUser(allSocket, c2.invited_username, {
        type: "MESSAGES",
        data: messages.map((o) => ({
          create_date: o.create_date,
          owner_username: o.owner_username,
          message: o.message,
        })),
      });
      sendDataToUser(allSocket, c2.owner_username, {
        type: "MESSAGES",
        data: messages.map((o) => ({
          create_date: o.create_date,
          owner_username: o.owner_username,
          message: o.message,
        })),
      });
    });
  }
};

const askToConnect = async (user, allSocket, key) => {
  const link = await Link.findOne({ link: key }).exec();
  if (link) {
    return sendDataToUser(allSocket, link.username, {
      type: CONSTANTS.REQUEST,
      data: user.username,
    });
  }
};

const approveConnect = async (user, allSocket, username) => {
  const c = new Connection({
    owner_username: username,
    invited_username: user.username,
    key: getGUID(),
    create_date: new Date().toUTCString(),
  });
  await c.save().then(() => {
    allSocket
      .get(username)
      .emit(CONSTANTS.EVENT, { type: "START", data: user.username });
    allSocket
      .get(user.username)
      .emit(CONSTANTS.EVENT, { type: "START", data: username });
  });
};

module.exports = {
  askToConnect,
  insertMessage,
  approveConnect,
  getAllMessages,
  checkHasConnection,
};
