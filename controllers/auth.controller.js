const jwt = require("jsonwebtoken");
const randtoken = require("rand-token");
const bcrypt = require("bcryptjs");
const Login = require("./../models/login.model");
const RefreshToken = require("./../models/refresh-token.model");
const { secret } = require("../config");
const refreshTokens = {};

comparePassword = function(password, hash_password) {
  return bcrypt.compareSync(password, hash_password);
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
      return res.json({ user, status: 200, success: true });
    }
  });
};

exports.sing_in = (req, res) => {
  console.log("req, res: ");
  Login.findOne(
    {
      email: req.body.email
    },
    function(err, user) {
      if (err) {
        console.log("err: ", err);
        throw err;
      }
      if (!user) {
        console.log('user: ', user);
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
        } else {
          const token = jwt.sign(
            { email: user.email, fullName: user.fullName, _id: user._id },
            secret,
            {
              expiresIn: "15min" // expires in 15 minutes
            }
          );

          const newRefreshToken = randtoken.uid(256);
          const refreshToken = new RefreshToken({
            refreshToken: newRefreshToken
          });
          console.log(refreshToken)
          refreshToken.save(function(err, user) {
            if (err) {
              console.log('err: ', err);
              return res.status(400).send({
                error: err,
                message: "Refresh token dont saved"
              });
            } else {
              user.hash_password = undefined;
              return res.json({
                success: true,
                token,
                refreshToken: newRefreshToken
              });
            }
          });
        }
      }
    }
  );
};

exports.loginRequired = (req, res, next) => {
  let token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (token.startsWith("Bearer ")) {
    // Remove Bearer from string
    token = token.slice(7, token.length);
  }
  if (token) {
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        console.log("err: ", err);
        return res.json({
          success: false,
          message: "Failed to authenticate token."
        });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(401).send({
      status: 401,
      success: false,
      message: "No token provided."
    });
  }
};
