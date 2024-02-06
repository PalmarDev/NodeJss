const express = require("express");
const cors = require("cors");
const passport = require("passport");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const Customer = require("./Models/Customer");

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

  jwt.verify(
    token.replace(/^Bearer\s/, ""),
    process.env.JWT_SECRET,
    (err, decoded) => {
      if (err) {
        console.error("Error al decodificar el token:", err.message);
        return res.status(401).json({ message: "Token no válido" });
      }

      // Asigna el usuario decodificado al objeto 'req'
      req.user = decoded;

      // Continúa con el flujo de la aplicación
      next();
    }
  );
};

app.get("/dashboard", authenticateJWT, (req, res) => {
  // Acceso permitido solo si el token es válido.
  res.json({ message: "Bienvenido a tu dashboard" });
});

app.get("/customer", authenticateJWT, async (req, res) => {
  try {
    // Verifica si el cliente ya existe en la colección
    const existingCustomer = await Customer.findOne({
      id_customer: req.user.id, // Usar req.user en lugar de req.customer
    });

    // Si el cliente ya existe, actualiza los datos
    if (existingCustomer) {
      existingCustomer.name = req.user.name; // Usar req.user en lugar de req.customer
      existingCustomer.email = req.user.email; // Usar req.user en lugar de req.customer
      existingCustomer.licence = req.user.licence; // Usar req.user en lugar de req.customer
      await existingCustomer.save();
      return res
        .status(200)
        .json({ message: "Datos del cliente actualizados correctamente" });
    }

    // Si el cliente no existe, añade un nuevo cliente a la colección
    const newCustomer = new Customer({
      id_customer: req.user.id, // Usar req.user en lugar de req.customer
      name: req.user.name, // Usar req.user en lugar de req.customer
      email: req.user.email, // Usar req.user en lugar de req.customer
      licence: req.user.licence, // Usar req.user en lugar de req.customer
    });
    await newCustomer.save();
    return res
      .status(200)
      .json({ message: "Datos del cliente almacenados correctamente" });
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
