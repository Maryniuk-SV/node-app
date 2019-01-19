const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const port = 8888;
const { database } = require("./config");
const userRouter = require("./routes/user.routes");
const expressSwagger = require("express-swagger-generator")(app);
const swaggerUi = require("express-swaggerize-ui");

mongoose.connect(
  database,
  { useNewUrlParser: true }
);
mongoose.set("useCreateIndex", true);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use("/api", userRouter);

let options = {
  swaggerDefinition: {
    info: {
      description: "This is a sample server",
      title: "Swagger",
      version: "1.0.0"
    },
    host: "localhost:8881",
    basePath: "/api",
    produces: ["application/json", "application/xml"],
    schemes: ["http"]
  },
  basedir: __dirname, //app absolute path
  files: ["./routes/*.js"] //Path to the API handle folder
};
expressSwagger(options);

app.use("/api-docs.json", function(req, res) {
  res.json(require("./path/to/swaggerize/docs.json"));
});
app.use("/api-docs", swaggerUi());

const server = app.listen(port, function() {
  console.log(`Server is listening ${port} port`);
});

//===================================================
//    Socket IO
//===================================================

const io = require("socket.io").listen(server);
var User = require("./models/user.model");

io.on("connection", socket => {
  console.log("connected socket: ", socket.id);

  socket.on("getUsers", () => {
    User.find({}).exec((err, users) => {
      if (err) {
        socket.emit("error", err);
      } else {
        socket.emit("users", users);
      }
    });
  });

  socket.on("addUser", user => {
    var newUser = new User(user);

    newUser.save((err, user) => {
      if (err) {
        socket.emit("error", err);
      } else {
        socket.emit("user", [user]);
      }
    });
  });

  socket.on("removeUser", id => {
    User.findOneAndRemove(
      {
        _id: id
      },
      (err, user) => {
        if (err) {
          socket.emit("error", err);
        } else {
          socket.emit("user", [user]);
        }
      }
    );
  });
});

//========================================================
