const jwt = require("jsonwebtoken");
const randtoken = require("rand-token");
const RefreshToken = require("../../models/refresh-token.model");
const { secret } = require("../../config");

exports.newTokenPair = async user => {
  const token = jwt.sign(
    { email: user.email, fullName: user.fullName, _id: user._id },
    secret,
    {
      expiresIn: "15min" // expires in 15 minutes
    }
  );
  const refreshToken = randtoken.uid(256);
  return { token, refreshToken, success: true };
};

exports.findRefreshToken = refreshToken => {
  return new Promise((resolve, reject) => {
    RefreshToken.findOne({
      refreshToken
    }).exec((err, token) => {
      if (err) {
        reject(err);
      } else {
        this.removeRefreshToken(refreshToken).then(
          suc => resolve(),
          err => reject(err)
        );
      }
    });
  });
};

exports.addRefreshToken = refreshToken => {
  RefreshToken.remove({});
  return new Promise((resolve, reject) => {
    const newRefreshToken = new RefreshToken({
      refreshToken
    });

    newRefreshToken.save(function(err, token) {
      if (err) {
        reject({
          error: err,
          success: false,
          message: "Refresh token wasnt saved"
        });
      } else {
        resolve({
          success: true,
          message: "Refresh token was saved"
        });
      }
    });
  });
};

exports.removeRefreshToken = refreshToken => {
  return new Promise((resolve, reject) => {
    RefreshToken.findOneAndDelete(
      {
        refreshToken
      },
      (err, token) => {
        if (err) {
          reject({
            message: "refresh token wasnt deleted",
            success: false,
            error: err
          });
        } else {
          resolve({ message: `The refresh token was deleted!`, success: true });
        }
      }
    );
  });
};
