var express = require("express");
var bycypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//////////////////utils//////////////////////////////
const { isNullOrUndefined, getGUID } = require("../utils");
const { User } = require("../data");
/////////////////////////////////////////////////////
const createJwtToken = (username, email) =>
  jwt.sign({ username, email }, process.env.TOKEN_KEY, {
    expiresIn: process.env.TOKEN_EXPIRE,
  });

var router = express.Router();

router.post("/register", async (req, res) => {
  let { username, email, password } = req.body;
  if (isNullOrUndefined(username))
    res.status(400).send({ message: "نام کاربری اجباری است" });
  else if (isNullOrUndefined(email))
    res.status(400).send({ message: "ایمیل اجباری است" });
  else if (isNullOrUndefined(password))
    res.status(400).send({ message: "رمزعبور اجباری است" });
  else {
    const user = await User.findOne({ username }).exec();
    if (user) {
      return res.status(409).send("شما قبلا ثبت نام کرده اید، لطفا وارد شوید");
    } else {
      const hashedPass = await bycypt.hash(password, 10);
      let user = {
        id: getGUID(),
        username,
        email,
        password: hashedPass,
      };
      const new_user = new User(user);
      new_user.save().then(() => {
        res
          .status(200)
          .send({ username, email, token: createJwtToken(username, email) });
      });
    }
  }
});

router.post("/login", async (req, res) => {
  let { username, password } = req.body;
  if (isNullOrUndefined(username))
    res.status(400).send({ message: "نام کاربری اجباری است" });
  else if (isNullOrUndefined(password))
    res.status(400).send({ message: "رمزعبور اجباری است" });
  else {
    const user = await User.findOne({ username }).exec();
    if (user) {
      const IsPasswordCurrect = await bycypt.compare(password, user.password);
      if (!IsPasswordCurrect) {
        res.status(400).send("نام کاربری / رمز عبور اشتباه است");
      } else
        res.status(200).send({
          username: user.username,
          email: user.email,
          token: createJwtToken(username, user.email),
        });
    } else return res.status(400).send("نام کاربری / رمز عبور اشتباه است");
  }
});

module.exports = router;
