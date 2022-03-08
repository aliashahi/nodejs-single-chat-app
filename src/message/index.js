const { getGUID } = require("../utils");
const CONSTANTS = require("../constants");
const { Message, Connection, Link } = require("../data");
//////////////////utils///////////////////////////////

const insertMessage = async (user, allSocket, message) => {
  let c1 = await Connection.findOne({
    owner_username: user.username,
  }).exec();

  const msg = new Message({
    create_date: new Date().toUTCString(),
    key: c1.key,
    owner_username: user.username,
    message,
  });

  if (c1) {
    await msg.save().then(async () => {
      const messages = await Message.find({ key: c1.key }).exec();
      return allSocket
        .get(c1.invited_username)
        .emit(CONSTANTS.EVENT, { type: "MESSAGES", data: messages });
    });
  } else
    c1 = await Connection.findOne({
      invited_username: user.username,
    }).exec();

  if (c1) {
    await msg.save().then(async () => {
      const messages = await Message.find({ key: c1.key }).exec();
      return allSocket
        .get(c1.owner_username)
        .emit(CONSTANTS.EVENT, { type: "MESSAGES", data: messages });
    });
  }
};

const askToConnect = async (user, allSocket, key) => {
  const link = await Link.findOne({ link: key }).exec();
  if (link) {
    return allSocket
      .get(link.username)
      .emit(CONSTANTS.EVENT, { type: "REQUEST", data: user.username });
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
    allSocket.get(username).emit(CONSTANTS.EVENT, { type: "START", data: [] });
    allSocket
      .get(user.username)
      .emit(CONSTANTS.EVENT, { type: "START", data: [] });
  });
};

module.exports = { insertMessage, askToConnect, approveConnect };
