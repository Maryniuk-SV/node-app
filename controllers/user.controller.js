var User = require("../models/user.model");

exports.default = (req, res) => {
  res.send("HELLO WORLD");
};

exports.getAllUsers = (req, res) => {
  User.find({}).exec((err, users) => {
    if (err) {
      res.status(403).json({ message: "getAllUsers", error: err });
    } else {
      res.status(200).json(users);
    }
  });
};

exports.getUserById = (req, res) => {
  User.findOne({
    _id: req.params.id
  }).exec((err, user) => {
    if (err) {
      res.status(403).json({ message: "getUserById", error: err });
    } else {
      res.status(200).json(user);
    }
  });
};

exports.createUser = (req, res) => {
  var newUser = new User(req.body);

  newUser.save((err, user) => {
    if (err) {
      res.status(403).json({ message: "createUser", error: err });
    } else {
      res.status(200).json(user);
    }
  });
};

exports.updateUser = (req, res) => {
  User.findOneAndUpdate(
    {
      _id: req.body.id
    },
    {
      $set: req.body
    },
    {
      new: true
    },
    (err, newUser) => {
      if (err) {
        res.status(403).json({ message: "updateUser", error: err });
      } else {
        res.status(200).json(newUser);
      }
    }
  );
};

exports.removeUser = (req, res) => {
  User.findOneAndRemove(
    {
      _id: req.params.id
    },
    (err, user) => {
      if (err) {
        res.status(403).json({ message: "removeUser", error: err });
      } else {
        res.status(200).json({ message: `The user with id ${req.params.id} was deleted!` });
      }
    }
  );
};

exports.removeAllUsers = (req, res) => {
  User.remove({}, (err, user) => {
    if (err) {
      res.status(403).json({ message: "removeAllUsers", error: err });
    } else {
      res.status(200).json({ message: `Users were deleted!` });
    }
  });
};
