const express = require("express");
const cors = require("cors");
const passport = require("passport");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const app = express();
require("dotenv").config();

// Configura Passport.js con la estrategia JWT.
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    (payload, done) => {
      try {
        if (!payload) {
          return done(null, false, { message: "Token no proporcionado" });
        }

        // Asegúrate de que el payload contenga la información del usuario
        const user = payload.user; // Supongamos que el usuario está en la propiedad 'user'

        if (!user) {
          return done(null, false, {
            message: "Usuario no encontrado en el token",
          });
        }

        // Pasa el usuario al callback 'done'
        return done(null, user);
      } catch (error) {
        return done(error, false, { message: "Error al decodificar el token" });
      }
    }
  )
);

// Middleware para verificar el token en rutas protegidas.
const authenticateJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) return res.status(500).json({ message: "Internal Server Error" });

    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    jwt.verify(
      token.replace(/^Bearer\s/, ""),
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) {
          console.error("Error al decodificar el token:", err.message);
          return res.status(401).json({ message: "Token no válido" });
        }

        // Imprime todo el contenido del objeto decoded
        console.log("Token decodificado:", decoded);

        // Asigna el usuario al objeto 'req'
        user = decoded.userId;

        // Continúa con el flujo de la aplicación
        next();
      }
    );

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    next();
  })(req, res, next);
};

app.get("/dashboard", authenticateJWT, (req, res) => {
  // Acceso permitido solo si el token es válido.
  res.json({ message: "Bienvenido a tu dashboard" });
});

// Configura otras rutas y escucha en un puerto específico.

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
