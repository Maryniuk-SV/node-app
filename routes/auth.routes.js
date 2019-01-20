const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/auth.controller");
const RefreshToken = require("./../models/refresh-token.model");

authRouter.post("/auth/registration", authController.register);
authRouter.post("/auth/login", [
  authController.loginRequired,
  authController.sing_in
]);

authRouter.get("/auth/tokens", (req, res, next) => {
  RefreshToken.find({}).exec((err, tokens) => {
    if (err) {
    } else {
      res.json(tokens);
    }
  });
});

authRouter.delete("/auth/token/:id", (req, res, next) => {
  RefreshToken.findOneAndRemove(
    {
      _id: req.params.id
    },
    (err, user) => {
      if (err) {
        res.json({ message: "token wasnt deleted", error: err });
      } else {
        res.json({ message: `token was deleted` });
      }
    }
  );
});

// authRouter.get("/user/:id", authController.loginRequired);

module.exports = authRouter;
