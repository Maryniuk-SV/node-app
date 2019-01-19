const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/auth.controller");

authRouter.post("/auth/registration", authController.register);
authRouter.post("/auth/login", authController.sing_in);
// authRouter.get("/user/:id", authController.loginRequired);

module.exports = authRouter;
