const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Login = require("./../models/login.model");
const { secret } = require("../config");
const authService = require("./service/auth.service");

comparePassword = function(password, hash_password) {
  return bcrypt.compareSync(password, hash_password);
};

getTokens = headers => {
  let { "x-access-token": token, refreshtoken: refreshToken } = headers;
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }
  return { token, refreshToken };
};

exports.register = (req, res) => {
  const newUser = new Login(req.body);
  newUser.hash_password = bcrypt.hashSync(req.body.password, 10);
  newUser.save(function(err, user) {
    if (err) {
      return res.status(400).send({
        message: err
      });
    } else {
      user.hash_password = undefined;
      return res.status(200).json({ user, status: 200, success: true });
    }
  });
};

exports.sing_in = (req, res, next) => {
  const { token, refreshToken } = getTokens(req.headers);

  Login.findOne(
    {
      email: req.body.email
    },
    function(err, user) {
      if (err) {
        throw err;
      }
      if (!user) {
        res
          .status(401)
          .json({ message: "Authentication failed. User not found." });
      } else if (user) {
        if (!comparePassword(req.body.password, user.hash_password)) {
          res.status(401).json({
            status: 401,
            token: null,
            message: "Authentication failed. Wrong password."
          });
        } else if (req.tokenExpired) {
          authService.newTokenPair(user).then(data => {
            authService.addRefreshToken(data.refreshToken).then(
              suc => {
                const response = data;
                response.message = "Authorized";
                user.hash_password = undefined;
                return res.status(200).json(response);
              },
              error => res.status(500).json({ error, succes: false })
            );
          });
        } else {
          user.hash_password = undefined;
          return res.json({
            token,
            refreshToken,
            success: true,
            message: "Authorized",
            status: 200
          });
        }
      }
    }
  );
};

exports.loginRequired = (req, res, next) => {
  const { token, refreshToken } = getTokens(req.headers);

  if (token) {
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        authService.findRefreshToken(refreshToken).then(
          () => {
            req.tokenExpired = true;
            next();
          },
          err => {
            return res.status(401).json({
              success: false,
              message: "Failed to authenticate token."
            });
          }
        );
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else if (!token && !refreshToken) {
    req.tokenExpired = true;
    next();
  } else {
    return res.status(401).send({
      status: 401,
      success: false,
      message: "No token provided."
    });
  }
};
