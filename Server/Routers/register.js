// Ejemplo usando Express
const express = require("express");
const router = express.Router();
const User = require("../Models/Users");

router.post("/", async (req, res) => {
  try {
    const newUser = new User({
      name: "Dorian",
      email: "dorianmatos75@gmail.com",
      password: "12345678",
    });

    await newUser.save();
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
