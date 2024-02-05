const express = require("express");
const cors = require("cors");
const passport = require("passport");
const mongoose = require("mongoose");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const app = express();
const secretKey = "secretkey";

// Configura Passport.js con la estrategia JWT.
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretKey, // Asegúrate de que sea el mismo
    },
    (payload, done) => {
      done(null, payload);
    }
  )
);

// Middleware para verificar el token en rutas protegidas.
const authenticateJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) return res.status(500).json({ message: "Internal Server Error" });

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // Asigna el usuario autenticado al objeto 'req'
    req.user = user;
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
