const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL);

const User = mongoose.model("User", {
  id: String,
  email: String,
  password: String,
  username: String,
});

const Link = mongoose.model("Link", { username: String, link: String });

const Connection = mongoose.model("Connection", {
  owner_username: String,
  invited_username: String,
  key: String,
  create_date: String,
});

module.exports = { mongoose, Link, Connection, User };
