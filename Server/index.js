const express = require("express");
const cors = require("cors");
const passport = require("passport");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const app = express();
require("dotenv").config();

const publicKey = process.env.JWT_PUBLIC_KEY;

// Configura Passport.js con la estrategia JWT.
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_PRIVATE_KEY,
    },
    (payload, done) => {
      try {
        if (!payload) {
          return done(null, false, { message: "Token no proporcionado" });
        }

        // Asegúrate de que el payload contenga la información del usuario
        const customer = payload.customer; // Supongamos que el usuario está en la propiedad 'customer'

        if (!customer) {
          return done(null, false, {
            message: "Usuario no encontrado en el token",
          });
        }

        // Pasa el usuario al callback 'done'
        return done(null, customer);
      } catch (error) {
        return done(error, false, { message: "Error al decodificar el token" });
      }
    }
  )
);

// Middleware para verificar el token en rutas protegidas.
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  // Verifica el token utilizando la clave pública y el algoritmo RS256
  jwt.verify(
    token.replace(/^Bearer\s/, ""),
    publicKey, // Utiliza la clave pública para verificar el token
    { algorithms: ["RS256"] }, // Especifica el algoritmo RS256
    (err, decoded) => {
      if (err) {
        console.error("Error al decodificar el token:", err.message);
        return res.status(401).json({ message: "Token no válido" });
      }

      // Asigna el usuario decodificado al objeto 'req'
      req.user = decoded;

      if (!req.user) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      } else if (req.user.licence.status === "inactive") {
        return res.status(401).json({ message: "Licencia inactiva" });
      } else if (req.user.licence.active === false) {
        return res.status(401).json({ message: "Sistema inactivo" });
      } else if (req.user.licence.expiration_date < Date.now()) {
        return res.status(401).json({ message: "Licencia expirada" });
      } else {
        res.status(200).json({ message: "Token verificado" });
        // Continúa con el flujo de la aplicación
        next();
      }
    }
  );
};

app.get("/dashboard", authenticateJWT, (req, res) => {
  // Acceso permitido solo si el token es válido.
  res.json({ message: "Bienvenido a tu dashboard" });
});

app.get("/customer", authenticateJWT, async (req, res) => {
  try {
    const customer = {
      name: req.user.name,
      email: req.user.email,
      licence: req.user.licence,
    };
    return res.status(200).json(customer);
  } catch (error) {
    console.error("Error al almacenar los datos del cliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

const port = 4000;

mongoose.connect("mongodb://localhost:27017/Server").then(() => {
  console.log("Connected to MongoDB");
});

app.use(cors());
app.use(express.json());

const router = require("./Routers/register");
const routerlogin = require("./Routers/login");

app.use("/register", router);
app.use("/login", routerlogin);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
