const router = require("express").Router();
const passport = require("passport");

const User = require("../Models/Users");

router.post("/", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user && (await user.isValidPassword(req.body.password))) {
      res.send(user);
    } else {
      res.status(400).send("Invalid username or password");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
