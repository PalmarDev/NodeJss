const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../Models/Users");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Ruta de login protegida con el middleware de autenticación JWT
router.post("/", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Buscar el usuario en la base de datos por nombre de usuario
    const user = await User.findOne({ username });

    // Si el usuario no existe, devolver un mensaje de error
    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Comparar la contraseña proporcionada con la contraseña almacenada en la base de datos
    const passwordMatch = await bcrypt.compare(password, user.password);

    // Si las contraseñas no coinciden, devolver un mensaje de error
    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Si las credenciales son válidas, generar un token y devolverlo como respuesta
    const token = generateToken(user);
    res.json({ message: "Login exitoso", user, token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Función para generar un token JWT
function generateToken(user) {
  const secretKey = "Stack";
  const expiresIn = "1h";

  const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn });

  return token;
}

module.exports = router;
