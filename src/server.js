const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const auth = require("./middleware/verifyToken");
require("dotenv").config();

const app = express();
app.use(bodyParser.json({ extended: false }));
app.use(cors());

var linkController = require("./link");
app.use("/link", auth, linkController);

var authController = require("./auth");
app.use("/auth", authController);

app.get("", (_, res) => {
  return res.status(200).send("Wellcome to My Chat App API v1.0.0");
});

app.listen(process.env.API_PORT, process.env.API_HOST, () => {
  console.log(
    `server is listening on http://${process.env.API_HOST}:${process.env.API_PORT}`
  );
});
