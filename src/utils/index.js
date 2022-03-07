const { v4: uuidv4 } = require("uuid");
////------------------------------------
const isNullOrUndefined = (v) => v == null || v == undefined;
const getGUID = () => uuidv4();

module.exports = {
  isNullOrUndefined,
  getGUID,
};
