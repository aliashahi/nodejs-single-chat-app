var express = require("express");
const { Link, Connection } = require("../data");
// {
// username:string,
// link:string,
// }
//////////////////utils///////////////////////////////
const { isNullOrUndefined, getGUID } = require("../utils");
/////////////////////////////////////////////////////
var router = express.Router();

const generateLink = () => {
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: 10 },
    (v, k) => {
      return characters.charAt(Math.floor(Math.random() * characters.length));
    },
    ""
  ).join("");
};

router.get("", async (req, res) => {
  let new_link = generateLink();
  let link = await Link.findOne({ username: req.user.username }).exec();
  if (link) {
    await Link.updateOne({ username: req.user.username }, { link: new_link });
    return res
      .status(200)
      .send({ username: req.user.username, link: new_link });
  } else {
    link = new Link({ username: req.user.username, link: new_link });
    link
      .save()
      .then(() =>
        res.status(200).send({ username: req.user.username, link: new_link })
      );
  }
});

router.post("", async (req, res) => {
  let friend_link = req.body.link;
  if (isNullOrUndefined(friend_link))
    return res.status(400).send({ message: "لینک معتبر نمی‌باشد" });

  let link = await Link.findOne({ link: friend_link }).exec();
  if (link) {
    let key = getGUID();
    link = new Connection({
      invited_username: link.username,
      owner_username: req.user.username,
      key,
      create_date: new Date().toUTCString(),
    });
    link.save().then(() =>
      res.status(200).send({
        invited_username: link.username,
        owner_username: req.user.username,
        key,
        create_date: new Date().toUTCString(),
      })
    );
  } else {
    return res.status(400).send({ message: "لینک معتبر نمی‌باشد" });
  }
});
module.exports = router;
